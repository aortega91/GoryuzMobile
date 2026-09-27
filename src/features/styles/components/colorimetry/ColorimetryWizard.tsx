import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { AlertTriangleIcon, ArrowLeftIcon, CameraIcon, PaletteIcon, SparklesIcon } from '@assets/icons';
import { ApiError } from '@api/client';
import { ClothingItem } from '@features/collection/types';
import { UserProfile } from '@features/home/api/profileApi';
import { loadProfile, updateProfileLocally } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import { analyzeColorimetry, saveColorimetryProfile } from '../../api/colorimetryApi';
import { COLORIMETRY_QUESTIONS } from '../../colorimetry/constants';
import { classifySeason, type ColorimetryAnswers, type ColorimetryMeasurement } from '../../colorimetry/colorimetry';
import { buildGuidedPayload, buildProfilePatch, buildProfileResult } from '../../colorimetry/guided';
import { optionLabel, questionSubtitle, questionTitle } from '../../colorimetry/labels';
import type { ColorimetryProfile } from '../../colorimetry/types';
import ColorimetryCapture from './ColorimetryCapture';
import ColorimetryResults from './ColorimetryResults';

/** `GET /profile` returns it (zena schemas/profile.ts); the shared type predates it. */
type ProfileWithColorimetry = UserProfile & { colorimetryProfile?: ColorimetryProfile | null };

interface Props {
  profile: UserProfile | null;
  closet: ClothingItem[];
  onGoToCloset?: () => void;
  /** A plan restriction (403 `plan_restricted`) opens the upgrade modal. */
  onUpgrade: () => void;
}

type Step = 'welcome' | 'questions' | 'camera' | 'analyzing' | 'results';

const WELCOME_STEPS = ['welcomeStep1', 'welcomeStep2', 'welcomeStep3'];

/**
 * Guided colour test, start to finish — port of zena's ColorimetryWizard.
 *
 * Order matters: first what the camera cannot read (undyed roots, eyes, how
 * the skin reacts to the sun), then the scan. When photo and answers disagree
 * there is something to weigh against. The gem cost (5, server-side) is not
 * announced, like every other action of the module in zena.
 */
