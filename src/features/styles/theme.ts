import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

export interface StylesTheme extends Theme {
  styles: {
    background: string;
    headerTitle: string;
    headerSubtitle: string;

    tabBackground: string;
    tabActive: string;
    tabActiveText: string;
    tabInactiveText: string;
    tabBorder: string;

    outfitCardBackground: string;
    outfitCardBorder: string;
    outfitCardName: string;
    outfitCardMosaicBackground: string;
    outfitCardSourceBadge: string;
    outfitCardSourceText: string;
    outfitCardAIBadge: string;
    outfitCardAIText: string;

    starFilled: string;
    starEmpty: string;

    tagBackground: string;
    tagText: string;
    tagActiveBackground: string;
    tagActiveText: string;

    emptyIcon: string;
    emptyText: string;
    emptySubtitle: string;

    closetCategoryText: string;
    closetItemBackground: string;
    closetItemBorder: string;
    closetItemSelectedBorder: string;
    closetItemSelectedBadge: string;
    closetItemSelectedCheck: string;

    creatorPreviewBackground: string;
    creatorPreviewBorder: string;
    creatorPreviewEmpty: string;
    creatorPreviewEmptyText: string;
    creatorInputBackground: string;
    creatorInputBorder: string;
    creatorInputText: string;
    creatorInputLabel: string;
    creatorInputPlaceholder: string;

    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDanger: string;
    buttonDangerText: string;
    buttonDangerBorder: string;

    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;
    modalLabel: string;
    modalInputBackground: string;
    modalInputBorder: string;
    modalInputText: string;
    modalInputPlaceholder: string;

    actionIcon: string;
    actionText: string;
    actionDivider: string;
    actionDangerText: string;
  };
}

const stylesLight: StylesTheme['styles'] = {
  background: commonColors.offWhite,
  headerTitle: commonColors.navyDark,
  headerSubtitle: commonColors.grayDark,

  tabBackground: commonColors.white,
  tabActive: commonColors.navyDark,
  tabActiveText: commonColors.white,
  tabInactiveText: commonColors.gray,
  tabBorder: commonColors.grayLight,

  outfitCardBackground: commonColors.white,
  outfitCardBorder: commonColors.grayLight,
  outfitCardName: commonColors.navyDark,
  outfitCardMosaicBackground: commonColors.offWhite,
  outfitCardSourceBadge: commonColors.grayLight,
  outfitCardSourceText: commonColors.grayDark,
  outfitCardAIBadge: '#4F46E5',
  outfitCardAIText: commonColors.white,

  starFilled: commonColors.gold,
  starEmpty: commonColors.grayLight,

  tagBackground: commonColors.grayLight,
  tagText: commonColors.grayDark,
  tagActiveBackground: commonColors.navyDark,
  tagActiveText: commonColors.white,

  emptyIcon: commonColors.grayLight,
  emptyText: commonColors.navyDark,
  emptySubtitle: commonColors.gray,

  closetCategoryText: commonColors.navyDark,
  closetItemBackground: commonColors.white,
  closetItemBorder: commonColors.grayLight,
  closetItemSelectedBorder: commonColors.navyDark,
  closetItemSelectedBadge: commonColors.navyDark,
  closetItemSelectedCheck: commonColors.white,

  creatorPreviewBackground: commonColors.white,
  creatorPreviewBorder: commonColors.grayLight,
  creatorPreviewEmpty: commonColors.offWhite,
  creatorPreviewEmptyText: commonColors.gray,
  creatorInputBackground: commonColors.offWhite,
  creatorInputBorder: commonColors.grayLight,
  creatorInputText: commonColors.navyDark,
  creatorInputLabel: commonColors.grayDark,
  creatorInputPlaceholder: commonColors.gray,

  buttonPrimary: commonColors.navyDark,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: commonColors.offWhite,
  buttonSecondaryText: commonColors.navyDark,
  buttonSecondaryBorder: commonColors.grayLight,
  buttonDanger: '#FEF2F2',
  buttonDangerText: commonColors.errorRed,
  buttonDangerBorder: '#FECACA',

  modalBackground: commonColors.white,
  modalBackdrop: commonColors.overlayDark,
  modalTitle: commonColors.navyDark,
  modalSubtitle: commonColors.grayDark,
  modalBorder: commonColors.grayLight,
  modalLabel: commonColors.grayDark,
  modalInputBackground: commonColors.offWhite,
  modalInputBorder: commonColors.grayLight,
  modalInputText: commonColors.navyDark,
  modalInputPlaceholder: commonColors.gray,

  actionIcon: commonColors.navyDark,
  actionText: commonColors.navyDark,
  actionDivider: commonColors.grayLight,
  actionDangerText: commonColors.errorRed,
};

