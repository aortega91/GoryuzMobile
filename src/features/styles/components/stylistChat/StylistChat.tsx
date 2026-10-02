/**
 * StylistChat — conversation with the AI stylist (zena `ChatModal`).
 *
 * Mounted by Home while `styles.stylistChatDraft` is non-null, so both Styles
 * ("Consultar a tu estilista") and Agenda ("Sugerencia IA") can open it. The
 * session lives in this component; closing it (back arrow, hardware back or
 * "finish and new chat") stores it through POST /chat, like zena's endSession.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import UpgradeModal, { RequiredPlan, requiredPlanFromError } from '@components/UpgradeModal';
import {
  ArrowLeftIcon,
  BotIcon,
  CheckIcon,
  GemIcon,
  HistoryIcon,
  PlusIcon,
  RotateCcwIcon,
  SaveIcon,
  SendIcon,
  SparklesIcon,
} from '@assets/icons';
import useStylesTheme from '@hooks/useStylesTheme';
import { AppDispatch, RootState } from '@utilities/store';
import toast from '@utilities/toast';
import { loadProfile } from '@features/home/profileSlice';
import { loadCollection } from '@features/collection/collectionSlice';
import { ClothingItem } from '@features/collection/types';
import { addOutfit, closeStylistChat, loadOutfits } from '../../stylesSlice';
import { asDataUrl, combineOutfit, generateOutfitName } from '../../api/stylesGenerateApi';
import {
  COMBINE_OUTFIT_GEM_COST,
  STYLIST_CHAT_GEM_COST,
  StylistChatMessage,
  StylistChatSession,
  newChatId,
  parseStylistResponse,
  saveStylistChatSession,
  sendStylistMessage,
  usesAdvancedModel,
} from '../../api/stylistChatApi';
import ChatText from './ChatText';
import ClosetPickerSheet from './ClosetPickerSheet';
import StylistChatHistory from './StylistChatHistory';
import StylistChatInfoSheet from './StylistChatInfoSheet';

/** A message that failed (or whose reply failed) stays on screen but is not sent back as history. */
type ChatMessage = StylistChatMessage & { excluded?: boolean };

interface Naming {
  messageId: string;
  name: string;
  generating: boolean;
}

function newSession(welcome: string | null): StylistChatSession {
  return {
    id: newChatId(),
    startTime: new Date().toISOString(),
    messages: welcome ? [{ id: newChatId(), role: 'model', text: welcome }] : [],
  };
}

/** Stores a session that has at least one question in it (zena: more than the welcome). */
function persistSession(session: StylistChatSession) {
  const messages = (session.messages as ChatMessage[]).filter(m => !m.excluded);
  if (!messages.some(m => m.role === 'user')) return;
  // apiRequest already logs the failure to Crashlytics; losing history is not worth an error toast.
  saveStylistChatSession({ ...session, messages }).catch(() => {});
}

