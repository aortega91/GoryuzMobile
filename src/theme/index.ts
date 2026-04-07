import commonColors from './commonColors';

// ─── Common theme tokens ──────────────────────────────────────────────────────

export interface CommonTheme {
  /** Brand accent */
  gold: string;
  goldLight: string;
  /** Neutrals */
  white: string;
  offWhite: string;
  grayLight: string;
  gray: string;
  grayDark: string;
  black: string;
  /** Semantic */
  errorRed: string;
  successGreen: string;
  warningAmber: string;
  /** Overlays */
  overlayDark: string;
  overlayLight: string;
}

// ─── Full theme shape ─────────────────────────────────────────────────────────

export interface Theme {
  dark: boolean;
  common: CommonTheme;
}

// ─── Light theme ──────────────────────────────────────────────────────────────

export const lightTheme: Theme = {
  dark: false,
  common: {
    gold: commonColors.gold,
    goldLight: commonColors.goldLight,
    white: commonColors.white,
    offWhite: commonColors.offWhite,
    grayLight: commonColors.grayLight,
    gray: commonColors.gray,
    grayDark: commonColors.grayDark,
    black: commonColors.black,
    errorRed: commonColors.errorRed,
    successGreen: commonColors.successGreen,
    warningAmber: commonColors.warningAmber,
    overlayDark: commonColors.overlayDark,
    overlayLight: commonColors.overlayLight,
  },
};

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  dark: true,
  common: {
    gold: commonColors.goldLight,      // slightly brighter gold on dark bg
    goldLight: commonColors.goldLight,
    white: commonColors.offWhite,      // soften pure white
    offWhite: commonColors.grayLight,
    grayLight: commonColors.darkBorder,
    gray: commonColors.grayDark,
    grayDark: commonColors.gray,
    black: commonColors.black,
    errorRed: '#E05A5E',               // brighter red for dark bg readability
    successGreen: '#4DBF87',
    warningAmber: commonColors.warningAmber,
    overlayDark: 'rgba(0,0,0,0.70)',
    overlayLight: 'rgba(255,255,255,0.08)',
  },
};
