/** Mirrors zena `ColorimetryProfile` (src/types/index.ts) — stored on the profile. */
export interface ColorimetryProfile {
  /** One of the 12 season keys. */
  season: string;
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  contrast: 'low' | 'medium' | 'high';
  confidence: number;
  /** Mean clean-skin colour the camera read. */
  skinHex: string;
  /** Questionnaire answers, so the test can be redone without asking again. */
  answers: Record<string, string>;
  summary: string;
  makeup: string[];
  clothing: string[];
  /** What the app's classification was based on. */
  reasons: string[];
  /** Whether the model kept the season the app computed. */
  agrees: boolean;
  analyzedAt: string;
}

/** zena `GuidedColorimetryPayload` — the `guided` body field. */
export interface GuidedColorimetryPayload {
  season: string;
  undertone: string;
  depth: string;
  contrast: string;
  skinHex: string;
  answers: string;
}

/** zena `GuidedColorimetryResult` — what the endpoint answers. */
export interface GuidedColorimetryResult {
  season: string;
  agrees: boolean;
  summary: string;
  makeup: string[];
  clothing: string[];
}
