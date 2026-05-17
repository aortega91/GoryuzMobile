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
import { ArrowLeftIcon, AlertTriangleIcon, ScissorsIcon, RefreshCwIcon, UserIcon } from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import { UserProfile } from '@features/home/api/profileApi';
import { loadProfile } from '@features/home/profileSlice';
import { generateHaircut, saveDesign } from '../api/stylesGenerateApi';

interface Props {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
}

function HaircutCreator({ visible, profile, onClose }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPremium = profile?.plan === 'premium';
  const hasFace = !!profile?.avatarImage;

  const handleClose = () => {
    setPrompt('');
    setResultUrl(null);
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateHaircut({ prompt: prompt.trim() });
      setResultUrl(result.imageUrl);
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'HaircutCreator.generate');
      setError(t('styles.generatorError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!resultUrl) return;
    setIsSaving(true);
    try {
      await saveDesign({ imageUrl: resultUrl, type: 'haircut' });
      handleClose();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'HaircutCreator.save');
      setError(t('styles.generatorSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

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
            <AlertTriangleIcon size={48} color="#F97316" />
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
          <ScissorsIcon size={20} color="#F97316" />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.haircutTitle')}</Text>
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
              <Text style={[styles.canvasSubtitle, { color: s.modalSubtitle }]}>{t('styles.generatorCanvasSubtitle')}</Text>
            </View>
          </View>

          {!resultUrl ? (
            <>
              <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.generatorPromptWhat')}</Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                  isGenerating && styles.disabledInput,
                ]}
                placeholder={t('styles.haircutPromptPlaceholder')}
                placeholderTextColor={s.creatorInputPlaceholder}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                textAlignVertical="top"
                editable={!isGenerating}
              />

              <View style={[styles.refBox, { borderColor: s.modalBorder }]}>
                <View style={[styles.refIcon, { backgroundColor: s.creatorInputBackground }]}>
                  <UserIcon size={20} color={s.modalSubtitle} />
                </View>
                <Text style={[styles.refTitle, { color: s.modalTitle }]}>{t('styles.generatorReference')}</Text>
                <Text style={[styles.refSubtitle, { color: s.modalSubtitle }]}>{t('styles.generatorReferenceHint')}</Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Touchable
                onPress={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                borderRadius={16}
                style={[styles.generateBtn, { backgroundColor: '#F97316' }, (isGenerating || !prompt.trim()) && styles.disabled]}
              >
                {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : <ScissorsIcon size={20} color="#fff" />}
                <Text style={styles.generateBtnText}>
                  {isGenerating ? t('styles.generatorCreating') : t('styles.haircutGenerate')}
                </Text>
              </Touchable>
            </>
          ) : (
            <>
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
  reqCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
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

  canvasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  faceThumb: { width: 60, height: 60, borderRadius: 30 },
  canvasText: { flex: 1, gap: 3 },
  canvasTitle: { fontSize: 14, fontWeight: '700' },
  canvasSubtitle: { fontSize: 12, lineHeight: 17 },

  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  textarea: {
    height: 120,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  disabledInput: { opacity: 0.5 },

  refBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  refIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  refTitle: { fontSize: 14, fontWeight: '700' },
  refSubtitle: { fontSize: 12, textAlign: 'center' },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  generateBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  resultImage: { width: '100%', aspectRatio: 3 / 4, borderRadius: 24, overflow: 'hidden' },
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

export default HaircutCreator;
