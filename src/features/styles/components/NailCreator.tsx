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

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { ArrowLeftIcon, AlertTriangleIcon, HandIcon, RefreshCwIcon } from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import { UserProfile } from '@features/home/api/profileApi';
import { generateNails, saveDesign } from '../api/stylesGenerateApi';

type Shape = 'almond' | 'stiletto' | 'square' | 'coffin';
type Target = 'hands' | 'feet' | 'both';

interface Props {
  visible: boolean;
  profile: UserProfile | null;
  onClose: () => void;
}

function NailCreator({ visible, profile, onClose }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  const [prompt, setPrompt] = useState('');
  const [shape, setShape] = useState<Shape>('almond');
  const [target, setTarget] = useState<Target>('hands');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPremium = profile?.plan === 'premium';

  const handleClose = () => {
    setPrompt('');
    setShape('almond');
    setTarget('hands');
    setResultUrl(null);
    setError(null);
    onClose();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateNails({ prompt: prompt.trim(), shape, target });
      setResultUrl(result.imageUrl);
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'NailCreator.generate');
      setError(t('styles.generatorError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!resultUrl) return;
    setIsSaving(true);
    try {
      await saveDesign({ imageUrl: resultUrl, type: 'nails' });
      handleClose();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'NailCreator.save');
      setError(t('styles.generatorSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const SHAPES: { id: Shape; labelKey: string }[] = [
    { id: 'almond', labelKey: 'styles.nailsAlmond' },
    { id: 'stiletto', labelKey: 'styles.nailsStilett' },
    { id: 'square', labelKey: 'styles.nailsSquare' },
    { id: 'coffin', labelKey: 'styles.nailsCoffin' },
  ];

  const TARGETS: { id: Target; labelKey: string }[] = [
    { id: 'hands', labelKey: 'styles.nailsHands' },
    { id: 'feet', labelKey: 'styles.nailsFeet' },
    { id: 'both', labelKey: 'styles.nailsBoth' },
  ];

  // Requirements not met → small centered dialog
  if (!isPremium) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <View style={styles.reqBackdrop}>
          <View style={[styles.reqCard, { backgroundColor: s.modalBackground }]}>
            <AlertTriangleIcon size={48} color="#14B8A6" />
            <Text style={[styles.reqTitle, { color: s.modalTitle }]}>{t('styles.nailsReqTitle')}</Text>
            <Text style={[styles.reqDesc, { color: s.modalSubtitle }]}>{t('styles.nailsReqDesc')}</Text>
            <Touchable onPress={onClose} borderRadius={14} style={[styles.reqBtn, { backgroundColor: s.buttonPrimary }]}>
              <Text style={[styles.reqBtnText, { color: s.buttonPrimaryText }]}>{t('profile.viewPlans')}</Text>
            </Touchable>
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
          <HandIcon size={20} color="#14B8A6" />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.nailsTitle')}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!resultUrl ? (
            <>
              <View style={styles.pickersRow}>
                <View style={styles.pickerCol}>
                  <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.nailsShape')}</Text>
                  <View style={styles.pickerGrid}>
                    {SHAPES.map(item => {
                      const active = shape === item.id;
                      return (
                        <Touchable
                          key={item.id}
                          onPress={() => setShape(item.id)}
                          disabled={isGenerating}
                          borderRadius={10}
                          style={[
                            styles.pickerBtn,
                            { backgroundColor: active ? '#CCFBF1' : s.creatorInputBackground, borderColor: active ? '#99F6E4' : s.modalBorder },
                          ]}
                        >
                          <Text style={[styles.pickerBtnText, { color: active ? '#0F766E' : s.modalSubtitle }]}>
                            {t(item.labelKey)}
                          </Text>
                        </Touchable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.pickerCol}>
                  <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.nailsFor')}</Text>
                  <View style={styles.pickerStack}>
                    {TARGETS.map(item => {
                      const active = target === item.id;
                      return (
                        <Touchable
                          key={item.id}
                          onPress={() => setTarget(item.id)}
                          disabled={isGenerating}
                          borderRadius={10}
                          style={[
                            styles.pickerBtnFull,
                            { backgroundColor: active ? '#CCFBF1' : s.creatorInputBackground, borderColor: active ? '#99F6E4' : s.modalBorder },
                          ]}
                        >
                          <Text style={[styles.pickerBtnText, { color: active ? '#0F766E' : s.modalSubtitle }]}>
                            {t(item.labelKey)}
                          </Text>
                        </Touchable>
                      );
                    })}
                  </View>
                </View>
              </View>

              <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.nailsDetailsLabel')}</Text>
              <TextInput
                style={[
                  styles.textarea,
                  { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                  isGenerating && styles.disabledInput,
                ]}
                placeholder={t('styles.nailsDetailsPlaceholder')}
                placeholderTextColor={s.creatorInputPlaceholder}
                value={prompt}
                onChangeText={setPrompt}
                multiline
                textAlignVertical="top"
                editable={!isGenerating}
              />

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Touchable
                onPress={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                borderRadius={16}
                style={[styles.generateBtn, { backgroundColor: '#14B8A6' }, (isGenerating || !prompt.trim()) && styles.disabled]}
              >
                {isGenerating ? <ActivityIndicator color="#fff" size="small" /> : <HandIcon size={20} color="#fff" />}
                <Text style={styles.generateBtnText}>
                  {isGenerating ? t('styles.nailsCreating') : t('styles.nailsGenerate')}
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

  pickersRow: { flexDirection: 'row', gap: 16 },
  pickerCol: { flex: 1, gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },

  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerStack: { gap: 8 },
  pickerBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center', minWidth: '45%' },
  pickerBtnFull: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  pickerBtnText: { fontSize: 13, fontWeight: '600' },

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

export default NailCreator;
