import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';



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
export const authLightTheme: AuthTheme = {
  ...lightTheme,
  auth: {
    background: commonColors.slateBackground,
    surface: commonColors.white,
    headlineText: commonColors.indigo,
    bodyText: '#6B7280',
    accentText: commonColors.gold,
    logoCardBg: commonColors.white,
    logoColor: commonColors.indigo,
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
    pillarIconBg: commonColors.indigoSoft,
    pillarIconColor: commonColors.indigo,
    pillarText: '#1F2937',
  },
};

// ─── Dark variant ─────────────────────────────────────────────────────────────
export const authDarkTheme: AuthTheme = {
  ...darkTheme,
  auth: {
    background: commonColors.navyDark,
    surface: commonColors.navyMid,
    headlineText: commonColors.white,
    bodyText: 'rgba(255,255,255,0.75)',
    accentText: commonColors.goldLight,
    logoCardBg: commonColors.navy,
    logoColor: commonColors.white,
    googleButtonBg: commonColors.white,
    googleButtonText: commonColors.navyDark,
    googleButtonBorder: commonColors.grayLight,
    errorText: '#FF6B6B',
    separator: 'rgba(255,255,255,0.15)',
    blob1: 'rgba(99,102,241,0.10)',
    blob2: 'rgba(168,85,247,0.10)',
    blob3: 'rgba(244,114,182,0.10)',
    pillarCardBg: 'rgba(27,42,74,0.85)',
    pillarCardBorder: 'rgba(46,74,128,0.50)',
    pillarIconBg: commonColors.navyMid,
    pillarIconColor: commonColors.white,
    pillarText: commonColors.white,
  },
};
