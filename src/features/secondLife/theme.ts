import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

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
  };
}

const secondLifeLight: SecondLifeTheme['secondLife'] = {
  background: commonColors.offWhite,
  headerTitle: commonColors.navyDark,
  headerSubtitle: commonColors.grayDark,

  tabBackground: commonColors.white,
  tabBorder: commonColors.grayLight,
  tabActiveBackground: commonColors.navyDark,
  tabActiveBorder: commonColors.navyDark,
  tabActiveText: commonColors.white,
  tabInactiveText: commonColors.grayDark,

  filterPillBackground: commonColors.white,
  filterPillBorder: commonColors.grayLight,
  filterPillText: commonColors.grayDark,
  filterPillActiveBackground: commonColors.navyDark,
  filterPillActiveBorder: commonColors.navyDark,
  filterPillActiveText: commonColors.white,

  cardBackground: commonColors.white,
  cardBorder: commonColors.grayLight,
  cardName: commonColors.navyDark,
  cardMeta: commonColors.grayDark,

  badgeSaleBackground: '#FEF9C3',
  badgeSaleText: '#A16207',
  badgeGiftBackground: '#DCFCE7',
  badgeGiftText: '#166534',
  badgeTradeBackground: '#EEF2FF',
  badgeTradeText: '#4338CA',
  badgeCompletedBackground: commonColors.grayLight,
  badgeCompletedText: commonColors.gray,

  ownerName: commonColors.navyDark,
  ownerAvatar: commonColors.grayLight,

  emptyIcon: commonColors.grayLight,
  emptyText: commonColors.navyDark,
  emptySubtitle: commonColors.gray,

  statCardBackground: commonColors.white,
  statCardBorder: commonColors.grayLight,
  statCardValue: commonColors.navyDark,
  statCardLabel: commonColors.grayDark,

  historyBackground: commonColors.white,
  historyBorder: commonColors.grayLight,
  historyText: commonColors.navyDark,
  historyMeta: commonColors.gray,

  modalBackground: commonColors.white,
  modalBackdrop: commonColors.overlayDark,
  modalTitle: commonColors.navyDark,
  modalSubtitle: commonColors.grayDark,
  modalBorder: commonColors.grayLight,

  buttonPrimary: commonColors.navyDark,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: commonColors.offWhite,
  buttonSecondaryText: commonColors.navyDark,
  buttonSecondaryBorder: commonColors.grayLight,
  buttonDanger: '#FEF2F2',
  buttonDangerText: commonColors.errorRed,

  heartActive: '#E05A5E',
  heartInactive: commonColors.gray,

  impactEnvBackground: '#F0FDF4',
  impactEnvText: '#166534',
};

const secondLifeDark: SecondLifeTheme['secondLife'] = {
  background: commonColors.darkSurface,
  headerTitle: commonColors.offWhite,
  headerSubtitle: commonColors.gray,

  tabBackground: commonColors.darkCard,
  tabBorder: commonColors.darkBorder,
  tabActiveBackground: commonColors.white,
  tabActiveBorder: commonColors.white,
  tabActiveText: commonColors.navyDark,
  tabInactiveText: commonColors.gray,

  filterPillBackground: commonColors.darkCard,
  filterPillBorder: commonColors.darkBorder,
  filterPillText: commonColors.gray,
  filterPillActiveBackground: commonColors.white,
  filterPillActiveBorder: commonColors.white,
  filterPillActiveText: commonColors.navyDark,

  cardBackground: commonColors.darkCard,
  cardBorder: commonColors.darkBorder,
  cardName: commonColors.offWhite,
  cardMeta: commonColors.gray,

  badgeSaleBackground: 'rgba(161,98,7,0.2)',
  badgeSaleText: '#FDE68A',
  badgeGiftBackground: 'rgba(22,101,52,0.2)',
  badgeGiftText: '#86EFAC',
  badgeTradeBackground: 'rgba(67,56,202,0.2)',
  badgeTradeText: '#A5B4FC',
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

  buttonPrimary: '#2E4A80',
  buttonPrimaryText: commonColors.white,
  buttonSecondary: '#252525',
  buttonSecondaryText: commonColors.offWhite,
  buttonSecondaryBorder: commonColors.darkBorder,
  buttonDanger: 'rgba(208,66,70,0.15)',
  buttonDangerText: '#E05A5E',

  heartActive: '#E05A5E',
  heartInactive: 'rgba(255,255,255,0.3)',

  impactEnvBackground: 'rgba(22,101,52,0.15)',
  impactEnvText: '#86EFAC',
};

export interface SecondLifeThemeInstance extends SecondLifeTheme {}

export const secondLifeLightTheme: SecondLifeThemeInstance = {
  ...lightTheme,
  secondLife: secondLifeLight,
};

export const secondLifeDarkTheme: SecondLifeThemeInstance = {
  ...darkTheme,
  secondLife: secondLifeDark,
};
