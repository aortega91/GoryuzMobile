import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface CollectionTheme extends Theme {
  collection: {
    background: string;
    headerBackground: string;
    headerBorder: string;
    headerTitle: string;

    searchBackground: string;
    searchBorder: string;
    searchText: string;
    searchPlaceholder: string;
    searchIcon: string;

    tabBackground: string;
    tabBorder: string;
    tabText: string;
    tabActiveBackground: string;
    tabActiveBorder: string;
    tabActiveText: string;
    tabIndicator: string;
    tabBadgeBackground: string;
    tabBadgeText: string;
    tabBadgeActiveBackground: string;
    tabBadgeActiveText: string;

    cardBackground: string;
    cardBorder: string;
    cardName: string;
    cardActionIcon: string;

    emptyIcon: string;
    emptyTitle: string;
    emptySubtitle: string;

    fabBackground: string;
    fabIcon: string;

    // Modals & sheets
    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;

    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputLabel: string;

    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDanger: string;
    buttonDangerText: string;

    gemBadgeBackground: string;
    gemBadgeText: string;
    gemBadgeBorder: string;

    noticeBackground: string;
    noticeText: string;
    noticeBorder: string;

    secondLifeSell: string;
    secondLifeGift: string;
    secondLifeExchange: string;
    secondLifeOptionBackground: string;
    secondLifeOptionBorder: string;
    secondLifeOptionText: string;
    secondLifeOptionSubtext: string;
    secondLifeActiveBackground: string;

    // "Add from camera" icon in the add-item sheet — theme-tied in the
    // reference, unlike its "from gallery" sibling which stays fixed purple.
    cameraPickIcon: string;
    secondLifeActiveBorder: string;
    secondLifeActiveIcon: string;

    itemSelectedAccent: string;

    // "Create outfit" shortcut to Styles (header, top-right) — outlined
    // accent pill like zena's ClosetView.
    stylesShortcutBackground: string;
    stylesShortcutBorder: string;
    stylesShortcutIcon: string;
  };
}

function buildCollectionLight(palette: BrandPalette): CollectionTheme {
  const accent600 = palette.accent[600];
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    collection: {
      background: commonColors.offWhite,
      headerBackground: commonColors.white,
      headerBorder: commonColors.grayLight,
      headerTitle: palette.primary,

      searchBackground: '#F3F4F6',
      searchBorder: 'transparent',
      searchText: palette.primary,
      searchPlaceholder: commonColors.gray,
      searchIcon: commonColors.gray,

      tabBackground: commonColors.white,
      tabBorder: commonColors.grayLight,
      tabText: commonColors.grayDark,
      tabActiveBackground: accent600,
      tabActiveBorder: accent600,
      tabActiveText: palette.primary,
      tabIndicator: accent600,
      tabBadgeBackground: '#F3F4F6',
      tabBadgeText: commonColors.grayDark,
      tabBadgeActiveBackground: '#E8EAF0',
      tabBadgeActiveText: palette.primary,

      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,
      cardName: palette.primary,
      cardActionIcon: commonColors.grayDark,

      emptyIcon: commonColors.gray,
      emptyTitle: palette.primary,
      emptySubtitle: commonColors.gray,

      fabBackground: accent600,
      fabIcon: commonColors.white,

      modalBackground: commonColors.white,
      modalBackdrop: 'rgba(0,0,0,0.55)',
      modalTitle: palette.primary,
      modalSubtitle: commonColors.grayDark,
      modalBorder: commonColors.grayLight,

      inputBackground: commonColors.white,
      inputBorder: '#D1D5DB',
      inputText: palette.primary,
      inputLabel: commonColors.grayDark,

      buttonPrimary: accent600,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.white,
      buttonSecondaryText: commonColors.grayDark,
      buttonSecondaryBorder: '#D1D5DB',
      buttonDanger: '#DC2626',
      buttonDangerText: commonColors.white,

      gemBadgeBackground: '#EDE9F7',
      gemBadgeText: '#5B21B6',
      gemBadgeBorder: '#C4B5FD',

      noticeBackground: '#EFF6FF',
      noticeText: '#1D4ED8',
      noticeBorder: '#BFDBFE',

      secondLifeSell: '#059669',
      secondLifeGift: '#7C3AED',
      secondLifeExchange: '#D97706',
      secondLifeOptionBackground: commonColors.white,
      secondLifeOptionBorder: commonColors.grayLight,
      secondLifeOptionText: palette.primary,
      secondLifeOptionSubtext: commonColors.gray,
      secondLifeActiveBackground: '#F0FDF4',
      cameraPickIcon: accent600,
      secondLifeActiveBorder: '#059669',
      secondLifeActiveIcon: '#059669',

      itemSelectedAccent: accent400,

      stylesShortcutBackground: commonColors.white,
      stylesShortcutBorder: palette.accent[200],
      stylesShortcutIcon: palette.accent[700],
    },
  };
}

