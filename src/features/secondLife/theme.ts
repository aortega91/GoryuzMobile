import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface SecondLifeTheme extends Theme {
  secondLife: {
    background: string;
    headerTitle: string;
    headerSubtitle: string;

    tabBackground: string;
    tabBorder: string;
    tabActiveBackground: string;
    tabActiveBorder: string;
    tabActiveText: string;
    tabInactiveText: string;

    filterPillBackground: string;
    filterPillBorder: string;
    filterPillText: string;
    filterPillActiveBackground: string;
    filterPillActiveBorder: string;
    filterPillActiveText: string;

    cardBackground: string;
    cardBorder: string;
    cardName: string;
    cardMeta: string;

    badgeSaleBackground: string;
    badgeSaleText: string;
    badgeGiftBackground: string;
    badgeGiftText: string;
    badgeTradeBackground: string;
    badgeTradeText: string;
    badgeCompletedBackground: string;
    badgeCompletedText: string;

    ownerName: string;
    ownerAvatar: string;

    emptyIcon: string;
    emptyText: string;
    emptySubtitle: string;

    statCardBackground: string;
    statCardBorder: string;
    statCardValue: string;
    statCardLabel: string;

    historyBackground: string;
    historyBorder: string;
    historyText: string;
    historyMeta: string;

    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;

    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDanger: string;
    buttonDangerText: string;

    heartActive: string;
    heartInactive: string;

    impactEnvBackground: string;
    impactEnvText: string;

    // Month/year filter on the impact history (pill + option sheet).
    monthOptionText: string;
    monthOptionActiveBackground: string;
    monthOptionCheck: string;
  };
}

// ─── Light-structural variant — used by natural/moderno/elegancia ─────────────

function buildSecondLifeLight(palette: BrandPalette): SecondLifeTheme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    secondLife: {
      background: commonColors.offWhite,
      headerTitle: palette.primary,
      headerSubtitle: commonColors.grayDark,

      tabBackground: commonColors.white,
      tabBorder: commonColors.grayLight,
      tabActiveBackground: accent600,
      tabActiveBorder: accent600,
      tabActiveText: commonColors.white,
      tabInactiveText: commonColors.grayDark,

      filterPillBackground: commonColors.white,
      filterPillBorder: commonColors.grayLight,
      filterPillText: commonColors.grayDark,
      filterPillActiveBackground: accent600,
      filterPillActiveBorder: accent600,
      filterPillActiveText: commonColors.white,

      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,
      cardName: palette.primary,
      cardMeta: commonColors.grayDark,

      badgeSaleBackground: '#FEF9C3',
      badgeSaleText: '#A16207',
      badgeGiftBackground: '#DCFCE7',
      badgeGiftText: '#166534',
      // Flat pale badge fill (not an overlay), mirrors the reference's soft chip style.
      badgeTradeBackground: accent100,
      badgeTradeText: '#4338CA',
      badgeCompletedBackground: commonColors.grayLight,
      badgeCompletedText: commonColors.gray,

      ownerName: palette.primary,
      ownerAvatar: commonColors.grayLight,

      emptyIcon: commonColors.grayLight,
      emptyText: palette.primary,
      emptySubtitle: commonColors.gray,

      statCardBackground: commonColors.white,
      statCardBorder: commonColors.grayLight,
      statCardValue: palette.primary,
      statCardLabel: commonColors.grayDark,

      historyBackground: commonColors.white,
      historyBorder: commonColors.grayLight,
      historyText: palette.primary,
      historyMeta: commonColors.gray,

      modalBackground: commonColors.white,
      modalBackdrop: commonColors.overlayDark,
      modalTitle: palette.primary,
      modalSubtitle: commonColors.grayDark,
      modalBorder: commonColors.grayLight,

      buttonPrimary: accent600,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.offWhite,
      buttonSecondaryText: palette.primary,
      buttonSecondaryBorder: commonColors.grayLight,
      buttonDanger: '#FEF2F2',
      buttonDangerText: commonColors.errorRed,

      heartActive: '#E05A5E',
      heartInactive: commonColors.gray,

      impactEnvBackground: '#F0FDF4',
      impactEnvText: '#166534',

      monthOptionText: commonColors.grayDark,
      monthOptionActiveBackground: withAlpha(accent600, 0.08),
      monthOptionCheck: accent600,
    },
  };
}

// ─── Dark-structural variant — used only by `boutique` ────────────────────────

function buildSecondLifeDark(palette: BrandPalette): SecondLifeTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    secondLife: {
      background: commonColors.darkSurface,
      headerTitle: commonColors.offWhite,
      headerSubtitle: commonColors.gray,

      tabBackground: commonColors.darkCard,
      tabBorder: commonColors.darkBorder,
      // `tabActiveBackground` is (confusingly) consumed as the active tab's
      // text/icon tint, not a fill — matches the reference's
      // `dark:text-accent` on active tabs, not a fixed white surface.
      tabActiveBackground: accentDefault,
      tabActiveBorder: accentDefault,
      tabActiveText: commonColors.white,
      tabInactiveText: commonColors.gray,

      filterPillBackground: commonColors.darkCard,
      filterPillBorder: commonColors.darkBorder,
      filterPillText: commonColors.gray,
      filterPillActiveBackground: accentDefault,
      filterPillActiveBorder: accentDefault,
      filterPillActiveText: commonColors.white,

      cardBackground: commonColors.darkCard,
      cardBorder: commonColors.darkBorder,
      cardName: commonColors.offWhite,
      cardMeta: commonColors.gray,

      badgeSaleBackground: 'rgba(161,98,7,0.2)',
      badgeSaleText: '#FDE68A',
      badgeGiftBackground: 'rgba(22,101,52,0.2)',
      badgeGiftText: '#86EFAC',
      badgeTradeBackground: withAlpha(accentDefault, 0.2),
      badgeTradeText: accent400,
      badgeCompletedBackground: commonColors.darkBorder,
      badgeCompletedText: commonColors.gray,

      ownerName: commonColors.offWhite,
      ownerAvatar: commonColors.darkBorder,

      emptyIcon: commonColors.darkBorder,
      emptyText: commonColors.offWhite,
      emptySubtitle: commonColors.gray,

      statCardBackground: commonColors.darkCard,
      statCardBorder: commonColors.darkBorder,
      statCardValue: commonColors.offWhite,
      statCardLabel: commonColors.gray,

      historyBackground: commonColors.darkCard,
      historyBorder: commonColors.darkBorder,
      historyText: commonColors.offWhite,
      historyMeta: commonColors.gray,

      modalBackground: commonColors.darkCard,
      modalBackdrop: 'rgba(0,0,0,0.80)',
      modalTitle: commonColors.offWhite,
      modalSubtitle: commonColors.gray,
      modalBorder: commonColors.darkBorder,

      buttonPrimary: accent400,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.darkCard,
      buttonSecondaryText: commonColors.offWhite,
      buttonSecondaryBorder: commonColors.darkBorder,
      buttonDanger: 'rgba(208,66,70,0.15)',
      buttonDangerText: '#E05A5E',

      heartActive: '#E05A5E',
      heartInactive: 'rgba(255,255,255,0.3)',

      impactEnvBackground: 'rgba(22,101,52,0.15)',
      impactEnvText: '#86EFAC',

      monthOptionText: commonColors.offWhite,
      monthOptionActiveBackground: withAlpha(accentDefault, 0.15),
      monthOptionCheck: accentDefault,
    },
  };
}

export function getSecondLifeTheme(palette: BrandPalette): SecondLifeTheme {
  return palette.dark ? buildSecondLifeDark(palette) : buildSecondLifeLight(palette);
}
