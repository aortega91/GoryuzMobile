import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';



// ─── Auth module theme tokens ─────────────────────────────────────────────────

export interface AuthTheme extends Theme {
  auth: {
    /** Screen background */
    background: string;
    /** Card / surface colour */
    surface: string;
    /** Primary headline / brand text */
    headlineText: string;
    /** Body / sub-copy text */
    bodyText: string;
    /** Accent text (legacy — kept for backwards compat) */
    accentText: string;
    /** Logo card background */
    logoCardBg: string;
    /** Logo colour */
    logoColor: string;
    /** Google sign-in button background */
    googleButtonBg: string;
    /** Google sign-in button text */
    googleButtonText: string;
    /** Google sign-in button border */
    googleButtonBorder: string;
    /** Error message text */
    errorText: string;
    /** Separator line */
    separator: string;
    /** Decorative background blob colours */
    blob1: string;
    blob2: string;
    blob3: string;
    /** Feature pillar card background */
    pillarCardBg: string;
    /** Feature pillar card border */
    pillarCardBorder: string;
    /** Feature pillar icon container background */
    pillarIconBg: string;
    /** Feature pillar icon colour */
    pillarIconColor: string;
    /** Feature pillar label text */
    pillarText: string;
  };
}

// ─── Light variant ────────────────────────────────────────────────────────────
function buildAuthLight(palette: BrandPalette): AuthTheme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    auth: {
      background: commonColors.slateBackground,
      surface: commonColors.white,
      headlineText: accent600,
      bodyText: '#6B7280',
      accentText: accent600,
      logoCardBg: commonColors.white,
      logoColor: accent600,
      googleButtonBg: commonColors.white,
      googleButtonText: '#374151',
      googleButtonBorder: '#E5E7EB',
      errorText: commonColors.errorRed,
      separator: 'rgba(0,0,0,0.10)',
      blob1: 'rgba(99,102,241,0.15)',
      blob2: 'rgba(168,85,247,0.15)',
      blob3: 'rgba(244,114,182,0.15)',
      pillarCardBg: commonColors.white,
      pillarCardBorder: commonColors.grayLight,
      pillarIconBg: accent100,
      pillarIconColor: accent600,
      pillarText: '#1F2937',
    },
  };
}

// ─── Dark variant ─────────────────────────────────────────────────────────────
function buildAuthDark(palette: BrandPalette): AuthTheme {
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    auth: {
      background: commonColors.darkSurface,
      surface: commonColors.darkCard,
      headlineText: commonColors.white,
      bodyText: 'rgba(255,255,255,0.75)',
      accentText: accent400,
      logoCardBg: commonColors.darkCard,
      logoColor: commonColors.white,
      googleButtonBg: commonColors.white,
      googleButtonText: palette.primary,
      googleButtonBorder: commonColors.grayLight,
      errorText: '#FF6B6B',
      separator: 'rgba(255,255,255,0.15)',
      blob1: 'rgba(99,102,241,0.10)',
      blob2: 'rgba(168,85,247,0.10)',
      blob3: 'rgba(244,114,182,0.10)',
      pillarCardBg: 'rgba(27,42,74,0.85)',
      pillarCardBorder: 'rgba(46,74,128,0.50)',
      // Icon container is a raised surface over the dark card — a translucent
      // primary tint reads better here than a flat deep accent tone.
      pillarIconBg: withAlpha(palette.primary, 0.08),
      pillarIconColor: commonColors.white,
      pillarText: commonColors.white,
    },
  };
}

export function getAuthTheme(palette: BrandPalette): AuthTheme {
  return palette.dark ? buildAuthDark(palette) : buildAuthLight(palette);
}
