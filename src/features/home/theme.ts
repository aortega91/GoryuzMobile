import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

// ─── Home module theme tokens ─────────────────────────────────────────────────

export interface HomeTheme extends Theme {
  home: {
    // Screen
    background: string;
    headlineText: string;
    subtitleText: string;

    // Top bar
    topBarBackground: string;
    topBarBorder: string;
    topBarText: string;
    topBarIcon: string;

    // Gem badge
    gemBadgeBg: string;
    gemBadgeText: string;
    gemBadgeBorder: string;

    // Action cards
    cardBackground: string;
    cardBorder: string;
    cardTitle: string;
    cardDescription: string;
    cardIcon: string;
    cardArrow: string;

    // CTA card (shown when closet is empty)
    ctaCardBackground: string;
    ctaCardBorder: string;
    ctaCardIcon: string;

    // Drawer (always dark-navy regardless of device theme)
    drawerBackground: string;
    drawerBorder: string;
    drawerText: string;
    drawerSubtitle: string;
    drawerActiveBackground: string;
    drawerActiveText: string;
    drawerIcon: string;
    drawerActiveIcon: string;
    drawerCloseIcon: string;
    drawerBackdrop: string;
  };
}

// ─── Light variant ────────────────────────────────────────────────────────────

export const homeLightTheme: HomeTheme = {
  ...lightTheme,
  home: {
    background: commonColors.offWhite,
    headlineText: commonColors.navyDark,
    subtitleText: 'rgba(15,30,53,0.55)',

    topBarBackground: commonColors.white,
    topBarBorder: commonColors.grayLight,
    topBarText: commonColors.navyDark,
    topBarIcon: commonColors.grayDark,

    gemBadgeBg: '#EDE9F7',
    gemBadgeText: '#5B21B6',
    gemBadgeBorder: '#C4B5FD',

    cardBackground: commonColors.white,
    cardBorder: commonColors.grayLight,
    cardTitle: commonColors.navyDark,
    cardDescription: commonColors.gray,
    cardIcon: commonColors.navyMid,
    cardArrow: commonColors.gray,

    ctaCardBackground: '#EEF2FF',
    ctaCardBorder: '#6366F1',
    ctaCardIcon: '#6366F1',

    // Drawer is always dark
    drawerBackground: commonColors.navyDark,
    drawerBorder: 'rgba(255,255,255,0.08)',
    drawerText: 'rgba(255,255,255,0.80)',
    drawerSubtitle: commonColors.gold,
    drawerActiveBackground: commonColors.navyMid,
    drawerActiveText: commonColors.white,
    drawerIcon: 'rgba(255,255,255,0.55)',
    drawerActiveIcon: commonColors.goldLight,
    drawerCloseIcon: 'rgba(255,255,255,0.55)',
    drawerBackdrop: 'rgba(0,0,0,0.45)',
  },
};

// ─── Dark variant ─────────────────────────────────────────────────────────────

export const homeDarkTheme: HomeTheme = {
  ...darkTheme,
  home: {
    background: commonColors.darkSurface,
    headlineText: commonColors.white,
    subtitleText: 'rgba(255,255,255,0.55)',

    topBarBackground: commonColors.darkCard,
    topBarBorder: commonColors.darkBorder,
    topBarText: commonColors.white,
    topBarIcon: 'rgba(255,255,255,0.60)',

    gemBadgeBg: '#2D1B69',
    gemBadgeText: '#C4B5FD',
    gemBadgeBorder: '#4C1D95',

    cardBackground: commonColors.darkCard,
    cardBorder: commonColors.darkBorder,
    cardTitle: commonColors.white,
    cardDescription: 'rgba(255,255,255,0.55)',
    cardIcon: commonColors.goldLight,
    cardArrow: 'rgba(255,255,255,0.35)',

    ctaCardBackground: 'rgba(99,102,241,0.15)',
    ctaCardBorder: '#6366F1',
    ctaCardIcon: '#818CF8',

    // Drawer stays the same in both themes
    drawerBackground: commonColors.navyDark,
    drawerBorder: 'rgba(255,255,255,0.08)',
    drawerText: 'rgba(255,255,255,0.80)',
    drawerSubtitle: commonColors.gold,
    drawerActiveBackground: commonColors.navyMid,
    drawerActiveText: commonColors.white,
    drawerIcon: 'rgba(255,255,255,0.55)',
    drawerActiveIcon: commonColors.goldLight,
    drawerCloseIcon: 'rgba(255,255,255,0.55)',
    drawerBackdrop: 'rgba(0,0,0,0.60)',
  },
};
