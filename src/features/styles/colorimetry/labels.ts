/**
 * Display text for the colour test. The verbatim zena files carry Spanish
 * strings (question labels, palette names, classification reasons) because
 * zena sends or stores them as-is; the UI translates them through the
 * `styles.colorimetry.*` keys and falls back to the Spanish original when a key
 * is missing (e.g. a palette colour added in zena before the re-sync).
 */
import type { TFunction } from 'i18next';

const NS = 'styles.colorimetry';

/** The six sentences `classifySeason` can put in `reasons`, as zena writes them. */
const REASON_KEYS: Record<string, string> = {
  'La cámara leyó matices dorados en tu piel.': 'cameraWarm',
  'La cámara leyó matices rosados en tu piel.': 'cameraCool',
  'Tus respuestas apuntaban al lado contrario, así que el resultado es mixto.': 'mixed',
  'Hay mucha diferencia entre tu pelo y tu piel: aguantas colores rotundos.': 'contrastHigh',
  'Tu pelo y tu piel están cerca en claridad: te sientan mejor los tonos suaves.': 'contrastLow',
  'Tu pelo y tu piel tienen una diferencia media.': 'contrastMedium',
};

/** "Azul marino cálido" → "azulMarinoCalido": the key of a palette colour name. */
export function colorNameKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

export const colorName = (t: TFunction, name: string) =>
  t(`${NS}.colorNames.${colorNameKey(name)}`, { defaultValue: name });

export const seasonLabel = (t: TFunction, season: string, fallback: string) =>
  t(`${NS}.seasons.${season}.label`, { defaultValue: fallback });

export const seasonVibe = (t: TFunction, season: string, fallback: string) =>
  t(`${NS}.seasons.${season}.vibe`, { defaultValue: fallback });

export const reasonText = (t: TFunction, reason: string) => {
  const key = REASON_KEYS[reason];
  return key ? t(`${NS}.reasons.${key}`) : reason;
};

export const questionTitle = (t: TFunction, id: string) => t(`${NS}.questions.${id}.title`);
export const questionSubtitle = (t: TFunction, id: string) => t(`${NS}.questions.${id}.subtitle`);
export const optionLabel = (t: TFunction, id: string, value: string) =>
  t(`${NS}.questions.${id}.options.${value}`);