const stylesDark: StylesTheme['styles'] = {
  background: commonColors.darkSurface,
  headerTitle: commonColors.offWhite,
  headerSubtitle: commonColors.gray,

  tabBackground: commonColors.darkCard,
  tabActive: commonColors.navyLight,
  tabActiveText: commonColors.white,
  tabInactiveText: commonColors.gray,
  tabBorder: commonColors.darkBorder,

  outfitCardBackground: commonColors.darkCard,
  outfitCardBorder: commonColors.darkBorder,
  outfitCardName: commonColors.offWhite,
  outfitCardMosaicBackground: '#252525',
  outfitCardSourceBadge: '#252525',
  outfitCardSourceText: commonColors.gray,
  outfitCardAIBadge: '#4F46E5',
  outfitCardAIText: commonColors.white,

  starFilled: commonColors.gold,
  starEmpty: commonColors.darkBorder,

  tagBackground: '#252525',
  tagText: commonColors.gray,
  tagActiveBackground: commonColors.navyLight,
  tagActiveText: commonColors.white,

  emptyIcon: commonColors.darkBorder,
  emptyText: commonColors.offWhite,
  emptySubtitle: commonColors.gray,

  closetCategoryText: commonColors.offWhite,
  closetItemBackground: commonColors.darkCard,
  closetItemBorder: commonColors.darkBorder,
  closetItemSelectedBorder: commonColors.navyLight,
  closetItemSelectedBadge: commonColors.navyLight,
  closetItemSelectedCheck: commonColors.white,

  creatorPreviewBackground: commonColors.darkCard,
  creatorPreviewBorder: commonColors.darkBorder,
  creatorPreviewEmpty: '#252525',
  creatorPreviewEmptyText: commonColors.gray,
  creatorInputBackground: '#252525',
  creatorInputBorder: commonColors.darkBorder,
  creatorInputText: commonColors.offWhite,
  creatorInputLabel: commonColors.gray,
  creatorInputPlaceholder: commonColors.grayDark,

  buttonPrimary: commonColors.navyLight,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: '#252525',
  buttonSecondaryText: commonColors.offWhite,
  buttonSecondaryBorder: commonColors.darkBorder,
  buttonDanger: '#2D1515',
  buttonDangerText: '#E05A5E',
  buttonDangerBorder: '#5C1A1A',

  modalBackground: commonColors.darkCard,
  modalBackdrop: 'rgba(0,0,0,0.80)',
  modalTitle: commonColors.offWhite,
  modalSubtitle: commonColors.gray,
  modalBorder: commonColors.darkBorder,
  modalLabel: commonColors.gray,
  modalInputBackground: '#252525',
  modalInputBorder: commonColors.darkBorder,
  modalInputText: commonColors.offWhite,
  modalInputPlaceholder: commonColors.grayDark,

  actionIcon: commonColors.offWhite,
  actionText: commonColors.offWhite,
  actionDivider: commonColors.darkBorder,
  actionDangerText: '#E05A5E',
};

export interface StylesThemeInstance extends StylesTheme {}

export const stylesLightTheme: StylesThemeInstance = {
  ...lightTheme,
  styles: stylesLight,
};

export const stylesDarkTheme: StylesThemeInstance = {
  ...darkTheme,
  styles: stylesDark,
};
