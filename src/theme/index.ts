import commonColors from './commonColors';
import { BrandPalette, withAlpha } from './palettes';

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

// ─── Light-structural variant — used by natural/moderno/elegancia ────────────

function buildCommonLight(palette: BrandPalette): Theme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    dark: false,
    common: {
      copper: accent600,
      copperLight: palette.accent[400],
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
      toastInfoBackground: palette.primary,
      toastInfoText: commonColors.offWhite,
      onboardingCardBackground: commonColors.white,
      onboardingCardBorder: commonColors.grayLight,
      onboardingTitle: palette.primary,
      onboardingAccent: accent600,
      onboardingAccentSoft: accent100,
      onboardingAccentText: commonColors.white,
      onboardingStepBackground: commonColors.offWhite,
      onboardingStepText: commonColors.grayDark,
      onboardingCheck: commonColors.successGreen,
      onboardingCheckSoft: '#DCFCE7',
    },
  };
}

// ─── Dark-structural variant — used only by `boutique` ────────────────────────

function buildCommonDark(palette: BrandPalette): Theme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    dark: true,
    common: {
      copper: accentDefault,
      copperLight: accent400,
      white: commonColors.offWhite,
      offWhite: commonColors.grayLight,
      grayLight: commonColors.darkBorder,
      gray: commonColors.grayDark,
      grayDark: commonColors.gray,
      black: commonColors.black,
      errorRed: '#D15353',
      successGreen: '#65C084',
      warningAmber: commonColors.warningAmber,
      overlayDark: 'rgba(0,0,0,0.70)',
      overlayLight: 'rgba(255,255,255,0.08)',
      toastSuccessBackground: '#14532D',
      toastSuccessText: '#86EFAC',
      toastErrorBackground: '#7F1D1D',
      toastErrorText: '#FCA5A5',
      toastInfoBackground: commonColors.grayLight,
      toastInfoText: palette.primary,
      onboardingCardBackground: commonColors.darkCard,
      onboardingCardBorder: commonColors.darkBorder,
      onboardingTitle: commonColors.offWhite,
      onboardingAccent: accentDefault,
      onboardingAccentSoft: withAlpha(accentDefault, 0.18),
      onboardingAccentText: commonColors.white,
      onboardingStepBackground: commonColors.darkBorder,
      onboardingStepText: commonColors.grayLight,
      onboardingCheck: '#65C084',
      onboardingCheckSoft: 'rgba(101,192,132,0.18)',
    },
  };
}

export function getCommonTheme(palette: BrandPalette): Theme {
  return palette.dark ? buildCommonDark(palette) : buildCommonLight(palette);
}
