import React, { useState } from 'react';
import {
  ActivityIndicator,
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

import { useDispatch } from 'react-redux';

import Touchable from '@components/Touchable';
import UpgradeModal from '@components/UpgradeModal';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  ArrowLeftIcon,
  AlertTriangleIcon,
  SparklesIcon,
  RefreshCwIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import { UserProfile } from '@features/home/api/profileApi';
import { loadProfile } from '@features/home/profileSlice';
import { generateMakeup, saveDesign } from '../api/stylesGenerateApi';
import { Outfit } from '../types';

type Lighting = 'office' | 'natural' | 'warm';

interface Props {
  visible: boolean;
  profile: UserProfile | null;
  outfits: Outfit[];
  onClose: () => void;
}

function MakeupCreator({ visible, profile, outfits, onClose }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [prompt, setPrompt] = useState('');
  const [selectedOutfitId, setSelectedOutfitId] = useState('');
  const [lighting, setLighting] = useState<Lighting>('natural');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPremium = profile?.plan === 'premium';
  const hasFace = !!profile?.avatarImage;

  const handleClose = () => {
    setPrompt('');
    setSelectedOutfitId('');
    setLighting('natural');
    setResultUrl(null);
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateMakeup({
        prompt: prompt.trim(),
        outfitId: selectedOutfitId || undefined,
        lighting,
      });
      setResultUrl(result.imageUrl);
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'MakeupCreator.generate');
      setError(t('styles.generatorError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!resultUrl) return;
    setIsSaving(true);
    try {
      await saveDesign({ imageUrl: resultUrl, type: 'makeup' });
      handleClose();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'MakeupCreator.save');
      setError(t('styles.generatorSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const LIGHTING_OPTIONS: { id: Lighting; labelKey: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
    { id: 'office', labelKey: 'styles.makeupLightOffice', Icon: MonitorIcon },
    { id: 'natural', labelKey: 'styles.makeupLightNatural', Icon: SunIcon },
    { id: 'warm', labelKey: 'styles.makeupLightWarm', Icon: MoonIcon },
  ];

  // Premium requirement → UpgradeModal
  if (!isPremium) {
    return (
      <UpgradeModal
        visible={visible}
        requiredPlan="premium"
        onUpgrade={onClose}
        onClose={onClose}
      />
    );
  }

  // Face photo missing → simple warning dialog
  if (!hasFace) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.reqBackdrop}>
          <View style={[styles.reqCard, { backgroundColor: s.modalBackground }]}>
            <AlertTriangleIcon size={48} color="#EC4899" />
            <Text style={[styles.reqTitle, { color: s.modalTitle }]}>{t('styles.generatorReqTitle')}</Text>
            <Text style={[styles.reqDesc, { color: s.modalSubtitle }]}>{t('styles.generatorFaceReq')}</Text>
            <Touchable
              onPress={onClose}
              borderRadius={14}
              style={[styles.reqBtnSecondary, { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder }]}
            >
              <Text style={[styles.reqBtnText, { color: s.buttonSecondaryText }]}>{t('common.cancel')}</Text>
            </Touchable>
          </View>
        </View>
      </Modal>
    );
  }

  // Full-screen creator
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable onPress={handleClose} hitSlop={8} borderRadius={20} style={styles.backBtn}>
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <SparklesIcon size={20} color="#EC4899" />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.makeupTitle')}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.canvasRow, { backgroundColor: s.creatorInputBackground, borderColor: s.modalBorder }]}>
            <Image source={{ uri: profile!.avatarImage! }} style={styles.faceThumb} />
            <View style={styles.canvasText}>
              <Text style={[styles.canvasTitle, { color: s.modalTitle }]}>{t('styles.generatorCanvasTitle')}</Text>
              <Text style={[styles.canvasSubtitle, { color: s.modalSubtitle }]}>{t('styles.makeupCanvasHint')}</Text>
            </View>
          </View>

          {!resultUrl ? (
            <>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.makeupOutfitLabel')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.outfitPicker}>
                  <Touchable
                    onPress={() => setSelectedOutfitId('')}
                    borderRadius={10}
                    disabled={isGenerating}
                    style={[
                      styles.outfitChip,
                      {
                        backgroundColor: !selectedOutfitId ? s.filterPillActiveBackground : s.filterPillBackground,
                        borderColor: !selectedOutfitId ? s.filterPillActiveBorder : s.filterPillBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.outfitChipText, { color: !selectedOutfitId ? s.filterPillActiveText : s.filterPillText }]}>
                      {t('styles.makeupOutfitNone')}
                    </Text>
                  </Touchable>
                  {outfits.map(o => (
                    <Touchable
                      key={o.id}
                      onPress={() => setSelectedOutfitId(o.id)}
                      borderRadius={10}
                      disabled={isGenerating}
                      style={[
                        styles.outfitChip,
                        {
                          backgroundColor: selectedOutfitId === o.id ? s.filterPillActiveBackground : s.filterPillBackground,
                          borderColor: selectedOutfitId === o.id ? s.filterPillActiveBorder : s.filterPillBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[styles.outfitChipText, { color: selectedOutfitId === o.id ? s.filterPillActiveText : s.filterPillText }]}
                        numberOfLines={1}
                      >
                        {o.name}
                      </Text>
                    </Touchable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.makeupDetailsLabel')}</Text>
                <TextInput
                  style={[
                    styles.textarea,
                    { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                    isGenerating && styles.disabledInput,
                  ]}
                  placeholder={t('styles.makeupDetailsPlaceholder')}
                  placeholderTextColor={s.creatorInputPlaceholder}
                  value={prompt}
                  onChangeText={setPrompt}
                  multiline
                  textAlignVertical="top"
                  editable={!isGenerating}
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Touchable
                onPress={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                borderRadius={16}
                style={[styles.generateBtn, { backgroundColor: '#EC4899' }, (isGenerating || !prompt.trim()) && styles.disabled]}
              >
                {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : <SparklesIcon size={20} color="#fff" />}
                <Text style={styles.generateBtnText}>
                  {isGenerating ? t('styles.makeupCreating') : t('styles.makeupGenerate')}
                </Text>
              </Touchable>
            </>
          ) : (
            <>
              <View style={[styles.lightingRow, { backgroundColor: s.creatorInputBackground }]}>
                {LIGHTING_OPTIONS.map(opt => {
                  const active = lighting === opt.id;
                  return (
                    <Touchable
                      key={opt.id}
                      onPress={() => { setLighting(opt.id); handleGenerate(); }}
                      disabled={isGenerating || isSaving}
                      borderRadius={10}
                      style={[styles.lightingBtn, active && { backgroundColor: s.modalBackground }]}
                    >
                      <opt.Icon size={14} color={active ? '#EC4899' : s.modalSubtitle} />
                      <Text style={[styles.lightingLabel, { color: active ? '#EC4899' : s.modalSubtitle }]}>
                        {t(opt.labelKey)}
                      </Text>
                    </Touchable>
                  );
                })}
              </View>

              <Image source={{ uri: resultUrl }} style={styles.resultImage} resizeMode="cover" />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <View style={styles.resultActions}>
                <Touchable
                  onPress={handleGenerate}
                  disabled={isGenerating || isSaving}
                  borderRadius={14}
                  style={[styles.retryBtn, { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder }, (isGenerating || isSaving) && styles.disabled]}
                >
                  {isGenerating ? <ActivityIndicator color={s.buttonSecondaryText} size="small" /> : <RefreshCwIcon size={18} color={s.buttonSecondaryText} />}
                  <Text style={[styles.actionBtnText, { color: s.buttonSecondaryText }]}>{t('styles.generatorRetry')}</Text>
                </Touchable>
                <Touchable
                  onPress={handleSave}
                  disabled={isSaving || isGenerating}
                  borderRadius={14}
                  style={[styles.saveBtn, { backgroundColor: s.buttonPrimary }, (isSaving || isGenerating) && styles.disabled]}
                >
                  {isSaving && <ActivityIndicator color={s.buttonPrimaryText} size="small" />}
                  <Text style={[styles.actionBtnText, { color: s.buttonPrimaryText }]}>{t('styles.generatorSave')}</Text>
                </Touchable>
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Requirements dialog
  reqBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.60)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  reqCard: { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center', gap: 12 },
  reqTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  reqDesc: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  reqBtn: { width: '100%', paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  reqBtnSecondary: { width: '100%', paddingVertical: 16, borderRadius: 14, borderWidth: 1, alignItems: 'center' },
  reqBtnText: { fontSize: 15, fontWeight: '700' },

  // Full-screen creator
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
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 40 },

  canvasRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, gap: 14 },
  faceThumb: { width: 60, height: 60, borderRadius: 30 },
  canvasText: { flex: 1, gap: 3 },
  canvasTitle: { fontSize: 14, fontWeight: '700' },
  canvasSubtitle: { fontSize: 12, lineHeight: 17 },

  fieldGroup: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },

  outfitPicker: { gap: 8, paddingRight: 4 },
  outfitChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, maxWidth: 160 },
  outfitChipText: { fontSize: 13, fontWeight: '600' },

  textarea: { height: 120, borderRadius: 16, borderWidth: 1, padding: 14, fontSize: 14, lineHeight: 20 },
  disabledInput: { opacity: 0.5 },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  lightingRow: { flexDirection: 'row', padding: 4, borderRadius: 14, gap: 4 },
  lightingBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  lightingLabel: { fontSize: 11, fontWeight: '700' },

  resultImage: { width: '100%', aspectRatio: 1, borderRadius: 24, overflow: 'hidden' },
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

  errorText: { fontSize: 13, color: '#E05A5E', textAlign: 'center' },
  disabled: { opacity: 0.5 },
});

export default MakeupCreator;
