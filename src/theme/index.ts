import commonColors from './commonColors';

// ─── Common theme tokens ──────────────────────────────────────────────────────

export interface CommonTheme {
  /** Brand accent */
  copper: string;
  copperLight: string;
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
  /** Toast notifications */
  toastSuccessBackground: string;
  toastSuccessText: string;
  toastErrorBackground: string;
  toastErrorText: string;
  toastInfoBackground: string;
  toastInfoText: string;
  /** Feature welcome dialogs (FeatureWelcomeModal) */
  onboardingCardBackground: string;
  onboardingCardBorder: string;
  onboardingTitle: string;
  onboardingAccent: string;
  onboardingAccentSoft: string;
  onboardingAccentText: string;
  onboardingStepBackground: string;
  onboardingStepText: string;
  onboardingCheck: string;
  onboardingCheckSoft: string;
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
    copper: commonColors.copper,
    copperLight: commonColors.copperLight,
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
    toastSuccessBackground: '#DCFCE7',
    toastSuccessText: '#166534',
    toastErrorBackground: '#FEE2E2',
    toastErrorText: '#991B1B',
    toastInfoBackground: commonColors.navyDark,
    toastInfoText: commonColors.offWhite,
    onboardingCardBackground: commonColors.white,
    onboardingCardBorder: commonColors.grayLight,
    onboardingTitle: commonColors.navyDark,
    onboardingAccent: commonColors.indigo,
    onboardingAccentSoft: commonColors.indigoSoft,
    onboardingAccentText: commonColors.white,
    onboardingStepBackground: commonColors.offWhite,
    onboardingStepText: commonColors.grayDark,
    onboardingCheck: commonColors.successGreen,
    onboardingCheckSoft: '#DCFCE7',
  },
};

// ─── Dark theme ───────────────────────────────────────────────────────────────

export const darkTheme: Theme = {
  dark: true,
  common: {
    copper: commonColors.copperLight,    // lifted copper for contrast on dark
    copperLight: commonColors.copperLight,
    white: commonColors.offWhite,      // soften pure white
    offWhite: commonColors.grayLight,
    grayLight: commonColors.darkBorder,
    gray: commonColors.grayDark,
    grayDark: commonColors.gray,
    black: commonColors.black,
    errorRed: '#D15353',               // brighter terracotta for dark bg readability
    successGreen: '#65C084',
    warningAmber: commonColors.warningAmber,
    overlayDark: 'rgba(0,0,0,0.70)',
    overlayLight: 'rgba(255,255,255,0.08)',
    toastSuccessBackground: '#14532D',
    toastSuccessText: '#86EFAC',
    toastErrorBackground: '#7F1D1D',
    toastErrorText: '#FCA5A5',
    toastInfoBackground: commonColors.grayLight,
    toastInfoText: commonColors.navyDark,
    onboardingCardBackground: commonColors.darkCard,
    onboardingCardBorder: commonColors.darkBorder,
    onboardingTitle: commonColors.offWhite,
    onboardingAccent: commonColors.indigoLight,        // lifted indigo for contrast on dark
    onboardingAccentSoft: 'rgba(99,102,241,0.18)',
    onboardingAccentText: commonColors.white,
    onboardingStepBackground: commonColors.darkBorder,
    onboardingStepText: commonColors.grayLight,
    onboardingCheck: '#65C084',
    onboardingCheckSoft: 'rgba(101,192,132,0.18)',
  },
};