function ColorimetryWizard({ profile, closet, onGoToCloset, onUpgrade }: Props) {
  const { t } = useTranslation();
  const c = useStylesTheme().colorimetry;
  const dispatch = useDispatch<AppDispatch>();

  const saved = (profile as ProfileWithColorimetry | null)?.colorimetryProfile ?? null;
  const [step, setStep] = useState<Step>(saved ? 'results' : 'welcome');
  const [answers, setAnswers] = useState<Partial<ColorimetryAnswers>>(
    (saved?.answers as Partial<ColorimetryAnswers>) ?? {},
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState<ColorimetryProfile | null>(saved);
  const [error, setError] = useState<string | null>(null);

  const question = COLORIMETRY_QUESTIONS[questionIndex];
  const total = COLORIMETRY_QUESTIONS.length;

  const answerAndAdvance = (value: string) => {
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    if (questionIndex < total - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setStep('camera');
    }
  };

  const handleCapture = async (measurement: ColorimetryMeasurement, imageBase64: string, mimeType: string) => {
    setStep('analyzing');
    setError(null);

    const complete = answers as ColorimetryAnswers;
    const verdict = classifySeason(measurement, complete);

    try {
      const ai = await analyzeColorimetry({
        imageBase64,
        mimeType,
        guided: buildGuidedPayload(verdict, measurement, complete),
      });
      const profileResult = buildProfileResult(verdict, measurement, complete, ai, new Date().toISOString());
      setResult(profileResult);
      const patch = buildProfilePatch(profileResult);
      try {
        const updated = await saveColorimetryProfile(patch);
        dispatch(updateProfileLocally(updated));
      } catch (err) {
        // The analysis is paid for and shown; only persisting it failed.
        logError(err instanceof Error ? err : new Error(String(err)), 'colorimetry/save');
        dispatch(updateProfileLocally(patch as Partial<UserProfile>));
      }
      // Gems were charged: sync the count. After the save, so a fetch that
      // started before it cannot overwrite the new season with stale data.
      dispatch(loadProfile());
      setStep('results');
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'colorimetry/analyze');
      if (err instanceof ApiError && err.status === 403) onUpgrade();
      // Out of gems (402) and any other failure: zena's message, back to the camera.
      setError(t('styles.colorimetry.analysisError'));
      setStep('camera');
    }
  };

  const restart = () => {
    setAnswers({});
    setQuestionIndex(0);
    setError(null);
    setStep('welcome');
  };

  // ─── Welcome ────────────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <View style={styles.welcome}>
        <View style={[styles.welcomeIcon, { backgroundColor: c.welcomeIconBackground }]}>
          <PaletteIcon size={26} color={c.welcomeIconColor} />
        </View>
        <View>
          <Text style={[styles.welcomeTitle, { color: c.title }]}>{t('styles.colorimetry.welcomeTitle')}</Text>
          <Text style={[styles.welcomeBody, { color: c.body }]}>{t('styles.colorimetry.welcomeBody')}</Text>
        </View>

        <View style={styles.stepsList}>
          {WELCOME_STEPS.map((key, i) => (
            <View key={key} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: c.stepBadgeBackground }]}>
                <Text style={[styles.stepBadgeText, { color: c.stepBadgeText }]}>{i + 1}</Text>
              </View>
              <Text style={[styles.stepText, { color: c.stepText }]}>{t(`styles.colorimetry.${key}`)}</Text>
            </View>
          ))}
        </View>

        <Touchable
          onPress={() => setStep('questions')}
          borderRadius={12}
          style={[styles.primaryBtn, { backgroundColor: c.primaryButton }]}
        >
          <SparklesIcon size={16} color={c.primaryButtonText} />
          <Text style={[styles.primaryText, { color: c.primaryButtonText }]}>{t('styles.colorimetry.start')}</Text>
        </Touchable>
      </View>
    );
  }

  // ─── Questionnaire ──────────────────────────────────────────────────────────
  if (step === 'questions') {
    return (
      <View style={styles.questions}>
        <View style={styles.progressRow}>
          <Touchable
            onPress={() => (questionIndex === 0 ? setStep('welcome') : setQuestionIndex(questionIndex - 1))}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            borderRadius={16}
            accessibilityLabel={t('styles.colorimetry.back')}
            style={styles.backBtn}
          >
            <ArrowLeftIcon size={18} color={c.backIcon} />
          </Touchable>
          <View style={[styles.progressTrack, { backgroundColor: c.progressTrack }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: c.progressFill, width: `${((questionIndex + 1) / total) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: c.progressText }]}>
            {t('styles.colorimetry.progress', { current: questionIndex + 1, total })}
          </Text>
        </View>

        <View>
          <Text style={[styles.questionTitle, { color: c.title }]}>{questionTitle(t, question.id)}</Text>
          <Text style={[styles.questionSubtitle, { color: c.body }]}>{questionSubtitle(t, question.id)}</Text>
        </View>

        <View style={styles.options}>
          {(question.options as readonly { value: string; swatch?: string }[]).map(option => {
            const isChosen = answers[question.id] === option.value;
            return (
              <Touchable
                key={option.value}
                onPress={() => answerAndAdvance(option.value)}
                borderRadius={12}
                style={[
                  styles.option,
                  isChosen
                    ? { borderColor: c.optionChosenBorder, backgroundColor: c.optionChosenBackground }
                    : { borderColor: c.optionBorder, backgroundColor: c.optionBackground },
                ]}
              >
                {option.swatch ? (
                  <View style={[styles.optionSwatch, { backgroundColor: option.swatch, borderColor: c.swatchBorder }]} />
                ) : null}
                <Text style={[styles.optionText, { color: c.optionText }]}>
                  {optionLabel(t, question.id, option.value)}
                </Text>
              </Touchable>
            );
          })}
        </View>
      </View>
    );
  }

  // ─── Camera ─────────────────────────────────────────────────────────────────
  if (step === 'camera') {
    return (
      <View style={styles.camera}>
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: c.errorBackground }]}>
            <AlertTriangleIcon size={15} color={c.errorText} />
            <Text style={[styles.errorBannerText, { color: c.errorText }]}>{error}</Text>
          </View>
        )}
        <ColorimetryCapture
          onCapture={handleCapture}
          onCancel={() => {
            setQuestionIndex(total - 1);
            setStep('questions');
          }}
        />
      </View>
    );
  }

  // ─── Analyzing ──────────────────────────────────────────────────────────────
  if (step === 'analyzing') {
    return (
      <View style={styles.analyzing}>
        <ActivityIndicator size="large" color={c.spinner} />
        <Text style={[styles.analyzingTitle, { color: c.analyzingTitle }]}>{t('styles.colorimetry.analyzingTitle')}</Text>
        <Text style={[styles.analyzingBody, { color: c.analyzingBody }]}>{t('styles.colorimetry.analyzingBody')}</Text>
      </View>
    );
  }

  // ─── Results ────────────────────────────────────────────────────────────────
  if (result) {
    return <ColorimetryResults profile={result} closet={closet} onRedo={restart} onGoToCloset={onGoToCloset} />;
  }

  return (
    <Touchable onPress={restart} borderRadius={12} style={[styles.fallbackBtn, { backgroundColor: c.neutralButtonBackground }]}>
      <CameraIcon size={15} color={c.neutralButtonText} />
      <Text style={[styles.fallbackText, { color: c.neutralButtonText }]}>{t('styles.colorimetry.startAnalysis')}</Text>
    </Touchable>
  );
}

// zena mobile (~390 px): text-center space-y-4 py-2 welcome, w-14 icon,
// max-w-xs list and button, space-y-2 options with px-3.5 py-3.
const styles = StyleSheet.create({
  welcome: { alignItems: 'center', gap: 16, paddingVertical: 8 },
  welcomeIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  welcomeBody: { fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 4, maxWidth: 384 },
  stepsList: { width: '100%', maxWidth: 320, gap: 8 },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepBadgeText: { fontSize: 10, fontWeight: '700' },
  stepText: { flex: 1, fontSize: 12, lineHeight: 17 },
  primaryBtn: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { fontSize: 14, fontWeight: '700' },
  questions: { gap: 16 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { padding: 8, marginLeft: -8 },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' },
  progressText: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  questionTitle: { fontSize: 16, fontWeight: '700' },
  questionSubtitle: { fontSize: 12, marginTop: 2 },
  options: { gap: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
  optionText: { flex: 1, fontSize: 14, fontWeight: '600' },
  camera: { gap: 12 },
  errorBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, padding: 12 },
  errorBannerText: { flex: 1, fontSize: 12, lineHeight: 17 },
  analyzing: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  analyzingTitle: { fontSize: 14, fontWeight: '700' },
  analyzingBody: { fontSize: 12, textAlign: 'center', maxWidth: 320 },
  fallbackBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fallbackText: { fontSize: 14, fontWeight: '700' },
});

export default ColorimetryWizard;
