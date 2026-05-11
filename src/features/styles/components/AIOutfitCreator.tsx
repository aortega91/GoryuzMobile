import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { getImageSource } from '@api/client';
import { ArrowLeftIcon, SparklesIcon, RefreshCwIcon, ShirtIcon } from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import { ClothingItem } from '@features/collection/types';
import { suggestOutfit } from '../api/stylesApi';

interface Props {
  visible: boolean;
  closetItems: ClothingItem[];
  closetLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string, itemIds: string[]) => void;
}

type Step = 'prompt' | 'loading' | 'result';

function AIOutfitCreator({ visible, closetItems, closetLoading, saving, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  const [step, setStep] = useState<Step>('prompt');
  const [prompt, setPrompt] = useState('');
  const [suggestedIds, setSuggestedIds] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const closetItemIds = useMemo(() => closetItems.map(i => i.id), [closetItems]);

  const suggestedItems = useMemo(
    () => suggestedIds.map(id => closetItems.find(i => i.id === id)).filter(Boolean) as ClothingItem[],
    [suggestedIds, closetItems],
  );

  const handleClose = () => {
    setStep('prompt');
    setPrompt('');
    setSuggestedIds([]);
    setOutfitName('');
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || closetItemIds.length === 0) return;
    setStep('loading');
    setError(null);
    try {
      const result = await suggestOutfit({ prompt: prompt.trim(), closetItemIds });
      setSuggestedIds(result.itemIds);
      setOutfitName(result.name);
      setStep('result');
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'AIOutfitCreator.generate');
      setError(t('styles.aiCreatorError'));
      setStep('prompt');
    }
  };

  const handleSave = () => {
    const name = outfitName.trim();
    if (!name || suggestedIds.length === 0) return;
    onSave(name, suggestedIds);
  };

  const handleRegenerate = () => {
    setSuggestedIds([]);
    setOutfitName('');
    handleGenerate();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable
            onPress={step === 'result' ? () => setStep('prompt') : handleClose}
            hitSlop={8}
            borderRadius={20}
            style={styles.backBtn}
            disabled={step === 'loading' || saving}
          >
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <SparklesIcon size={20} color="#4F46E5" />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.aiCreatorTitle')}</Text>
        </View>

        {/* Loading screen */}
        {step === 'loading' && (
          <View style={styles.loadingContainer}>
            <SparklesIcon size={56} color="#4F46E5" />
            <Text style={[styles.loadingTitle, { color: s.headerTitle }]}>{t('styles.aiCreatorGenerating')}</Text>
            <Text style={[styles.loadingHint, { color: s.headerSubtitle }]}>{t('styles.aiCreatorGeneratingHint')}</Text>
            <ActivityIndicator color="#4F46E5" size="large" style={styles.loadingSpinner} />
          </View>
        )}

        {/* Prompt form */}
        {step === 'prompt' && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {closetLoading ? (
              <View style={styles.center}>
                <ActivityIndicator color={s.buttonPrimary} />
              </View>
            ) : closetItems.length === 0 ? (
              <View style={styles.center}>
                <ShirtIcon size={52} color={s.emptyIcon} />
                <Text style={[styles.emptyTitle, { color: s.emptyText }]}>{t('styles.creatorEmptyTitle')}</Text>
                <Text style={[styles.emptySubtitle, { color: s.emptySubtitle }]}>{t('styles.creatorEmptySubtitle')}</Text>
              </View>
            ) : (
              <>
                {/* Closet preview strip */}
                <View style={[styles.closetPreview, { backgroundColor: s.creatorInputBackground, borderColor: s.modalBorder }]}>
                  <FlatList
                    data={closetItems.slice(0, 8)}
                    horizontal
                    keyExtractor={item => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.previewStrip}
                    renderItem={({ item }) =>
                      item.imageData ? (
                        <Image source={getImageSource(item.imageData)} style={styles.previewThumb} resizeMode="cover" />
                      ) : null
                    }
                  />
                  <Text style={[styles.closetCount, { color: s.modalSubtitle }]}>
                    {t('styles.aiCreatorClosetCount', { count: closetItems.length })}
                  </Text>
                </View>

                <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.aiCreatorPromptLabel')}</Text>
                <TextInput
                  style={[
                    styles.textarea,
                    { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                  ]}
                  placeholder={t('styles.aiCreatorPromptPlaceholder')}
                  placeholderTextColor={s.creatorInputPlaceholder}
                  value={prompt}
                  onChangeText={setPrompt}
                  multiline
                  textAlignVertical="top"
                />

                {error && <Text style={styles.errorText}>{error}</Text>}

                <Touchable
                  onPress={handleGenerate}
                  disabled={!prompt.trim()}
                  borderRadius={16}
                  style={[styles.generateBtn, !prompt.trim() && styles.disabled]}
                >
                  <SparklesIcon size={20} color="#fff" />
                  <Text style={styles.generateBtnText}>{t('styles.aiCreatorGenerate')}</Text>
                </Touchable>
              </>
            )}
          </ScrollView>
        )}

        {/* Result screen */}
        {step === 'result' && (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.resultLabel, { color: s.modalSubtitle }]}>
              {t('styles.aiCreatorResultItems', { count: suggestedItems.length })}
            </Text>

            {/* Suggested items grid */}
            <View style={[styles.resultGrid, { backgroundColor: s.outfitCardBorder }]}>
              {([
                [0, 1],
                [2, 3],
              ] as const).map((pair, rowIdx) => (
                // eslint-disable-next-line react/no-array-index-key
                <View key={rowIdx} style={styles.resultRow}>
                  {pair.map(i => (
                    <View key={i} style={[styles.resultCell, { backgroundColor: s.outfitCardBackground }]}>
                      {suggestedItems[i]?.imageData ? (
                        <Image
                          source={getImageSource(suggestedItems[i].imageData!)}
                          style={StyleSheet.absoluteFill}
                          resizeMode="cover"
                        />
                      ) : suggestedItems[i] ? (
                        <Text style={[styles.resultCellLabel, { color: s.emptySubtitle }]} numberOfLines={2}>
                          {suggestedItems[i].name}
                        </Text>
                      ) : (
                        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: s.outfitCardMosaicBackground }]} />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </View>

            {/* Editable name */}
            <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.creatorNameLabel')}</Text>
            <TextInput
              style={[
                styles.nameInput,
                { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                saving && styles.disabled,
              ]}
              value={outfitName}
              onChangeText={setOutfitName}
              placeholder={t('styles.creatorNamePlaceholder')}
              placeholderTextColor={s.creatorInputPlaceholder}
              editable={!saving}
              maxLength={80}
              returnKeyType="done"
            />

            {error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.resultActions}>
              <Touchable
                onPress={handleRegenerate}
                disabled={saving}
                borderRadius={14}
                style={[
                  styles.retryBtn,
                  { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder },
                  saving && styles.disabled,
                ]}
              >
                <RefreshCwIcon size={18} color={s.buttonSecondaryText} />
                <Text style={[styles.actionBtnText, { color: s.buttonSecondaryText }]}>{t('styles.aiCreatorRegenerate')}</Text>
              </Touchable>
              <Touchable
                onPress={handleSave}
                disabled={saving || !outfitName.trim() || suggestedIds.length === 0}
                borderRadius={14}
                style={[
                  styles.saveBtn,
                  { backgroundColor: '#4F46E5' },
                  (saving || !outfitName.trim() || suggestedIds.length === 0) && styles.disabled,
                ]}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <SparklesIcon size={18} color="#fff" />
                }
                <Text style={styles.saveBtnText}>
                  {saving ? t('styles.creatorSaving') : t('styles.creatorSave')}
                </Text>
              </Touchable>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { marginRight: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 16,
  },
  loadingTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  loadingHint: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  loadingSpinner: { marginTop: 8 },

  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },

  closetPreview: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  previewStrip: { padding: 12, gap: 8 },
  previewThumb: { width: 56, height: 56, borderRadius: 8 },
  closetCount: { paddingHorizontal: 12, fontSize: 12, fontWeight: '600' },

  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  textarea: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
  },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  resultLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  resultGrid: {
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    flexDirection: 'column',
    gap: 2,
  },
  resultRow: { flex: 1, flexDirection: 'row', gap: 2 },
  resultCell: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  resultCellLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center', padding: 6 },

  nameInput: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
  },

  resultActions: { flexDirection: 'row', gap: 12 },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  saveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 14,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  errorText: { fontSize: 13, color: '#E05A5E', textAlign: 'center' },
  disabled: { opacity: 0.5 },
});

export default AIOutfitCreator;