function StylistChat() {
  const { t, i18n } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();

  const draft = useSelector((state: RootState) => state.styles.stylistChatDraft) ?? '';
  const profile = useSelector((state: RootState) => state.profile.data);
  const closet = useSelector((state: RootState) => state.collection.items);
  const closetStatus = useSelector((state: RootState) => state.collection.status);
  const savedOutfits = useSelector((state: RootState) => state.styles.outfits);
  const outfitsStatus = useSelector((state: RootState) => state.styles.outfitsStatus);
  const latitude = useSelector((state: RootState) => state.location.latitude);
  const longitude = useSelector((state: RootState) => state.location.longitude);

  const aiName = profile?.aiName || 'GORYUZ';
  // zena only greets on the advanced model; on the basic one the chat opens empty.
  const welcome = usesAdvancedModel(profile) ? t('styles.stylistChat.welcome', { name: aiName }) : null;

  const [session, setSession] = useState<StylistChatSession>(() => newSession(welcome));
  const [input, setInput] = useState(draft);
  const [loading, setLoading] = useState(false);
  const [gemsSpent, setGemsSpent] = useState(0);
  const [tab, setTab] = useState<'chat' | 'history'>('chat');
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [naming, setNaming] = useState<Naming | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState<RequiredPlan | null>(null);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  // The stylist needs the closet and saved looks; Agenda may open it before Styles loaded them.
  useEffect(() => {
    if (closetStatus === 'idle') dispatch(loadCollection());
    if (outfitsStatus === 'idle') dispatch(loadOutfits());
  }, [dispatch, closetStatus, outfitsStatus]);

  const location = useMemo(
    () => (latitude != null && longitude != null ? { lat: latitude, lon: longitude } : null),
    [latitude, longitude],
  );

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setSession(prev => ({
      ...prev,
      messages: prev.messages.map(m => (m.id === id ? { ...m, ...patch } : m)),
    }));
  }, []);

  const appendMessage = useCallback((message: ChatMessage) => {
    setSession(prev => ({ ...prev, messages: [...prev.messages, message] }));
  }, []);

  // ─── Session lifecycle ─────────────────────────────────────────────────────

  const endSession = () => {
    if (loading) return;
    persistSession(session);
    dispatch(closeStylistChat());
  };

  const resetSession = () => {
    persistSession(session);
    setSession(newSession(welcome));
    setGemsSpent(0);
    setNaming(null);
    setSavedIds([]);
    setInput('');
  };

  // ─── Sending ───────────────────────────────────────────────────────────────

  const send = async (text: string, picked?: ClothingItem[]) => {
    const message = text.trim();
    if (!message || loading) return;

    const history = (session.messages as ChatMessage[]).filter(m => !m.excluded);
    const userMessage: ChatMessage = {
      id: newChatId(),
      role: 'user',
      text: message,
      outfitSuggestion: picked?.length ? picked : undefined,
    };
    appendMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const reply = await sendStylistMessage({
        message,
        // The picked pieces travel apart: on screen the question reads as asked.
        selectedItems: picked?.map(i => i.name),
        history,
        context: { closet, savedOutfits, profile, location },
      });
      setGemsSpent(n => n + STYLIST_CHAT_GEM_COST);
      dispatch(loadProfile());
      const parsed = parseStylistResponse(reply, closet, t('styles.stylistChat.fallbackSuggestion'));
      appendMessage({
        id: newChatId(),
        role: 'model',
        text: parsed.text,
        outfitSuggestion: parsed.outfit?.length ? parsed.outfit : undefined,
      });
    } catch (err) {
      const plan = requiredPlanFromError(err);
      if (plan) setUpgradePlan(plan);
      updateMessage(userMessage.id, { excluded: true });
      appendMessage({ id: newChatId(), role: 'model', text: t('styles.stylistChat.error'), excluded: true });
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPicked = (items: ClothingItem[]) => {
    setPickerOpen(false);
    if (items.length > 0) send(t('styles.stylistChat.pickedQuestion'), items);
  };

  // ─── Suggestion actions ────────────────────────────────────────────────────

  /** Renders the look on the avatar — only on request, the button says what it costs. */
  const generateLook = async (message: ChatMessage) => {
    const items = message.outfitSuggestion;
    if (!items?.length || !profile?.avatarImage || generatingFor) return;
    setGeneratingFor(message.id);
    try {
      const b64 = await combineOutfit({ items, avatarImage: profile.avatarImage });
      setGemsSpent(n => n + COMBINE_OUTFIT_GEM_COST);
      dispatch(loadProfile());
      updateMessage(message.id, { generatedImage: asDataUrl(b64) });
    } catch (err) {
      const plan = requiredPlanFromError(err);
      if (plan) setUpgradePlan(plan);
      else toast.error(t('styles.stylistChat.generateError'));
    } finally {
      setGeneratingFor(null);
    }
  };

  /** zena `SaveOutfitModal`: the stylist names the look, the user can change it. */
  const startSave = async (message: ChatMessage) => {
    const items = message.outfitSuggestion ?? [];
    setNaming({ messageId: message.id, name: '', generating: true });
    let name: string;
    try {
      name = await generateOutfitName(
        items.map(i => ({ name: i.name, category: i.category })),
        i18n.language,
      );
    } catch {
      name = t('styles.stylistChat.defaultName');
    }
    setNaming(prev => (prev?.messageId === message.id ? { ...prev, name, generating: false } : prev));
  };

  const confirmSave = async (message: ChatMessage) => {
    const name = naming?.name.trim();
    if (!name || !message.outfitSuggestion?.length) return;
    setSavingId(message.id);
    try {
      await dispatch(
        addOutfit({
          name,
          itemIds: message.outfitSuggestion.map(i => i.id),
          imageData: message.generatedImage,
          source: 'ai',
        }),
      ).unwrap();
      setSavedIds(prev => [...prev, message.id]);
      setNaming(null);
      toast.success(t('styles.stylistChat.saved', { name }));
    } catch {
      // addOutfit.rejected already logs to Crashlytics
      toast.error(t('styles.generatorSaveError'));
    } finally {
      setSavingId(null);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const renderSuggestionActions = (message: ChatMessage) => {
    if (savedIds.includes(message.id)) {
      return (
        <View style={[styles.savedRow, { borderColor: s.chatSaveBorder }]}>
          <CheckIcon size={14} color={s.chatSuggestionLabel} strokeWidth={2.5} />
          <Text style={[styles.savedText, { color: s.chatSuggestionLabel }]}>
            {t('styles.stylistChat.savedBadge')}
          </Text>
        </View>
      );
    }

    if (naming?.messageId === message.id) {
      const saving = savingId === message.id;
      const busy = saving || naming.generating;
      return (
        <View style={styles.namingRow}>
          <TextInput
            value={naming.name}
            onChangeText={name => setNaming(prev => (prev ? { ...prev, name } : prev))}
            placeholder={naming.generating ? t('styles.stylistChat.naming') : t('styles.stylistChat.namePlaceholder')}
            placeholderTextColor={s.chatInputPlaceholder}
            editable={!busy}
            style={[
              styles.nameInput,
              { backgroundColor: s.chatInputBackground, borderColor: s.chatInputBorder, color: s.chatInputText },
              busy && styles.disabled,
            ]}
          />
          <Touchable
            onPress={() => confirmSave(message)}
            disabled={busy || !naming.name.trim()}
            borderRadius={12}
            accessibilityLabel={t('styles.stylistChat.saveLook')}
            style={[
              styles.nameConfirm,
              { backgroundColor: s.chatGenerateBackground },
              (busy || !naming.name.trim()) && styles.disabled,
            ]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={s.chatGenerateText} />
            ) : (
              <CheckIcon size={18} color={s.chatGenerateText} strokeWidth={2.5} />
            )}
          </Touchable>
        </View>
      );
    }

    const generating = generatingFor === message.id;
    return (
      <View style={styles.actions}>
        {!message.generatedImage && !!profile?.avatarImage && (
          <Touchable
            onPress={() => generateLook(message)}
            disabled={!!generatingFor}
            borderRadius={12}
            style={[
              styles.actionBtn,
              { backgroundColor: s.chatGenerateBackground },
              !!generatingFor && styles.disabled,
            ]}
          >
            {generating ? (
              <>
                <ActivityIndicator size="small" color={s.chatGenerateText} />
                <Text style={[styles.actionText, { color: s.chatGenerateText }]}>
                  {t('styles.stylistChat.generatingLook')}
                </Text>
              </>
            ) : (
              <>
                <SparklesIcon size={14} color={s.chatGenerateText} />
                <Text style={[styles.actionText, { color: s.chatGenerateText }]}>
                  {t('styles.stylistChat.generateLook', { cost: COMBINE_OUTFIT_GEM_COST })}
                </Text>
              </>
            )}
          </Touchable>
        )}
        <Touchable
          onPress={() => startSave(message)}
          disabled={generating}
          borderRadius={12}
          style={[
            styles.actionBtn,
            styles.actionBtnOutline,
            { backgroundColor: s.chatSaveBackground, borderColor: s.chatSaveBorder },
            generating && styles.disabled,
          ]}
        >
          <SaveIcon size={14} color={s.chatSaveText} />
          <Text style={[styles.actionText, { color: s.chatSaveText }]}>{t('styles.stylistChat.saveLook')}</Text>
        </Touchable>
      </View>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const textColor = isUser ? s.chatUserBubbleText : s.chatModelBubbleText;
    return (
      <View style={[styles.row, isUser ? styles.rowUser : styles.rowModel]}>
        {!isUser && (
          <View style={[styles.smallBot, { backgroundColor: s.chatBotSmallBackground }]}>
            <BotIcon size={16} color={s.chatBotSmallIcon} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? [styles.bubbleUser, { backgroundColor: s.chatUserBubble }]
              : [styles.bubbleModel, { backgroundColor: s.chatModelBubble, borderColor: s.chatModelBubbleBorder }],
          ]}
        >
          {!!item.text && <ChatText text={item.text} color={textColor} />}
          {!!item.outfitSuggestion?.length && (
            <View style={styles.suggestion}>
              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: textColor }]} />
                <Text style={[styles.suggestionLabel, { color: textColor }]}>
                  {isUser ? t('styles.stylistChat.selectedItems') : t('styles.stylistChat.outfitSuggestion')}
                </Text>
                <View style={[styles.divider, { backgroundColor: textColor }]} />
              </View>
              {item.generatedImage ? (
                <AuthedImage data={item.generatedImage} style={styles.generated} resizeMode="contain" />
              ) : (
                <View style={styles.itemGrid}>
                  {item.outfitSuggestion.map(piece => (
                    <AuthedImage key={piece.id} data={piece.imageData} style={styles.itemThumb} resizeMode="cover" />
                  ))}
                </View>
              )}
              {!isUser && renderSuggestionActions(item)}
            </View>
          )}
        </View>
      </View>
    );
  };

  const visibleMessages = (session.messages as ChatMessage[]).filter(
    m => m.text || m.outfitSuggestion?.length,
  );
  const canSend = input.trim().length > 0 && !loading;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={endSession}>
      <SafeAreaView style={[styles.root, { backgroundColor: s.chatBackground }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Header — tapping the stylist opens what she can do and what it costs */}
          <View style={[styles.header, { borderBottomColor: s.chatHeaderBorder }]}>
            <Touchable
              onPress={endSession}
              disabled={loading}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              borderRadius={20}
              accessibilityLabel={t('styles.stylistChat.back')}
              style={styles.headerBtn}
            >
              <ArrowLeftIcon size={22} color={s.chatTitle} />
            </Touchable>
            <Touchable
              onPress={() => setInfoOpen(true)}
              borderRadius={12}
              accessibilityLabel={t('styles.stylistChat.infoA11y')}
              style={styles.identity}
            >
              <View>
                <View style={[styles.bot, { backgroundColor: s.chatBotBackground }]}>
                  <BotIcon size={20} color={s.chatBotIcon} />
                </View>
                <View style={[styles.onlineDot, { backgroundColor: s.chatOnlineDot, borderColor: s.chatOnlineDotRing }]} />
              </View>
              <View style={styles.identityText}>
                <Text style={[styles.name, { color: s.chatTitle }]} numberOfLines={1}>
                  {aiName}
                </Text>
                <Text style={[styles.status, { color: s.chatSubtitle }]} numberOfLines={1}>
                  {t('styles.stylistChat.onlineAssistant')}
                </Text>
              </View>
            </Touchable>
            <Touchable
              onPress={() => setTab(prev => (prev === 'chat' ? 'history' : 'chat'))}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              borderRadius={20}
              accessibilityLabel={tab === 'chat' ? t('styles.stylistChat.history') : t('styles.stylistChat.chat')}
              style={styles.headerBtn}
            >
              <HistoryIcon size={22} color={tab === 'history' ? s.chatHeaderIconActive : s.chatHeaderIcon} />
            </Touchable>
          </View>

          {/* Gems spent in this chat — every charged action adds its own price */}
          <View style={[styles.gemBar, { backgroundColor: s.chatGemBarBackground }]}>
            <Text style={[styles.gemBarText, { color: s.chatGemBarText }]}>{t('styles.stylistChat.gemsSpent')}</Text>
            <View style={styles.gemValue}>
              <GemIcon size={14} color={s.chatGemIcon} />
              <Text style={[styles.gemValueText, { color: s.chatGemValue }]}>{gemsSpent}</Text>
            </View>
          </View>

          {tab === 'history' ? (
            <StylistChatHistory />
          ) : (
            <>
              <FlatList
                ref={listRef}
                data={visibleMessages}
                keyExtractor={m => m.id}
                renderItem={renderMessage}
                style={styles.root}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
                ListFooterComponent={
                  loading ? (
                    <View style={[styles.row, styles.rowModel]}>
                      <View style={[styles.smallBot, { backgroundColor: s.chatBotSmallBackground }]}>
                        <BotIcon size={16} color={s.chatBotSmallIcon} />
                      </View>
                      <View style={[styles.bubble, styles.bubbleModel, styles.typing, { backgroundColor: s.chatModelBubble }]}>
                        <ActivityIndicator size="small" color={s.chatTypingDot} />
                      </View>
                    </View>
                  ) : null
                }
              />

              <View style={[styles.composer, { borderTopColor: s.chatHeaderBorder }]}>
                <View style={[styles.inputBox, { backgroundColor: s.chatInputBackground, borderColor: s.chatInputBorder }]}>
                  <Touchable
                    onPress={() => setPickerOpen(true)}
                    disabled={loading || closet.length === 0}
                    borderRadius={18}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    accessibilityLabel={t('styles.stylistChat.pickItemsA11y')}
                    style={[styles.inputIcon, (loading || closet.length === 0) && styles.disabled]}
                  >
                    <PlusIcon size={22} color={s.chatInputIcon} />
                  </Touchable>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder={t('styles.stylistChat.typeMessage')}
                    placeholderTextColor={s.chatInputPlaceholder}
                    editable={!loading}
                    multiline
                    style={[styles.input, { color: s.chatInputText }, loading && styles.disabled]}
                  />
                  <Touchable
                    onPress={() => send(input)}
                    disabled={!canSend}
                    borderRadius={12}
                    accessibilityLabel={t('styles.stylistChat.sendA11y', { cost: STYLIST_CHAT_GEM_COST })}
                    style={[
                      styles.send,
                      { backgroundColor: canSend ? s.chatSendBackground : s.chatSendDisabledBackground },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={s.chatSendIcon} />
                    ) : (
                      <SendIcon size={18} color={s.chatSendIcon} />
                    )}
                  </Touchable>
                </View>
                {!loading && session.messages.some(m => m.role === 'user') && (
                  <Touchable onPress={resetSession} borderRadius={8} style={styles.reset}>
                    <RotateCcwIcon size={14} color={s.chatResetText} />
                    <Text style={[styles.resetText, { color: s.chatResetText }]}>
                      {t('styles.stylistChat.resetChat')}
                    </Text>
                  </Touchable>
                )}
              </View>
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>

      {pickerOpen && (
        <ClosetPickerSheet closet={closet} onClose={() => setPickerOpen(false)} onConfirm={handleItemsPicked} />
      )}
      {infoOpen && <StylistChatInfoSheet aiName={aiName} onClose={() => setInfoOpen(false)} />}
      <UpgradeModal
        visible={upgradePlan !== null}
        requiredPlan={upgradePlan ?? 'vip'}
        onUpgrade={() => setUpgradePlan(null)}
        onClose={() => setUpgradePlan(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerBtn: { padding: 6 },
  identity: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  bot: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  onlineDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  identityText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700' },
  status: { fontSize: 11 },
  gemBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  gemBarText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.6 },
  gemValue: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gemValueText: { fontSize: 14, fontWeight: '700' },
  list: { padding: 16, gap: 18 },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  rowUser: { justifyContent: 'flex-end' },
  rowModel: { justifyContent: 'flex-start' },
  smallBot: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 18 },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleModel: { borderBottomLeftRadius: 4, borderWidth: 1 },
  typing: { paddingHorizontal: 18 },
  suggestion: { marginTop: 12, gap: 10 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  divider: { flex: 1, height: StyleSheet.hairlineWidth, opacity: 0.3 },
  suggestionLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.7 },
  itemGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  itemThumb: { width: 72, height: 72, borderRadius: 12 },
  generated: { width: 220, height: 300, borderRadius: 12 },
  actions: { gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionBtnOutline: { borderWidth: 1 },
  actionText: { fontSize: 12, fontWeight: '700' },
  namingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  nameConfirm: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  savedText: { fontSize: 12, fontWeight: '700' },
  composer: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 6, borderTopWidth: StyleSheet.hairlineWidth, gap: 6 },
  inputBox: { flexDirection: 'row', alignItems: 'flex-end', borderWidth: 1, borderRadius: 18, padding: 5 },
  inputIcon: { padding: 7 },
  input: { flex: 1, fontSize: 15, maxHeight: 120, paddingHorizontal: 4, paddingVertical: 8 },
  send: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: 4 },
  resetText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  disabled: { opacity: 0.6 },
});

export default StylistChat;
