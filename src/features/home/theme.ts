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

    // Inicio — nudge banners (avatar setup / first item)
    nudgeBackground: string;
    nudgeBorder: string;
    nudgeIcon: string;
    nudgeTitle: string;
    nudgeText: string;
    nudgeBrand: string;

    // Inicio — "first steps" checklist
    checklistBackground: string;
    checklistBorder: string;
    checklistTitle: string;
    checklistSubtitle: string;
    checklistChevron: string;
    rewardBadgeBackground: string;
    rewardBadgeText: string;
    rewardBoxBorder: string;
    progressTrack: string;
    progressFill: string;
    progressText: string;
    taskBackground: string;
    taskBorder: string;
    taskText: string;
    taskIconBackground: string;
    taskIcon: string;
    taskArrow: string;
    taskDoneBackground: string;
    taskDoneBorder: string;
    taskDoneIconBackground: string;
    taskDoneIcon: string;
    taskDoneText: string;
    claimButton: string;
    claimButtonText: string;

    // Drawer "not visited yet" dot
    unvisitedDot: string;
    unvisitedDotRing: string;
  };
}

// ─── Light-structural variant — used by natural/moderno/elegancia ─────────────
// (every palette except `boutique`, the only one flagged `dark` in the reference)

function buildHomeLight(palette: BrandPalette): HomeTheme {
  const accent600 = palette.accent[600];
  const accent500 = palette.accent[500];
  const accent400 = palette.accent[400];
  const accent100 = palette.accent[100];
  // The reference's bare `accent` var (`bg-accent`, `border-accent`, …).
  const accentDefaultL = palette.accentDefault;

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

      nudgeBackground: withAlpha(accentDefaultL, 0.1),
      nudgeBorder: accentDefaultL,
      nudgeIcon: accentDefaultL,
      nudgeTitle: '#1F2937',
      nudgeText: '#4B5563',
      nudgeBrand: palette.primary,

      checklistBackground: commonColors.white,
      checklistBorder: '#F3F4F6',
      checklistTitle: palette.primary,
      checklistSubtitle: commonColors.grayDark,
      checklistChevron: commonColors.gray,
      rewardBadgeBackground: '#FAF5FF',
      rewardBadgeText: '#7E22CE',
      rewardBoxBorder: '#F3E8FF',
      progressTrack: '#F3F4F6',
      progressFill: accentDefaultL,
      progressText: commonColors.grayDark,
      taskBackground: commonColors.offWhite,
      taskBorder: '#F3F4F6',
      taskText: '#374151',
      taskIconBackground: commonColors.white,
      taskIcon: accentDefaultL,
      taskArrow: '#D1D5DB',
      taskDoneBackground: '#F0FDF4',
      taskDoneBorder: '#BBF7D0',
      taskDoneIconBackground: '#22C55E',
      taskDoneIcon: commonColors.white,
      taskDoneText: commonColors.gray,
      claimButton: accentDefaultL,
      claimButtonText: commonColors.white,

      unvisitedDot: accent600,
      unvisitedDotRing: commonColors.white,
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

      nudgeBackground: withAlpha(accentDefault, 0.2),
      nudgeBorder: accentDefault,
      nudgeIcon: accentDefault,
      nudgeTitle: commonColors.grayLight,
      nudgeText: '#D1D5DB',
      nudgeBrand: accentDefault,

      checklistBackground: commonColors.darkSurface,
      checklistBorder: commonColors.darkCard,
      checklistTitle: commonColors.white,
      checklistSubtitle: commonColors.gray,
      checklistChevron: commonColors.gray,
      rewardBadgeBackground: 'rgba(59,7,100,0.3)',
      rewardBadgeText: '#D8B4FE',
      rewardBoxBorder: 'rgba(88,28,135,0.4)',
      progressTrack: commonColors.darkCard,
      progressFill: accentDefault,
      progressText: commonColors.gray,
      taskBackground: 'rgba(31,41,55,0.5)',
      taskBorder: commonColors.darkCard,
      taskText: commonColors.grayLight,
      taskIconBackground: commonColors.darkSurface,
      taskIcon: accentDefault,
      taskArrow: '#4B5563',
      taskDoneBackground: 'rgba(5,46,22,0.2)',
      taskDoneBorder: 'rgba(20,83,45,0.4)',
      taskDoneIconBackground: '#22C55E',
      taskDoneIcon: commonColors.white,
      taskDoneText: commonColors.grayDark,
      claimButton: accentDefault,
      claimButtonText: commonColors.white,

      unvisitedDot: accentDefault,
      unvisitedDotRing: commonColors.darkCard,
    },
  };
}

export function getHomeTheme(palette: BrandPalette): HomeTheme {
  return palette.dark ? buildHomeDark(palette) : buildHomeLight(palette);
}
