import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import PermissionModal from '@components/PermissionModal';
import { ImageIcon, CloseIcon, CheckIcon } from '@assets/icons';
import useSupportTheme from '@hooks/useSupportTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import { logError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import {
  fetchTickets,
  createTicket,
  SupportTicket,
} from '../api/supportApi';

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = 'new' | 'history';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string, locale: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── TicketCard ───────────────────────────────────────────────────────────────

interface TicketCardProps {
  ticket: SupportTicket;
  colors: ReturnType<typeof useSupportTheme>['support'];
  locale: string;
  t: (key: string) => string;
}

function TicketCard({ ticket, colors, locale, t }: TicketCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isPending = ticket.status === 'pending';

  return (
    <Touchable
      style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder }]}
      borderRadius={14}
      onPress={() => setExpanded(prev => !prev)}
    >
      {/* Row: title + badge */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.sectionTitle }]} numberOfLines={expanded ? undefined : 1}>
          {ticket.title}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isPending ? colors.statusPendingBg : colors.statusResolvedBg,
              borderColor: isPending ? colors.statusPendingBorder : colors.statusResolvedBorder,
            },
          ]}
        >
          <Text style={[styles.statusText, { color: isPending ? colors.statusPendingText : colors.statusResolvedText }]}>
            {isPending ? t('support.statusPending') : t('support.statusResolved')}
          </Text>
        </View>
      </View>

      <Text style={[styles.cardDate, { color: colors.dateText }]}>
        {formatDate(ticket.createdAt, locale)}
      </Text>

      {expanded && (
        <View style={styles.cardBody}>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <Text style={[styles.cardDescription, { color: colors.fieldLabel }]}>
            {ticket.description}
          </Text>

          {ticket.evidenceImage ? (
            <Image
              source={{ uri: ticket.evidenceImage }}
              style={styles.evidencePreview}
              resizeMode="cover"
            />
          ) : null}

          {ticket.adminResponse ? (
            <View style={[styles.adminResponse, { backgroundColor: colors.adminResponseBg, borderColor: colors.adminResponseBorder }]}>
              <Text style={[styles.adminResponseLabel, { color: colors.adminResponseLabel }]}>
                {t('support.adminResponse')}
              </Text>
              <Text style={[styles.adminResponseText, { color: colors.adminResponseText }]}>
                {ticket.adminResponse}
              </Text>
              {ticket.adminResponseAt ? (
                <Text style={[styles.cardDate, { color: colors.dateText }]}>
                  {formatDate(ticket.adminResponseAt, locale)}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </Touchable>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

function Support() {
  const theme = useSupportTheme();
  const st = theme.support;
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();

  const { openCamera, openGallery, blockedPermission, dismissPermissionModal, handleOpenSettings } =
    useCameraPermission();

  const [activeTab, setActiveTab] = useState<ActiveTab>('new');

  // ─── New ticket form state ───────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceBase64, setEvidenceBase64] = useState<string | null>(null);
  const [evidenceMime, setEvidenceMime] = useState<string>('image/jpeg');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── History state ───────────────────────────────────────────────────────────
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const descriptionRef = useRef<TextInput>(null);

  // ─── Load tickets ────────────────────────────────────────────────────────────

  const loadTickets = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingTickets(true);
    setTicketsError(false);
    try {
      const data = await fetchTickets();
      setTickets(data);
    } catch (err) {
      logError(err, 'support:loadTickets');
      setTicketsError(true);
    } finally {
      setIsLoadingTickets(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadTickets(true);
  }, [loadTickets]);

  // ─── Image attachment ────────────────────────────────────────────────────────

  const handleAttachImage = useCallback(() => {
    Alert.alert(t('support.attachEvidence'), undefined, [
      {
        text: t('support.fromCamera'),
        onPress: async () => {
          const result = await openCamera();
          if (result.status !== 'success') return;
          const asset = result.response.assets?.[0];
          if (asset?.base64) {
            setEvidenceBase64(asset.base64);
            setEvidenceMime(asset.type ?? 'image/jpeg');
          }
        },
      },
      {
        text: t('support.fromGallery'),
        onPress: async () => {
          const result = await openGallery();
          if (result.status !== 'success') return;
          const asset = result.response.assets?.[0];
          if (asset?.base64) {
            setEvidenceBase64(asset.base64);
            setEvidenceMime(asset.type ?? 'image/jpeg');
          }
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  }, [t, openCamera, openGallery]);

  // ─── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    const trimmedTitle = title.trim();
    const trimmedDesc = description.trim();

    if (!trimmedTitle || !trimmedDesc) {
      Alert.alert(t('common.error'), t('support.fieldRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: trimmedDesc,
        ...(evidenceBase64
          ? { evidenceImage: `data:${evidenceMime};base64,${evidenceBase64}` }
          : {}),
      };
      await createTicket(payload);
      toast.success(t('support.submitSuccess'));
      setTitle('');
      setDescription('');
      setEvidenceBase64(null);
      setActiveTab('history');
      loadTickets(true);
    } catch (err) {
      logError(err, 'support:createTicket');
      Alert.alert(t('common.error'), t('support.submitError'));
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, evidenceBase64, evidenceMime, t, loadTickets]);

  // ─── Render new ticket form ──────────────────────────────────────────────────

  const renderNewTicket = () => (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: st.fieldLabel }]}>
            {t('support.ticketTitle')}
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: st.inputBackground, borderColor: st.inputBorder, color: st.inputText },
              isSubmitting && styles.disabled,
            ]}
            value={title}
            onChangeText={setTitle}
            editable={!isSubmitting}
            placeholder={t('support.ticketTitlePlaceholder')}
            placeholderTextColor={st.inputPlaceholder}
            returnKeyType="next"
            onSubmitEditing={() => descriptionRef.current?.focus()}
            blurOnSubmit={false}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: st.fieldLabel }]}>
            {t('support.description')}
          </Text>
          <TextInput
            ref={descriptionRef}
            style={[
              styles.input,
              styles.inputMultiline,
              { backgroundColor: st.inputBackground, borderColor: st.inputBorder, color: st.inputText },
              isSubmitting && styles.disabled,
            ]}
            value={description}
            onChangeText={setDescription}
            editable={!isSubmitting}
            placeholder={t('support.descriptionPlaceholder')}
            placeholderTextColor={st.inputPlaceholder}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Evidence attachment */}
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, { color: st.fieldLabel }]}>
            {t('support.evidence')}
          </Text>

          {evidenceBase64 ? (
            <View style={styles.evidenceContainer}>
              <Image
                source={{ uri: `data:${evidenceMime};base64,${evidenceBase64}` }}
                style={styles.evidencePreview}
                resizeMode="cover"
              />
              <Touchable
                style={[styles.removeImageBtn, { backgroundColor: 'rgba(0,0,0,0.55)' }]}
                borderRadius={14}
                onPress={() => setEvidenceBase64(null)}
                disabled={isSubmitting}
              >
                <CloseIcon size={14} color="#FFFFFF" strokeWidth={2.5} />
              </Touchable>
              <Touchable
                style={[styles.changeImageBtn, { backgroundColor: st.attachButtonBg, borderColor: st.attachButtonBorder }]}
                borderRadius={8}
                onPress={handleAttachImage}
                disabled={isSubmitting}
              >
                <Text style={[styles.changeImageText, { color: st.attachButtonText }]}>
                  {t('support.changeImage')}
                </Text>
              </Touchable>
            </View>
          ) : (
            <Touchable
              style={[styles.attachButton, { backgroundColor: st.attachButtonBg, borderColor: st.attachButtonBorder }, isSubmitting && styles.disabled]}
              borderRadius={12}
              onPress={handleAttachImage}
              disabled={isSubmitting}
            >
              <ImageIcon size={20} color={st.attachButtonIcon} />
              <Text style={[styles.attachButtonText, { color: st.attachButtonText }]}>
                {t('support.attachEvidence')}
              </Text>
            </Touchable>
          )}
        </View>

        {/* Submit */}
        <Touchable
          style={[styles.submitButton, { backgroundColor: st.submitButtonBg }, isSubmitting && styles.disabled]}
          borderRadius={12}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={st.submitButtonText} />
          ) : (
            <>
              <CheckIcon size={18} color={st.submitButtonText} strokeWidth={2.5} />
              <Text style={[styles.submitButtonText, { color: st.submitButtonText }]}>
                {t('support.submit')}
              </Text>
            </>
          )}
        </Touchable>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  // ─── Render history ───────────────────────────────────────────────────────────

  const renderHistory = () => {
    if (isLoadingTickets) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={st.submitButtonBg} />
        </View>
      );
    }

    if (ticketsError) {
      return (
        <View style={styles.centered}>
          <Text style={[styles.emptyText, { color: st.emptyText }]}>{t('support.loadError')}</Text>
          <Touchable
            style={[styles.retryButton, { backgroundColor: st.submitButtonBg }]}
            borderRadius={10}
            onPress={() => loadTickets()}
          >
            <Text style={[styles.retryText, { color: st.submitButtonText }]}>{t('support.retry')}</Text>
          </Touchable>
        </View>
      );
    }

    return (
      <FlatList
        data={tickets}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 32 },
          tickets.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={st.submitButtonBg}
          />
        }
        renderItem={({ item }) => (
          <TicketCard ticket={item} colors={st} locale={i18n.language} t={t} />
        )}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: st.emptyText }]}>{t('support.emptyHistory')}</Text>
            <Text style={[styles.emptySubText, { color: st.emptySubText }]}>{t('support.emptyHistoryDesc')}</Text>
          </View>
        }
      />
    );
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: st.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: st.headerBackground, borderBottomColor: st.headerBorder }]}>
        <Text style={[styles.headerTitle, { color: st.headerTitle }]}>{t('support.title')}</Text>
      </View>

      {/* Tab bar */}
      <View style={[styles.tabBar, { backgroundColor: st.tabBarBackground, borderBottomColor: st.divider }]}>
        {(['new', 'history'] as ActiveTab[]).map(tab => {
          const isActive = activeTab === tab;
          return (
            <Touchable
              key={tab}
              style={styles.tab}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: isActive ? st.tabActiveText : st.tabText }, isActive && styles.tabTextActive]}>
                {tab === 'new' ? t('support.newTicket') : t('support.history')}
              </Text>
              {isActive && (
                <View style={[styles.tabIndicator, { backgroundColor: st.tabActiveBorder }]} />
              )}
            </Touchable>
          );
        })}
      </View>

      {/* Content */}
      <View style={styles.flex}>
        {activeTab === 'new' ? renderNewTicket() : renderHistory()}
      </View>

      {blockedPermission && (
        <PermissionModal
          type={blockedPermission}
          onOpenSettings={handleOpenSettings}
          onDismiss={dismissPermissionModal}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  disabled: { opacity: 0.6 },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  // Tab bar
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 2,
    borderRadius: 1,
  },
  // Form
  formContent: {
    padding: 16,
    gap: 20,
  },
  fieldWrapper: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputMultiline: {
    height: 120,
    paddingTop: 12,
  },
  // Attach
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  evidenceContainer: {
    gap: 10,
  },
  evidencePreview: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeImageBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  changeImageText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Submit
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  // History list
  listContent: {
    padding: 16,
    gap: 12,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  // Card
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDate: {
    fontSize: 12,
  },
  cardBody: {
    gap: 12,
    marginTop: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  adminResponse: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 6,
  },
  adminResponseLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  adminResponseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // States
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Support;