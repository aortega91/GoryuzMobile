import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

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

    // Location pill
    locationPillBg: string;
    locationPillBorder: string;
    locationPinColor: string;

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

    // Bottom tab bar
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarIcon: string;
    tabBarText: string;
    tabBarActiveIcon: string;
    tabBarActiveText: string;

    // FAB (create post button)
    fabBackground: string;
    fabIcon: string;

    // My Vision grid & publish sheet
    gridItemBorder: string;
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    primaryButton: string;
    primaryButtonText: string;

    // Collection color filter chips
    chipBackground: string;
    chipBorder: string;
    chipText: string;
    chipActiveBackground: string;
    chipActiveBorder: string;
    chipActiveText: string;

    // Drawer (always the active palette's `primary`, regardless of light/dark structure)
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

// ─── Light-structural variant — used by natural/moderno/elegancia ─────────────
// (every palette except `boutique`, the only one flagged `dark` in the reference)

function buildHomeLight(palette: BrandPalette): HomeTheme {
  const accent600 = palette.accent[600];
  const accent500 = palette.accent[500];
  const accent400 = palette.accent[400];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    home: {
      background: commonColors.offWhite,
      headlineText: palette.primary,
      subtitleText: 'rgba(15,30,53,0.55)',

      topBarBackground: commonColors.white,
      topBarBorder: commonColors.grayLight,
      topBarText: palette.primary,
      topBarIcon: commonColors.grayDark,

      locationPillBg: commonColors.offWhite,
      locationPillBorder: '#F3F4F6',
      locationPinColor: accent500,

      // Gem/coin badge is a fixed purple in the reference — not theme-tied.
      gemBadgeBg: '#EDE9F7',
      gemBadgeText: '#5B21B6',
      gemBadgeBorder: '#C4B5FD',

      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,
      cardTitle: palette.primary,
      cardDescription: commonColors.gray,
      cardIcon: accent600,
      cardArrow: commonColors.gray,

      ctaCardBackground: accent100,
      ctaCardBorder: accent400,
      ctaCardIcon: accent500,

      tabBarBackground: commonColors.white,
      tabBarBorder: commonColors.grayLight,
      tabBarIcon: commonColors.gray,
      tabBarText: commonColors.gray,
      tabBarActiveIcon: accent600,
      tabBarActiveText: accent600,

      fabBackground: accent600,
      fabIcon: commonColors.white,

      gridItemBorder: commonColors.grayLight,
      inputBackground: commonColors.slateBackground,
      inputBorder: commonColors.grayLight,
      inputText: palette.primary,
      inputPlaceholder: commonColors.gray,
      primaryButton: accent600,
      primaryButtonText: commonColors.white,
      chipBackground: commonColors.white,
      chipBorder: commonColors.grayLight,
      chipText: commonColors.grayDark,
      chipActiveBackground: accent600,
      chipActiveBorder: accent600,
      chipActiveText: commonColors.white,

      // Sidebar aside is always `bg-primary` in the reference, its active nav
      // item always `bg-[#1F2937]` (fixed slate) with white text/icon — only
      // the `dark` class (boutique only) swaps that text/icon to the accent.
      drawerBackground: palette.primary,
      drawerBorder: 'transparent',
      drawerText: commonColors.gray,
      drawerSubtitle: palette.accentDefault,
      drawerActiveBackground: commonColors.darkCard,
      drawerActiveText: commonColors.white,
      drawerIcon: commonColors.gray,
      drawerActiveIcon: commonColors.white,
      drawerCloseIcon: commonColors.gray,
      drawerBackdrop: withAlpha(palette.primary, 0.4),
    },
  };
}

// ─── Dark-structural variant — used only by `boutique` ────────────────────────

function buildHomeDark(palette: BrandPalette): HomeTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    home: {
      background: commonColors.darkSurface,
      headlineText: commonColors.white,
      subtitleText: 'rgba(255,255,255,0.55)',

      topBarBackground: commonColors.darkCard,
      topBarBorder: commonColors.darkBorder,
      topBarText: commonColors.white,
      topBarIcon: 'rgba(255,255,255,0.60)',

      locationPillBg: commonColors.darkCard,
      locationPillBorder: commonColors.darkBorder,
      locationPinColor: accent400,

      gemBadgeBg: '#2D1B69',
      gemBadgeText: '#C4B5FD',
      gemBadgeBorder: '#4C1D95',

      cardBackground: commonColors.darkCard,
      cardBorder: commonColors.darkBorder,
      cardTitle: commonColors.white,
      cardDescription: 'rgba(255,255,255,0.55)',
      cardIcon: accent400,
      cardArrow: 'rgba(255,255,255,0.35)',

      ctaCardBackground: withAlpha(accentDefault, 0.15),
      ctaCardBorder: accent400,
      ctaCardIcon: accent400,

      tabBarBackground: commonColors.darkCard,
      tabBarBorder: commonColors.darkBorder,
      tabBarIcon: 'rgba(255,255,255,0.40)',
      tabBarText: 'rgba(255,255,255,0.40)',
      tabBarActiveIcon: accentDefault,
      tabBarActiveText: accentDefault,

      fabBackground: accentDefault,
      fabIcon: commonColors.white,

      gridItemBorder: commonColors.darkBorder,
      inputBackground: commonColors.darkSurface,
      inputBorder: commonColors.darkBorder,
      inputText: commonColors.offWhite,
      inputPlaceholder: commonColors.grayDark,
      primaryButton: accentDefault,
      primaryButtonText: commonColors.white,
      chipBackground: commonColors.darkCard,
      chipBorder: commonColors.darkBorder,
      chipText: commonColors.gray,
      chipActiveBackground: accentDefault,
      chipActiveBorder: accentDefault,
      chipActiveText: commonColors.white,

      drawerBackground: palette.primary,
      drawerBorder: 'transparent',
      drawerText: commonColors.gray,
      drawerSubtitle: accentDefault,
      drawerActiveBackground: commonColors.darkCard,
      // `dark:text-accent` wins over the plain `text-white` once the `dark`
      // class is active — only true for boutique.
      drawerActiveText: accentDefault,
      drawerIcon: commonColors.gray,
      drawerActiveIcon: accentDefault,
      drawerCloseIcon: commonColors.gray,
      drawerBackdrop: 'rgba(0,0,0,0.60)',
    },
  };
}

export function getHomeTheme(palette: BrandPalette): HomeTheme {
  return palette.dark ? buildHomeDark(palette) : buildHomeLight(palette);
}
