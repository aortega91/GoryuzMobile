/**
 * palettes
 *
 * The four brand themes from the zena reference (`src/lib/theme.ts` +
 * `src/styles/global.css` on the `preview` branch). Each theme carries its own
 * `primary` colour and full `accent` scale (50-950) plus a `dark` flag — only
 * `boutique` reads as a dark theme; the other three are light layouts with a
 * different primary/accent pair. There is no link to the device colour scheme:
 * the user picks one of these four explicitly (see ThemePicker in Profile),
 * exactly like the reference.
 */

export type ThemeId = 'natural' | 'boutique' | 'moderno' | 'elegancia';

export interface AccentScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface BrandPalette {
  id: ThemeId;
  /** i18n key for the picker label */
  labelKey: string;
  /** Only `boutique` is true — mirrors the reference's `THEMES[].dark` */
  dark: boolean;
  primary: string;
  accent: AccentScale;
  /**
   * The reference's bare `--accent` var — what `dark:text-accent` etc. resolve
   * to. Usually equal to accent[600], except `elegancia` where the reference
   * sets it to accent[500].
   */
  accentDefault: string;
  /** [accent, primary] swatch dots for the picker UI, taken from the reference's own curated swatch (not derived from the scale) */
  swatch: [string, string];
}

export const BRAND_PALETTES: Record<ThemeId, BrandPalette> = {
  natural: {
    id: 'natural',
    labelKey: 'profile.themeNatural',
    dark: false,
    primary: '#4E3B31',
    accentDefault: '#667E63',
    accent: {
      50: '#F4F6F4',
      100: '#EAECE9',
      200: '#D3DBD1',
      300: '#B7C5B5',
      400: '#96AA92',
      500: '#7A9376',
      600: '#667E63',
      700: '#546751',
      800: '#41503F',
      900: '#313C2F',
      950: '#1E251D',
    },
    swatch: ['#A8B5A6', '#4E3B31'],
  },
  boutique: {
    id: 'boutique',
    labelKey: 'profile.themeBoutique',
    dark: true,
    primary: '#0F172A',
    accentDefault: '#B99728',
    accent: {
      50: '#F9F7F1',
      100: '#F3EFE3',
      200: '#F1E4BC',
      300: '#E8D392',
      400: '#DDBF5F',
      500: '#D4AE36',
      600: '#B99728',
      700: '#977B20',
      800: '#766019',
      900: '#584813',
      950: '#372C0C',
    },
    swatch: ['#D4AF37', '#0F172A'],
  },
  moderno: {
    id: 'moderno',
    labelKey: 'profile.themeModerno',
    dark: false,
    primary: '#333333',
    accentDefault: '#8E6452',
    accent: {
      50: '#F6F4F3',
      100: '#EEE9E7',
      200: '#E1D2CB',
      300: '#CEB5AB',
      400: '#B89384',
      500: '#A57764',
      600: '#8E6452',
      700: '#745243',
      800: '#5A3F34',
      900: '#443027',
      950: '#2A1D18',
    },
    swatch: ['#A97D6B', '#333333'],
  },
  elegancia: {
    id: 'elegancia',
    labelKey: 'profile.themeElegancia',
    dark: false,
    primary: '#1A1A1A',
    accentDefault: '#C5A087',
    accent: {
      50: '#FAF6F3',
      100: '#F5EEE8',
      200: '#ECDDD1',
      300: '#E0C7B4',
      400: '#D0AC93',
      500: '#C5A087',
      600: '#AE866B',
      700: '#916E57',
      800: '#725745',
      900: '#584336',
      950: '#362921',
    },
    swatch: ['#C5A087', '#1A1A1A'],
  },
};

/** Same order the reference renders its picker in. */
export const THEME_ORDER: ThemeId[] = ['natural', 'boutique', 'moderno', 'elegancia'];

/** Matches the reference's `DEFAULT_THEME` — a light theme, not device-driven. */
export const DEFAULT_THEME_ID: ThemeId = 'moderno';

export function getBrandPalette(themeId: ThemeId | null | undefined): BrandPalette {
  if (themeId && BRAND_PALETTES[themeId]) return BRAND_PALETTES[themeId];
  return BRAND_PALETTES[DEFAULT_THEME_ID];
}

/** `#RRGGBB` -> `rgba(r, g, b, alpha)`, for translucent brand-colour overlays. */
export function withAlpha(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