function buildCollectionDark(palette: BrandPalette): CollectionTheme {
  const accent400 = palette.accent[400];
  const { accentDefault } = palette;

  return {
    ...getCommonTheme(palette),
    collection: {
      background: commonColors.darkSurface,
      headerBackground: commonColors.darkCard,
      headerBorder: commonColors.darkBorder,
      headerTitle: commonColors.white,

      searchBackground: commonColors.darkCard,
      searchBorder: 'transparent',
      searchText: commonColors.white,
      searchPlaceholder: 'rgba(255,255,255,0.40)',
      searchIcon: 'rgba(255,255,255,0.40)',

      tabBackground: commonColors.darkCard,
      tabBorder: commonColors.darkBorder,
      tabText: 'rgba(255,255,255,0.55)',
      tabActiveBackground: commonColors.white,
      tabActiveBorder: commonColors.white,
      tabActiveText: accentDefault,
      tabIndicator: accentDefault,
      tabBadgeBackground: commonColors.darkCard,
      tabBadgeText: 'rgba(255,255,255,0.40)',
      tabBadgeActiveBackground: withAlpha(accentDefault, 0.4),
      tabBadgeActiveText: palette.accent[300],

      cardBackground: commonColors.darkCard,
      cardBorder: commonColors.darkBorder,
      cardName: commonColors.white,
      cardActionIcon: 'rgba(255,255,255,0.60)',

      emptyIcon: 'rgba(255,255,255,0.30)',
      emptyTitle: commonColors.white,
      emptySubtitle: 'rgba(255,255,255,0.50)',

      fabBackground: accentDefault,
      fabIcon: commonColors.white,

      modalBackground: commonColors.darkCard,
      modalBackdrop: 'rgba(0,0,0,0.70)',
      modalTitle: commonColors.white,
      modalSubtitle: 'rgba(255,255,255,0.60)',
      modalBorder: commonColors.darkBorder,

      inputBackground: commonColors.darkCard,
      inputBorder: commonColors.darkBorder,
      inputText: commonColors.white,
      inputLabel: 'rgba(255,255,255,0.60)',

      buttonPrimary: accentDefault,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.darkCard,
      buttonSecondaryText: 'rgba(255,255,255,0.80)',
      buttonSecondaryBorder: commonColors.darkBorder,
      buttonDanger: '#EF4444',
      buttonDangerText: commonColors.white,

      gemBadgeBackground: '#2D1B69',
      gemBadgeText: '#C4B5FD',
      gemBadgeBorder: '#4C1D95',

      noticeBackground: 'rgba(30,64,175,0.25)',
      noticeText: '#93C5FD',
      noticeBorder: 'rgba(59,130,246,0.30)',

      secondLifeSell: '#34D399',
      secondLifeGift: '#A78BFA',
      secondLifeExchange: '#FCD34D',
      secondLifeOptionBackground: commonColors.darkCard,
      secondLifeOptionBorder: commonColors.darkBorder,
      secondLifeOptionText: commonColors.white,
      secondLifeOptionSubtext: 'rgba(255,255,255,0.50)',
      secondLifeActiveBackground: 'rgba(16,185,129,0.15)',
      secondLifeActiveBorder: '#34D399',
      cameraPickIcon: accent400,
      secondLifeActiveIcon: '#34D399',

      itemSelectedAccent: accent400,

      stylesShortcutBackground: commonColors.darkCard,
      stylesShortcutBorder: palette.accent[800],
      stylesShortcutIcon: accentDefault,
    },
  };
}

export function getCollectionTheme(palette: BrandPalette): CollectionTheme {
  return palette.dark ? buildCollectionDark(palette) : buildCollectionLight(palette);
}
