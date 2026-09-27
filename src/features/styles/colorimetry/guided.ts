/**
 * The non-UI half of zena's `ColorimetryWizard.handleCapture`: what is sent to
 * `/api/gemini/colorimetry` and what is stored on the profile afterwards.
 * Kept as pure functions so the equivalence check can compare them with zena's
 * code; any change there must be mirrored here.
 */
import { COLORIMETRY_QUESTIONS, SEASON_PALETTES } from './constants';
import {
  classifySeason,
  type ColorimetryAnswers,
  type ColorimetryMeasurement,
  type ColorimetryVerdict,
  type SeasonKey,
} from './colorimetry';
import type { ColorimetryProfile, GuidedColorimetryPayload, GuidedColorimetryResult } from './types';

/**
 * The questionnaire in plain language, not internal keys — built from the
 * Spanish `title`/`label` of the verbatim constants, exactly like zena, so the
 * model receives the same prompt whatever language the app is in.
 */
export function buildAnswersText(complete: ColorimetryAnswers): string {
  return COLORIMETRY_QUESTIONS.map(q => {
    const chosen = (q.options as readonly { value: string; label: string }[]).find(
      o => o.value === complete[q.id],
    );
    return `- ${q.title} ${chosen?.label ?? 'sin responder'}`;
  }).join('\n');
}

export function buildGuidedPayload(
  verdict: ColorimetryVerdict,
  measurement: ColorimetryMeasurement,
  complete: ColorimetryAnswers,
): GuidedColorimetryPayload {
  return {
    season: verdict.season,
    undertone: verdict.undertone,
    depth: verdict.depth,
    contrast: verdict.contrast,
    skinHex: measurement.skinHex,
    answers: buildAnswersText(complete),
  };
}

export function buildProfileResult(
  verdict: ColorimetryVerdict,
  measurement: ColorimetryMeasurement,
  complete: ColorimetryAnswers,
  ai: GuidedColorimetryResult,
  analyzedAt: string,
): ColorimetryProfile {
  const finalSeason = (SEASON_PALETTES as Record<string, unknown>)[ai.season] ? ai.season : verdict.season;

  return {
    season: finalSeason,
    undertone: verdict.undertone,
    depth: verdict.depth,
    contrast: verdict.contrast,
    // If the model changed the season, the app trusted its own maths less:
    // it shows in the confidence instead of being hidden.
    confidence: ai.agrees ? verdict.confidence : Math.max(0.35, verdict.confidence - 0.15),
    skinHex: measurement.skinHex,
    answers: complete as unknown as Record<string, string>,
    summary: ai.summary,
    makeup: ai.makeup ?? [],
    clothing: ai.clothing ?? [],
    reasons: verdict.reasons,
    agrees: ai.agrees,
    analyzedAt,
  };
}

/**
 * What zena's StylistView `onSave` writes: the full profile plus the three
 * legacy fields the drapes and garment compatibility still read.
 */
export function buildProfilePatch(result: ColorimetryProfile) {
  const palette = SEASON_PALETTES[result.season as SeasonKey];
  return {
    colorimetryProfile: result,
    colorSeason: palette?.label ?? '',
    colorimetryResult: result.summary,
    colorPalette: palette?.favor.map(c => c.hex) ?? [],
  };
}

export { classifySeason };
