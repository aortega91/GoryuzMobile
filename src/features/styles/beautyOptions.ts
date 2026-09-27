/**
 * Beauty questionnaire options — ids mirror zena `src/constants/beautyOptions.ts`
 * exactly: the server translates each id into the prompt text itself
 * (`describeBeautyAnswers`), so an id it doesn't know is silently dropped.
 * Labels live in i18n under `styles.beautyOpt.<question>.<id>`.
 */
import { BeautyKind } from './types';

export type BeautyQuestion =
  | 'hairMode'
  | 'faceShape'
  | 'hairTexture'
  | 'hairThickness'
  | 'beardDensity'
  | 'skinType'
  | 'lipThickness'
  | 'eyeStyle'
  | 'nailThickness'
  | 'nailLength';

export const BEAUTY_OPTIONS: Record<BeautyQuestion, string[]> = {
  hairMode: ['hair', 'beard', 'both'],
  faceShape: ['oval', 'round', 'square', 'heart', 'long'],
  hairTexture: ['straight', 'wavy', 'curly', 'afro'],
  hairThickness: ['fine', 'medium', 'thick'],
  beardDensity: ['low', 'medium', 'full'],
  skinType: ['combination', 'oily', 'dry', 'sensitive'],
  lipThickness: ['thin', 'medium', 'full'],
  eyeStyle: ['smokey', 'liner', 'cat-eye', 'natural'],
  nailThickness: ['thin', 'medium', 'strong'],
  nailLength: ['short', 'medium', 'long', 'extra-long'],
};

export const NAIL_TARGETS = ['hands', 'feet'] as const;
export const NAIL_SHAPES = ['almond', 'stiletto', 'square', 'coffin'] as const;

/** Which endpoint action/price key each kind maps to (zena GEM_COSTS defaults). */
export const BEAUTY_GEM_COST: Record<BeautyKind, number> = {
  hair: 10,
  makeup: 10,
  nails: 10,
};

export const TECH_SHEET_GEM_COST = 3;
