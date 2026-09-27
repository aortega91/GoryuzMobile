import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  AlertCircleIcon,
  ArrowLeftIcon,
  CameraIcon,
  CloseIcon,
  GemIcon,
  LightbulbIcon,
  Share2Icon,
  SparklesIcon,
} from '@assets/icons';
import { loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import { Base64Image, asDataUrl, generateOutfitIdeas } from '../api/stylesGenerateApi';

interface Props {
  onClose: () => void;
}

/** Cap agreed with the per-idea charge in zena's middleware. */
const COUNTS = [1, 2, 3, 4] as const;
/** zena GEM_COSTS.outfitIdea — charged per idea. */
const IDEA_GEM_COST = 5;

/**
 * "Crear ideas" — outfits invented for an occasion, deliberately not limited
 * to the closet (port of zena OutfitIdeasModal). Ideas are inspiration and are
 * not saved to Styles; the user shares the ones they like.
 */
function OutfitIdeasCreator({ onClose }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { openGallery } = useCameraPermission();

  const [occasion, setOccasion] = useState('');
  const [count, setCount] = useState<number>(2);
  const [reference, setReference] = useState<Base64Image | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const totalCost = IDEA_GEM_COST * count;
  const canGenerate = occasion.trim().length > 0 && !isGenerating;

  const handlePickReference = async () => {
    const res = await openGallery();
    if (res.status !== 'success') return;
    const asset = res.response.assets?.[0];
    if (asset?.base64 && asset.type) setReference({ base64: asset.base64, mimeType: asset.type });
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateOutfitIdeas({ occasion: occasion.trim(), count, reference });
      setImages(result.images.map(b => asDataUrl(b)));
      dispatch(loadProfile());
      // Fewer ideas than requested means some failed — say so.
      if (result.images.length < result.requested) {
        setError(t('styles.ideasPartial', { got: result.images.length, requested: result.requested }));
      }
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'OutfitIdeasCreator.generate');
      setError(t('styles.ideasError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async (src: string) => {
    try {
      // iOS shares the image itself from a data URL; Android's Share API only
      // carries text, so there the idea can't leave the app yet.
      await Share.share(Platform.OS === 'ios' ? { url: src } : { message: t('styles.ideasShareMessage') });
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'OutfitIdeasCreator.share');
    }
  };

  const disabledStyle = isGenerating && styles.disabled;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={isGenerating ? undefined : onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable onPress={onClose} disabled={isGenerating} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} borderRadius={20}>
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <LightbulbIcon size={20} color={s.toneIdeas} />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.createIdeas')}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.block}>
            <Text style={[styles.label, { color: s.modalTitle }]}>{t('styles.ideasOccasionLabel')}</Text>
            <TextInput
              value={occasion}
              onChangeText={setOccasion}
              multiline
              maxLength={500}
              editable={!isGenerating}
              textAlignVertical="top"
              placeholder={t('styles.ideasOccasionPlaceholder')}
              placeholderTextColor={s.creatorInputPlaceholder}
              style={[
                styles.textarea,
                { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                disabledStyle,
              ]}
            />
          </View>

          <View style={styles.block}>
            <Text style={[styles.label, { color: s.modalTitle }]}>{t('styles.ideasCountLabel')}</Text>
            <View style={styles.countRow}>
              {COUNTS.map(n => {
                const active = count === n;
                return (
                  <Touchable
                    key={n}
                    onPress={() => setCount(n)}
                    disabled={isGenerating}
                    borderRadius={12}
                    style={[
                      styles.countBtn,
                      active
                        ? { backgroundColor: s.toneIdeas, borderColor: s.toneIdeas }
                        : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                      disabledStyle,
                    ]}
                  >
                    <Text style={[styles.countText, { color: active ? s.toneOnColor : s.choiceText }]}>{n}</Text>
                  </Touchable>
                );
              })}
            </View>
          </View>

          <View style={styles.block}>
            <Text style={[styles.label, { color: s.modalTitle }]}>{t('styles.ideasReferenceLabel')}</Text>
            {reference ? (
              <View style={[styles.refReady, { backgroundColor: s.createIdeasBackground, borderColor: s.createIdeasBorder }]}>
                <Image source={{ uri: `data:${reference.mimeType};base64,${reference.base64}` }} style={styles.refThumb} />
                <Text style={[styles.refReadyText, { color: s.createIdeasTitle }]}>{t('styles.ideasReferenceReady')}</Text>
                <Touchable
                  onPress={() => setReference(null)}
                  disabled={isGenerating}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  borderRadius={12}
                  accessibilityLabel={t('styles.essenceRemoveImage')}
                >
                  <CloseIcon size={16} color={s.createIdeasDesc} />
                </Touchable>
              </View>
            ) : (
              <Touchable
                onPress={handlePickReference}
                disabled={isGenerating}
                borderRadius={12}
                style={[styles.refAdd, { borderColor: s.modalBorder }, disabledStyle]}
              >
                <CameraIcon size={16} color={s.modalSubtitle} />
                <Text style={[styles.refAddText, { color: s.modalSubtitle }]}>{t('styles.ideasReferenceAdd')}</Text>
              </Touchable>
            )}
            <Text style={[styles.hint, { color: s.modalSubtitle }]}>{t('styles.ideasReferenceHint')}</Text>
          </View>

          {error && (
            <Text style={[styles.error, { color: s.actionDangerText, backgroundColor: s.buttonDanger }]}>{error}</Text>
          )}

          {images.length > 0 && (
            <View style={styles.block}>
              <View style={[styles.disclaimer, { backgroundColor: s.createIdeasBackground, borderColor: s.createIdeasBorder }]}>
                <AlertCircleIcon size={14} color={s.createIdeasTitle} />
                <Text style={[styles.disclaimerText, { color: s.createIdeasTitle }]}>{t('styles.ideasNotSavedDisclaimer')}</Text>
              </View>
              <View style={styles.grid}>
                {images.map((src, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <View key={i} style={styles.gridCell}>
                    <Image source={{ uri: src }} style={[styles.ideaImage, { borderColor: s.modalBorder }]} resizeMode="cover" />
                    <Touchable
                      onPress={() => handleShare(src)}
                      borderRadius={10}
                      style={[styles.shareBtn, { borderColor: s.modalBorder }]}
                    >
                      <Share2Icon size={13} color={s.modalSubtitle} />
                      <Text style={[styles.shareText, { color: s.modalSubtitle }]}>{t('styles.actionShare')}</Text>
                    </Touchable>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.footer, { borderTopColor: s.modalBorder }]}>
          <Touchable
            onPress={handleGenerate}
            disabled={!canGenerate}
            borderRadius={16}
            style={[styles.generateBtn, { backgroundColor: s.toneIdeas }, !canGenerate && styles.disabled]}
          >
            {isGenerating ? (
              <>
                <ActivityIndicator color={s.toneOnColor} size="small" />
                <Text style={[styles.generateText, { color: s.toneOnColor }]}>{t('styles.ideasGenerating')}</Text>
              </>
            ) : (
              <>
                <SparklesIcon size={18} color={s.toneOnColor} />
                <Text style={[styles.generateText, { color: s.toneOnColor }]}>
                  {images.length > 0 ? t('styles.ideasRegenerate') : t('styles.ideasGenerate')}
                </Text>
                <GemIcon size={13} color={s.toneOnColor} />
                <Text style={[styles.generateText, { color: s.toneOnColor }]}>{totalCost}</Text>
              </>
            )}
          </Touchable>
        </View>
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
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20, paddingBottom: 32 },
  block: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 16 },
  textarea: { height: 96, borderRadius: 14, borderWidth: 1, padding: 12, fontSize: 14, lineHeight: 20 },
  countRow: { flexDirection: 'row', gap: 8 },
  countBtn: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  countText: { fontSize: 14, fontWeight: '700' },
  refReady: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 12, borderWidth: 1 },
  refThumb: { width: 44, height: 44, borderRadius: 8 },
  refReadyText: { flex: 1, fontSize: 14, fontWeight: '600' },
  refAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  refAddText: { fontSize: 14, fontWeight: '600' },
  error: { fontSize: 13, padding: 12, borderRadius: 12, overflow: 'hidden' },
  disclaimer: { flexDirection: 'row', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCell: { width: '47%', gap: 6 },
  ideaImage: { width: '100%', aspectRatio: 9 / 16, borderRadius: 12, borderWidth: 1 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  shareText: { fontSize: 12, fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: StyleSheet.hairlineWidth },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  generateText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default OutfitIdeasCreator;
