import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

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
    secondLifeActiveBorder: string;
    secondLifeActiveIcon: string;
  };
}

export const collectionLightTheme: CollectionTheme = {
  ...lightTheme,
  collection: {
    background: commonColors.offWhite,
    headerBackground: commonColors.white,
    headerBorder: commonColors.grayLight,
    headerTitle: commonColors.navyDark,

    searchBackground: '#F3F4F6',
    searchBorder: 'transparent',
    searchText: commonColors.navyDark,
    searchPlaceholder: commonColors.gray,
    searchIcon: commonColors.gray,

    tabBackground: commonColors.white,
    tabBorder: commonColors.grayLight,
    tabText: commonColors.grayDark,
    tabActiveBackground: commonColors.navyDark,
    tabActiveBorder: commonColors.navyDark,
    tabActiveText: commonColors.white,

    cardBackground: commonColors.white,
    cardBorder: commonColors.grayLight,
    cardName: commonColors.navyDark,
    cardActionIcon: commonColors.grayDark,

    emptyIcon: commonColors.gray,
    emptyTitle: commonColors.navyDark,
    emptySubtitle: commonColors.gray,

    fabBackground: commonColors.navyDark,
    fabIcon: commonColors.white,

    modalBackground: commonColors.white,
    modalBackdrop: 'rgba(0,0,0,0.55)',
    modalTitle: commonColors.navyDark,
    modalSubtitle: commonColors.grayDark,
    modalBorder: commonColors.grayLight,

    inputBackground: commonColors.white,
    inputBorder: '#D1D5DB',
    inputText: commonColors.navyDark,
    inputLabel: commonColors.grayDark,

    buttonPrimary: commonColors.navyDark,
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
    secondLifeOptionText: commonColors.navyDark,
    secondLifeOptionSubtext: commonColors.gray,
    secondLifeActiveBackground: '#F0FDF4',
    secondLifeActiveBorder: '#059669',
    secondLifeActiveIcon: '#059669',
  },
};

export const collectionDarkTheme: CollectionTheme = {
  ...darkTheme,
  collection: {
    background: commonColors.darkSurface,
    headerBackground: commonColors.darkCard,
    headerBorder: commonColors.darkBorder,
    headerTitle: commonColors.white,

    searchBackground: '#2C2C2C',
    searchBorder: 'transparent',
    searchText: commonColors.white,
    searchPlaceholder: 'rgba(255,255,255,0.40)',
    searchIcon: 'rgba(255,255,255,0.40)',

    tabBackground: commonColors.darkCard,
    tabBorder: commonColors.darkBorder,
    tabText: 'rgba(255,255,255,0.55)',
    tabActiveBackground: commonColors.white,
    tabActiveBorder: commonColors.white,
    tabActiveText: commonColors.navyDark,

    cardBackground: commonColors.darkCard,
    cardBorder: commonColors.darkBorder,
    cardName: commonColors.white,
    cardActionIcon: 'rgba(255,255,255,0.60)',

    emptyIcon: 'rgba(255,255,255,0.30)',
    emptyTitle: commonColors.white,
    emptySubtitle: 'rgba(255,255,255,0.50)',

    fabBackground: commonColors.white,
    fabIcon: commonColors.navyDark,

    modalBackground: commonColors.darkCard,
    modalBackdrop: 'rgba(0,0,0,0.70)',
    modalTitle: commonColors.white,
    modalSubtitle: 'rgba(255,255,255,0.60)',
    modalBorder: commonColors.darkBorder,

    inputBackground: '#2C2C2C',
    inputBorder: '#3C3C3C',
    inputText: commonColors.white,
    inputLabel: 'rgba(255,255,255,0.60)',

    buttonPrimary: commonColors.white,
    buttonPrimaryText: commonColors.navyDark,
    buttonSecondary: '#2C2C2C',
    buttonSecondaryText: 'rgba(255,255,255,0.80)',
    buttonSecondaryBorder: '#3C3C3C',
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
    secondLifeOptionBackground: '#2C2C2C',
    secondLifeOptionBorder: '#3C3C3C',
    secondLifeOptionText: commonColors.white,
    secondLifeOptionSubtext: 'rgba(255,255,255,0.50)',
    secondLifeActiveBackground: 'rgba(16,185,129,0.15)',
    secondLifeActiveBorder: '#34D399',
    secondLifeActiveIcon: '#34D399',
  },
};
