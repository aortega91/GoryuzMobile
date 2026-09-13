import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface ProfileTheme extends Theme {
  profile: {
    background: string;
    headerBackground: string;
    headerBorder: string;
    headerTitle: string;
    headerIcon: string;

    sectionTitle: string;
    sectionSubtitle: string;

    cardBackground: string;
    cardBorder: string;

    textPrimary: string;
    textSecondary: string;

    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputBorderFocused: string;

    fieldLabel: string;
    fieldReadonlyBackground: string;
    fieldReadonlyText: string;

    pickerActiveBackground: string;

    avatarBorder: string;

    planBadgeFreeBackground: string;
    planBadgeFreeText: string;
    planBadgePremiumBackground: string;
    planBadgePremiumText: string;
    planBadgePremiumBorder: string;

    dangerCardBackground: string;
    dangerCardBorder: string;
    dangerTitle: string;
    danger: string;
    dangerButtonBackground: string;

    divider: string;

    modalBackground: string;
    modalBackdrop: string;

    primary: string;
    primarySoft: string;
    primaryText: string;

    buttonSecondaryBackground: string;
    buttonSecondaryBorder: string;
    buttonSecondaryText: string;

    gemBadgeBackground: string;
    gemBadgeText: string;
    gemBadgeBorder: string;

    iconSecondary: string;
    white: string;

    toastBackground: string;
    toastText: string;

    // Theme picker (matches the reference's 4-swatch grid in Profile > Settings)
    themePickerCardActiveBorder: string;
    themePickerCardActiveRing: string;
    themePickerCardBackground: string;
    themePickerCardBorder: string;
    themePickerLabel: string;

    // Bottom submodules bar (account/app/subscription — mobile only)
    submodulesBarBackground: string;
    submodulesBarBorder: string;
    submodulesBarIconInactive: string;
    submodulesBarTextInactive: string;
    submodulesBarIconActive: string;
    submodulesBarTextActive: string;
  };
}

function buildProfileLight(palette: BrandPalette): ProfileTheme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    profile: {
      background: commonColors.offWhite,
      headerBackground: commonColors.white,
      headerBorder: commonColors.grayLight,
      headerTitle: palette.primary,
      headerIcon: palette.primary,

      sectionTitle: palette.primary,
      sectionSubtitle: commonColors.grayDark,

      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,

      textPrimary: palette.primary,
      textSecondary: commonColors.grayDark,

      inputBackground: commonColors.white,
      inputBorder: '#D1D5DB',
      inputText: palette.primary,
      inputBorderFocused: accent600,

      fieldLabel: commonColors.grayDark,
      fieldReadonlyBackground: '#F3F4F6',
      fieldReadonlyText: commonColors.gray,

      pickerActiveBackground: accent100,

      avatarBorder: commonColors.grayLight,

      planBadgeFreeBackground: '#F3F4F6',
      planBadgeFreeText: commonColors.grayDark,
      planBadgePremiumBackground: palette.primary,
      planBadgePremiumText: accent600,
      planBadgePremiumBorder: accent600,

      dangerCardBackground: '#FEF2F2',
      dangerCardBorder: '#FECACA',
      dangerTitle: '#991B1B',
      danger: commonColors.errorRed,
      dangerButtonBackground: '#DC2626',

      divider: commonColors.grayLight,

      modalBackground: commonColors.white,
      modalBackdrop: 'rgba(0,0,0,0.55)',

      primary: accent600,
      primarySoft: accent100,
      primaryText: commonColors.white,

      buttonSecondaryBackground: commonColors.white,
      buttonSecondaryBorder: '#D1D5DB',
      buttonSecondaryText: commonColors.grayDark,

      // Gem/coin badge is a fixed purple in the reference — not theme-tied.
      gemBadgeBackground: '#EDE9F7',
      gemBadgeText: '#5B21B6',
      gemBadgeBorder: '#C4B5FD',

      iconSecondary: commonColors.gray,
      white: commonColors.white,

      toastBackground: commonColors.successGreen,
      toastText: commonColors.white,

      themePickerCardActiveBorder: accent600,
      themePickerCardActiveRing: withAlpha(accent600, 0.3),
      themePickerCardBackground: commonColors.white,
      themePickerCardBorder: commonColors.grayLight,
      themePickerLabel: commonColors.grayDark,

      submodulesBarBackground: withAlpha(commonColors.white, 0.95),
      submodulesBarBorder: commonColors.grayLight,
      submodulesBarIconInactive: commonColors.gray,
      submodulesBarTextInactive: commonColors.gray,
      submodulesBarIconActive: accent600,
      submodulesBarTextActive: accent600,
    },
  };
}

