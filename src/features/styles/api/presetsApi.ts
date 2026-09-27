import { apiGet } from '@api/client';

/** One-tap starting texts edited from the zena backoffice (GET /prompt-presets). */
export interface PromptPreset {
  key: string;
  title: string;
  body: string;
  gender?: 'female' | 'male' | null;
}

export type PresetFlow = 'style' | 'hair' | 'makeup' | 'nails';

export type PromptPresets = Partial<Record<PresetFlow, PromptPreset[]>>;

// The four lists are short and rarely change: one request per app session.
let cache: Promise<PromptPresets> | null = null;

export function fetchPromptPresets(): Promise<PromptPresets> {
  if (!cache) {
    cache = apiGet<PromptPresets>('/prompt-presets').catch(err => {
      cache = null;
      throw err;
    });
  }
  return cache;
}
