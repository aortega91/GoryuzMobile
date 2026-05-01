import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

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
  };
}

export const profileLightTheme: ProfileTheme = {
  ...lightTheme,
  profile: {
    background: commonColors.offWhite,
    headerBackground: commonColors.white,
    headerBorder: commonColors.grayLight,
    headerTitle: commonColors.navyDark,
    headerIcon: commonColors.navyDark,

    sectionTitle: commonColors.navyDark,
    sectionSubtitle: commonColors.grayDark,

    cardBackground: commonColors.white,
    cardBorder: commonColors.grayLight,

    textPrimary: commonColors.navyDark,
    textSecondary: commonColors.grayDark,

    inputBackground: commonColors.white,
    inputBorder: '#D1D5DB',
    inputText: commonColors.navyDark,
    inputBorderFocused: commonColors.navyLight,

    fieldLabel: commonColors.grayDark,
    fieldReadonlyBackground: '#F3F4F6',
    fieldReadonlyText: commonColors.gray,

    pickerActiveBackground: commonColors.indigoSoft,

    avatarBorder: commonColors.grayLight,

    planBadgeFreeBackground: '#F3F4F6',
    planBadgeFreeText: commonColors.grayDark,
    planBadgePremiumBackground: commonColors.navyDark,
    planBadgePremiumText: commonColors.gold,
    planBadgePremiumBorder: commonColors.gold,

    dangerCardBackground: '#FEF2F2',
    dangerCardBorder: '#FECACA',
    dangerTitle: '#991B1B',
    danger: commonColors.errorRed,
    dangerButtonBackground: '#DC2626',

    divider: commonColors.grayLight,

    modalBackground: commonColors.white,
    modalBackdrop: 'rgba(0,0,0,0.55)',

    primary: commonColors.navyDark,
    primarySoft: '#EEF2FF',
    primaryText: commonColors.white,

    buttonSecondaryBackground: commonColors.white,
    buttonSecondaryBorder: '#D1D5DB',
    buttonSecondaryText: commonColors.grayDark,

    gemBadgeBackground: '#EDE9F7',
    gemBadgeText: '#5B21B6',
    gemBadgeBorder: '#C4B5FD',

    iconSecondary: commonColors.gray,
    white: commonColors.white,

    toastBackground: commonColors.successGreen,
    toastText: commonColors.white,
  },
};

export const profileDarkTheme: ProfileTheme = {
  ...darkTheme,
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

    inputBackground: '#2C2C2C',
    inputBorder: '#3C3C3C',
    inputText: commonColors.white,
    inputBorderFocused: commonColors.navyLight,

    fieldLabel: 'rgba(255,255,255,0.55)',
    fieldReadonlyBackground: '#252525',
    fieldReadonlyText: 'rgba(255,255,255,0.35)',

    pickerActiveBackground: 'rgba(79,70,229,0.20)',

    avatarBorder: commonColors.darkBorder,

    planBadgeFreeBackground: '#2C2C2C',
    planBadgeFreeText: 'rgba(255,255,255,0.60)',
    planBadgePremiumBackground: commonColors.navyDark,
    planBadgePremiumText: commonColors.gold,
    planBadgePremiumBorder: commonColors.gold,

    dangerCardBackground: 'rgba(220,38,38,0.12)',
    dangerCardBorder: 'rgba(220,38,38,0.30)',
    dangerTitle: '#FCA5A5',
    danger: '#EF4444',
    dangerButtonBackground: '#EF4444',

    divider: commonColors.darkBorder,

    modalBackground: commonColors.darkCard,
    modalBackdrop: 'rgba(0,0,0,0.70)',

    primary: commonColors.white,
    primarySoft: 'rgba(79,70,229,0.20)',
    primaryText: commonColors.navyDark,

    buttonSecondaryBackground: '#2C2C2C',
    buttonSecondaryBorder: '#3C3C3C',
    buttonSecondaryText: 'rgba(255,255,255,0.80)',

    gemBadgeBackground: '#2D1B69',
    gemBadgeText: '#C4B5FD',
    gemBadgeBorder: '#4C1D95',

    iconSecondary: 'rgba(255,255,255,0.40)',
    white: commonColors.white,

    toastBackground: commonColors.successGreen,
    toastText: commonColors.white,
  },
};