function buildProfileDark(palette: BrandPalette): ProfileTheme {
  const { accentDefault } = palette;

  return {
    ...getCommonTheme(palette),
    profile: {
      background: commonColors.darkSurface,
      headerBackground: commonColors.darkCard,
      headerBorder: commonColors.darkBorder,
      headerTitle: commonColors.white,
      headerIcon: commonColors.white,

      sectionTitle: commonColors.white,
      sectionSubtitle: 'rgba(255,255,255,0.55)',

      cardBackground: commonColors.darkCard,
      cardBorder: commonColors.darkBorder,

      textPrimary: commonColors.white,
      textSecondary: 'rgba(255,255,255,0.60)',

      inputBackground: commonColors.darkCard,
      inputBorder: commonColors.darkBorder,
      inputText: commonColors.white,
      inputBorderFocused: accentDefault,

      fieldLabel: 'rgba(255,255,255,0.55)',
      fieldReadonlyBackground: commonColors.darkCard,
      fieldReadonlyText: 'rgba(255,255,255,0.35)',

      pickerActiveBackground: withAlpha(accentDefault, 0.2),

      avatarBorder: commonColors.darkBorder,

      planBadgeFreeBackground: commonColors.darkCard,
      planBadgeFreeText: 'rgba(255,255,255,0.60)',
      planBadgePremiumBackground: palette.primary,
      planBadgePremiumText: accentDefault,
      planBadgePremiumBorder: accentDefault,

      dangerCardBackground: 'rgba(220,38,38,0.12)',
      dangerCardBorder: 'rgba(220,38,38,0.30)',
      dangerTitle: '#FCA5A5',
      danger: '#EF4444',
      dangerButtonBackground: '#EF4444',

      divider: commonColors.darkBorder,

      modalBackground: commonColors.darkCard,
      modalBackdrop: 'rgba(0,0,0,0.70)',

      primary: accentDefault,
      primarySoft: withAlpha(accentDefault, 0.2),
      primaryText: commonColors.white,

      buttonSecondaryBackground: commonColors.darkCard,
      buttonSecondaryBorder: commonColors.darkBorder,
      buttonSecondaryText: 'rgba(255,255,255,0.80)',

      gemBadgeBackground: '#2D1B69',
      gemBadgeText: '#C4B5FD',
      gemBadgeBorder: '#4C1D95',

      iconSecondary: 'rgba(255,255,255,0.40)',
      white: commonColors.white,

      toastBackground: commonColors.successGreen,
      toastText: commonColors.white,

      themePickerCardActiveBorder: accentDefault,
      themePickerCardActiveRing: withAlpha(accentDefault, 0.4),
      themePickerCardBackground: commonColors.darkSurface,
      themePickerCardBorder: commonColors.darkBorder,
      themePickerLabel: 'rgba(255,255,255,0.80)',

      submodulesBarBackground: withAlpha(commonColors.darkCard, 0.95),
      submodulesBarBorder: commonColors.darkBorder,
      submodulesBarIconInactive: commonColors.gray,
      submodulesBarTextInactive: commonColors.gray,
      submodulesBarIconActive: accentDefault,
      submodulesBarTextActive: accentDefault,
    },
  };
}

export function getProfileTheme(palette: BrandPalette): ProfileTheme {
  return palette.dark ? buildProfileDark(palette) : buildProfileLight(palette);
}
