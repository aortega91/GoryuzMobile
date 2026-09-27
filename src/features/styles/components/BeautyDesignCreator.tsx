import React, { useMemo, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import UpgradeModal from '@components/UpgradeModal';
import useStylesTheme from '@hooks/useStylesTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  ArrowLeftIcon,
  GemIcon,
  HandIcon,
  FootprintsIcon,
  ImageIcon,
  RefreshCwIcon,
  ScissorsIcon,
  SmileIcon,
  CheckIcon,
  UserIcon,
} from '@assets/icons';
import { UserProfile } from '@features/home/api/profileApi';
import { loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import {
  Base64Image,
  asDataUrl,
  generateHaircut,
  generateMakeup,
  generateNails,
  generateTechSheet,
  splitDataUrl,
  toBase64Image,
} from '../api/stylesGenerateApi';
import { addOutfit } from '../stylesSlice';
import { BeautyKind, Outfit, TechSheet } from '../types';
import {
  BEAUTY_GEM_COST,
  BEAUTY_OPTIONS,
  BeautyQuestion,
  NAIL_SHAPES,
  NAIL_TARGETS,
} from '../beautyOptions';
import BeautyChoice from './BeautyChoice';
import PresetChips from './PresetChips';

interface Props {
  kind: BeautyKind;
  profile: UserProfile | null;
  /** Saved outfits — makeup can be designed to match one of them. */
  outfits: Outfit[];
  onClose: () => void;
  /** Fired after the design was stored as a creation. */
  onSaved: () => void;
}

const TITLE_KEYS: Record<BeautyKind, string> = {
  hair: 'styles.haircutTitle',
  makeup: 'styles.makeupTitle',
  nails: 'styles.nailsTitle',
};

const PLACEHOLDER_KEYS: Record<BeautyKind, string> = {
  hair: 'styles.haircutPromptPlaceholder',
  makeup: 'styles.makeupDetailsPlaceholder',
  nails: 'styles.nailsDetailsPlaceholder',
};

const NAME_KEYS: Record<BeautyKind, string> = {
  hair: 'styles.designNameHair',
  makeup: 'styles.designNameMakeup',
  nails: 'styles.designNameNails',
};

/**
 * Hair / makeup / nails designer — port of zena's HairSalonModal, MakeupModal
 * and NailDesignModal. Generates on the face avatar (falling back to the body
 * avatar or photo; without any the AI uses a generic face), then saves the
 * design as a creation with its salon tech sheet.
 */
function BeautyDesignCreator({ kind, profile, outfits, onClose, onSaved }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { openGallery } = useCameraPermission();

  const tone = kind === 'hair' ? s.toneHair : kind === 'makeup' ? s.toneMakeup : s.toneNails;
  const KindIcon = kind === 'hair' ? ScissorsIcon : kind === 'makeup' ? SmileIcon : HandIcon;

  const [prompt, setPrompt] = useState('');
  const [answers, setAnswers] = useState<Partial<Record<BeautyQuestion, string | null>>>(
    kind === 'hair' ? { hairMode: 'hair' } : {},
  );
  const [shape, setShape] = useState<string>('almond');
  const [target, setTarget] = useState<string>('hands');
  const [outfitId, setOutfitId] = useState<string | null>(null);
  const [reference, setReference] = useState<Base64Image | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = isGenerating || isSaving;
  const isVip = profile?.plan === 'vip';
  // Face first: beauty needs a close-up. The generated face avatar beats the
  // raw photo, which would hand the model a full body with a tiny face.
  const canvas = profile?.faceAvatarImage || profile?.avatarImage || profile?.bodyImage || null;

  const mode = answers.hairMode ?? 'hair';
  const asksHair = mode === 'hair' || mode === 'both';
  const asksBeard = mode === 'beard' || mode === 'both';

  const outfitOptions = useMemo(
    () => outfits.filter(o => o.kind === 'outfit'),
    [outfits],
  );

  const canGenerate = kind === 'nails' ? !!prompt.trim() || !!reference : !!prompt.trim();

  const setAnswer = (question: BeautyQuestion) => (value: string | null) =>
    setAnswers(prev => ({ ...prev, [question]: value }));

  const optionsFor = (question: BeautyQuestion) =>
    BEAUTY_OPTIONS[question].map(id => ({ id, label: t(`styles.beautyOpt.${question}.${id}`) }));

  const question = (q: BeautyQuestion, step: number, optional = true) => (
    <BeautyChoice
      key={q}
      step={step}
      tone={tone}
      optional={optional}
      disabled={busy}
      title={t(`styles.beautyQ.${q}`)}
      hint={t(`styles.beautyQ.${q}Hint`)}
      options={optionsFor(q)}
      value={answers[q] ?? null}
      onChange={setAnswer(q)}
    />
  );

  const handlePickReference = async () => {
    const res = await openGallery();
    if (res.status !== 'success') return;
    const asset = res.response.assets?.[0];
    if (asset?.base64 && asset.type) {
      setReference({ base64: asset.base64, mimeType: asset.type });
    }
  };

  /** Only what was actually asked is sent: an unseen question describes nothing. */
  const buildAnswers = (): Record<string, string | null> => {
    if (kind === 'hair') {
      return {
        hairMode: mode,
        faceShape: answers.faceShape ?? null,
        hairTexture: asksHair ? answers.hairTexture ?? null : null,
        hairThickness: asksHair ? answers.hairThickness ?? null : null,
        beardDensity: asksBeard ? answers.beardDensity ?? null : null,
      };
    }
    if (kind === 'makeup') {
      return {
        faceShape: answers.faceShape ?? null,
        skinType: answers.skinType ?? null,
        lipThickness: answers.lipThickness ?? null,
        eyeStyle: answers.eyeStyle ?? null,
      };
    }
    return {
      nailThickness: answers.nailThickness ?? null,
      nailLength: answers.nailLength ?? null,
    };
  };

  const handleGenerate = async () => {
    if (!canGenerate || busy) return;
    setIsGenerating(true);
    setError(null);
    try {
      const avatar = canvas ? await toBase64Image(canvas) : null;
      let fullPrompt = prompt.trim();
      if (kind === 'makeup' && outfitId) {
        const outfit = outfits.find(o => o.id === outfitId);
        if (outfit) fullPrompt += ` ${t('styles.makeupForOutfitPrompt', { name: outfit.name })}`;
      }
      const request = { prompt: fullPrompt, avatar, reference, answers: buildAnswers() };
      const b64 =
        kind === 'hair'
          ? await generateHaircut(request)
          : kind === 'makeup'
          ? await generateMakeup(request)
          : await generateNails({ ...request, shape, target });
      setResult(asDataUrl(b64, 'image/jpeg'));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), `BeautyDesignCreator.${kind}.generate`);
      setError(t('styles.generatorError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!result || busy) return;
    setIsSaving(true);
    setError(null);
    const designPrompt = prompt.trim() || t(TITLE_KEYS[kind]);
    try {
      // Best-effort, like zena: the design is already paid for, so it is saved
      // even when the sheet fails — it can be generated later from the grid.
      let techSheet: TechSheet | null = null;
      const image = splitDataUrl(result);
      if (image) {
        try {
          techSheet = await generateTechSheet({
            kind,
            prompt: designPrompt,
            image,
            language: profile?.language,
          });
          dispatch(loadProfile());
        } catch (err) {
          logError(err instanceof Error ? err : new Error(String(err)), `BeautyDesignCreator.${kind}.techSheet`);
        }
      }
      await dispatch(
        addOutfit({
          name: `${t(NAME_KEYS[kind])} ${new Date().toLocaleDateString()}`,
          itemIds: [],
          imageData: result,
          kind,
          source: 'ai',
          designPrompt,
          techSheet,
        }),
      ).unwrap();
      onSaved();
      onClose();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), `BeautyDesignCreator.${kind}.save`);
      setError(t('styles.generatorSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isVip) {
    return <UpgradeModal visible requiredPlan="vip" onUpgrade={onClose} onClose={onClose} />;
  }

  const renderSegment = (
    values: readonly string[],
    selected: string,
    onSelect: (v: string) => void,
    labelKey: (v: string) => string,
    icon?: (v: string, color: string) => React.ReactNode,
  ) => (
    <View style={styles.segmentRow}>
      {values.map(v => {
        const active = selected === v;
        const color = active ? s.toneOnColor : s.choiceText;
        return (
          <Touchable
            key={v}
            disabled={busy}
            onPress={() => onSelect(v)}
            borderRadius={14}
            style={[
              styles.segment,
              active
                ? { backgroundColor: tone, borderColor: tone }
                : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
              busy && styles.disabled,
            ]}
          >
            {icon?.(v, color)}
            <Text style={[styles.segmentText, { color }]}>{t(labelKey(v))}</Text>
          </Touchable>
        );
      })}
    </View>
  );

  let step = 1;

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={busy ? undefined : onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable onPress={onClose} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} borderRadius={20}>
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <KindIcon size={20} color={tone} />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t(TITLE_KEYS[kind])}</Text>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Canvas the design is applied to */}
          <View style={[styles.canvasRow, { backgroundColor: s.creatorInputBackground, borderColor: s.modalBorder }]}>
            {canvas ? (
              <AuthedImage data={canvas} style={styles.canvasThumb} resizeMode="cover" />
            ) : (
              <View style={[styles.canvasThumb, styles.canvasEmpty, { backgroundColor: s.modalBackground }]}>
                <UserIcon size={24} color={s.emptySubtitle} />
              </View>
            )}
            <View style={styles.canvasText}>
              <Text style={[styles.canvasTitle, { color: s.modalTitle }]}>
                {canvas ? t('styles.generatorCanvasTitle') : t('styles.generatorNoCanvasTitle')}
              </Text>
              <Text style={[styles.canvasSubtitle, { color: s.modalSubtitle }]}>
                {canvas ? t('styles.generatorCanvasSubtitle') : t('styles.generatorNoCanvasSubtitle')}
              </Text>
            </View>
          </View>

          {!result && (
            <>
              {kind === 'hair' && (
                <>
                  {question('hairMode', step++, false)}
                  {question('faceShape', step++)}
                  {asksHair && question('hairTexture', step++)}
                  {asksHair && question('hairThickness', step++)}
                  {asksBeard && question('beardDensity', step++)}
                </>
              )}

              {kind === 'makeup' && (
                <>
                  {outfitOptions.length > 0 && (
                    <View style={styles.block}>
                      <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.makeupOutfitLabel')}</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentRow}>
                        {outfitOptions.map(o => {
                          const active = outfitId === o.id;
                          return (
                            <Touchable
                              key={o.id}
                              disabled={busy}
                              onPress={() => setOutfitId(active ? null : o.id)}
                              borderRadius={14}
                              style={[
                                styles.segment,
                                active
                                  ? { backgroundColor: tone, borderColor: tone }
                                  : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                                busy && styles.disabled,
                              ]}
                            >
                              {active && <CheckIcon size={13} color={s.toneOnColor} />}
                              <Text
                                numberOfLines={1}
                                style={[styles.segmentText, { color: active ? s.toneOnColor : s.choiceText }]}
                              >
                                {o.name}
                              </Text>
                            </Touchable>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                  {question('faceShape', step++)}
                  {question('skinType', step++)}
                  {question('lipThickness', step++)}
                  {question('eyeStyle', step++)}
                </>
              )}

              {kind === 'nails' && (
                <>
                  <View style={styles.block}>
                    <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.nailsFor')}</Text>
                    {renderSegment(NAIL_TARGETS, target, setTarget, v => `styles.nailsTarget.${v}`, (v, c) =>
                      v === 'hands' ? <HandIcon size={16} color={c} /> : <FootprintsIcon size={16} color={c} />,
                    )}
                  </View>
                  <View style={styles.block}>
                    <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.nailsShape')}</Text>
                    {renderSegment(NAIL_SHAPES, shape, setShape, v => `styles.nailsShapes.${v}`)}
                  </View>
                  {question('nailThickness', step++)}
                  {question('nailLength', step++)}
                </>
              )}

              <View style={styles.block}>
                <Text style={[styles.label, { color: s.creatorInputLabel }]}>{t('styles.generatorPromptWhat')}</Text>
                <PresetChips
                  flow={kind}
                  value={prompt}
                  onSelect={setPrompt}
                  disabled={busy}
                  activeColor={tone}
                />
                <TextInput
                  style={[
                    styles.textarea,
                    { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                    busy && styles.disabled,
                  ]}
                  placeholder={t(PLACEHOLDER_KEYS[kind])}
                  placeholderTextColor={s.creatorInputPlaceholder}
                  value={prompt}
                  onChangeText={setPrompt}
                  multiline
                  textAlignVertical="top"
                  editable={!busy}
                />
              </View>

              <Touchable
                onPress={handlePickReference}
                disabled={busy}
                borderRadius={16}
                style={[styles.refBox, { borderColor: s.modalBorder }, busy && styles.disabled]}
              >
                {reference ? (
                  <Image
                    source={{ uri: `data:${reference.mimeType};base64,${reference.base64}` }}
                    style={styles.refThumb}
                  />
                ) : (
                  <View style={[styles.refIcon, { backgroundColor: s.creatorInputBackground }]}>
                    <ImageIcon size={20} color={tone} />
                  </View>
                )}
                <Text style={[styles.refTitle, { color: s.modalTitle }]}>
                  {reference ? t('styles.generatorReferenceChange') : t('styles.generatorReference')}
                </Text>
                <Text style={[styles.refSubtitle, { color: s.modalSubtitle }]}>{t('styles.generatorReferenceHint')}</Text>
              </Touchable>
            </>
          )}

          {result && (
            <View style={styles.block}>
              <Text style={[styles.resultTitle, { color: s.modalTitle }]}>{t('styles.generatorResultTitle')}</Text>
              <Image source={{ uri: result }} style={[styles.resultImage, { borderColor: s.modalBorder }]} resizeMode="contain" />
            </View>
          )}

          {error && <Text style={[styles.errorText, { color: s.actionDangerText }]}>{error}</Text>}

          {!result ? (
            <Touchable
              onPress={handleGenerate}
              disabled={busy || !canGenerate}
              borderRadius={16}
              style={[styles.generateBtn, { backgroundColor: tone }, (busy || !canGenerate) && styles.disabled]}
            >
              {isGenerating ? <ActivityIndicator color={s.toneOnColor} size="small" /> : <KindIcon size={20} color={s.toneOnColor} />}
              <Text style={[styles.generateBtnText, { color: s.toneOnColor }]}>
                {isGenerating ? t('styles.generatorCreating') : t('styles.generatorCreate')}
              </Text>
              {!isGenerating && (
                <View style={styles.gemRow}>
                  <GemIcon size={13} color={s.toneOnColor} />
                  <Text style={[styles.gemText, { color: s.toneOnColor }]}>{BEAUTY_GEM_COST[kind]}</Text>
                </View>
              )}
            </Touchable>
          ) : (
            <View style={styles.resultActions}>
              <Touchable
                onPress={handleGenerate}
                disabled={busy}
                borderRadius={14}
                style={[styles.retryBtn, { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder }, busy && styles.disabled]}
              >
                {isGenerating ? (
                  <ActivityIndicator color={s.buttonSecondaryText} size="small" />
                ) : (
                  <RefreshCwIcon size={18} color={s.buttonSecondaryText} />
                )}
                <Text style={[styles.actionBtnText, { color: s.buttonSecondaryText }]}>{t('styles.generatorRetry')}</Text>
              </Touchable>
              <Touchable
                onPress={handleSave}
                disabled={busy}
                borderRadius={14}
                style={[styles.saveBtn, { backgroundColor: s.buttonPrimary }, busy && styles.disabled]}
              >
                {isSaving ? (
                  <ActivityIndicator color={s.buttonPrimaryText} size="small" />
                ) : (
                  <Text style={[styles.actionBtnText, { color: s.buttonPrimaryText }]}>{t('styles.generatorSave')}</Text>
                )}
              </Touchable>
            </View>
          )}
        </ScrollView>
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
  scrollContent: { padding: 20, gap: 20, paddingBottom: 40 },

  canvasRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, gap: 14 },
  canvasThumb: { width: 56, height: 56, borderRadius: 28, overflow: 'hidden' },
  canvasEmpty: { alignItems: 'center', justifyContent: 'center' },
  canvasText: { flex: 1, gap: 3 },
  canvasTitle: { fontSize: 14, fontWeight: '700' },
  canvasSubtitle: { fontSize: 12, lineHeight: 17 },

  block: { gap: 8 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  segmentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  segment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    maxWidth: 200,
  },
  segmentText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },

  textarea: { height: 120, borderRadius: 16, borderWidth: 1, padding: 14, fontSize: 14, lineHeight: 20 },

  refBox: { borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, padding: 18, alignItems: 'center', gap: 6 },
  refIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  refThumb: { width: 72, height: 72, borderRadius: 12 },
  refTitle: { fontSize: 14, fontWeight: '700' },
  refSubtitle: { fontSize: 12, textAlign: 'center' },

  resultTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  resultImage: { width: '100%', aspectRatio: 1, borderRadius: 24, borderWidth: 1 },

  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  generateBtnText: { fontSize: 15, fontWeight: '700' },
  gemRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  gemText: { fontSize: 13, fontWeight: '700' },

  resultActions: { flexDirection: 'row', gap: 12 },
  retryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  saveBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14 },
  actionBtnText: { fontSize: 15, fontWeight: '700' },

  errorText: { fontSize: 13, textAlign: 'center' },
  disabled: { opacity: 0.6 },
});

export default BeautyDesignCreator;
