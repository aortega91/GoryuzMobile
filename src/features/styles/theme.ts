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

    bottomBarBackground: string;
    bottomBarBorder: string;
    bottomBarActive: string;
    bottomBarInactive: string;

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

    addBtnBackground: string;
    addBtnBorder: string;
    addBtnIcon: string;

    fabBackground: string;
    fabIcon: string;

    filterPillBackground: string;
    filterPillBorder: string;
    filterPillText: string;
    filterPillActiveBackground: string;
    filterPillActiveBorder: string;
    filterPillActiveText: string;

    // Essence tab
    essenceSectionBackground: string;
    essenceSectionBorder: string;
    essenceInputBackground: string;
    essenceInputBorder: string;
    essenceInputText: string;
    essenceInputPlaceholder: string;
    essenceIconIndigo: string;
    essenceIconPurple: string;
    essenceIconEmerald: string;
    essenceAnalysisBackground: string;
    essenceAnalysisBorder: string;
    essenceAnalysisText: string;
    essenceHeroBg: string;
    essenceHeroBorder: string;
    essenceHeroTitle: string;
    essenceHeroSubtitle: string;
    essenceCardSkyBg: string;
    essenceCardSkyBorder: string;
    essenceCardSkyTitle: string;
    essenceCardPurpleBg: string;
    essenceCardPurpleBorder: string;
    essenceCardPurpleTitle: string;
    essenceCardEmeraldBg: string;
    essenceCardEmeraldBorder: string;
    essenceCardEmeraldTitle: string;
    essenceCardAlertBg: string;
    essenceCardAlertBorder: string;
    essenceCardAlertTitle: string;
    essenceCardBody: string;
    essenceToggleActive: string;
    essenceToggleInactive: string;
    essenceGemsBadgeBackground: string;
    essenceGemsBadgeBorder: string;
    essenceGemsBadgeText: string;
    essenceVipOverlay: string;
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

  bottomBarBackground: commonColors.white,
  bottomBarBorder: commonColors.grayLight,
  bottomBarActive: commonColors.navyDark,
  bottomBarInactive: commonColors.gray,

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

  addBtnBackground: '#EDE9FE',
  addBtnBorder: '#C4B5FD',
  addBtnIcon: '#6366F1',

  fabBackground: '#6366F1',
  fabIcon: commonColors.white,

  filterPillBackground: commonColors.white,
  filterPillBorder: commonColors.grayLight,
  filterPillText: commonColors.grayDark,
  filterPillActiveBackground: commonColors.navyDark,
  filterPillActiveBorder: commonColors.navyDark,
  filterPillActiveText: commonColors.white,

  essenceSectionBackground: commonColors.white,
  essenceSectionBorder: commonColors.grayLight,
  essenceInputBackground: '#F9FAFB',
  essenceInputBorder: commonColors.grayLight,
  essenceInputText: commonColors.navyDark,
  essenceInputPlaceholder: commonColors.gray,
  essenceIconIndigo: '#4F46E5',
  essenceIconPurple: '#7C3AED',
  essenceIconEmerald: '#059669',
  essenceAnalysisBackground: '#F9FAFB',
  essenceAnalysisBorder: commonColors.grayLight,
  essenceAnalysisText: commonColors.grayDark,
  essenceHeroBg: '#FFFBEB',
  essenceHeroBorder: '#FDE68A',
  essenceHeroTitle: commonColors.navyDark,
  essenceHeroSubtitle: commonColors.grayDark,
  essenceCardSkyBg: '#F0F9FF',
  essenceCardSkyBorder: '#BAE6FD',
  essenceCardSkyTitle: '#0C4A6E',
  essenceCardPurpleBg: '#FAF5FF',
  essenceCardPurpleBorder: '#DDD6FE',
  essenceCardPurpleTitle: '#4C1D95',
  essenceCardEmeraldBg: '#ECFDF5',
  essenceCardEmeraldBorder: '#A7F3D0',
  essenceCardEmeraldTitle: '#064E3B',
  essenceCardAlertBg: '#FFF7ED',
  essenceCardAlertBorder: '#FED7AA',
  essenceCardAlertTitle: '#7C2D12',
  essenceCardBody: '#374151',
  essenceToggleActive: '#4F46E5',
  essenceToggleInactive: '#D1D5DB',
  essenceGemsBadgeBackground: '#F5F3FF',
  essenceGemsBadgeBorder: '#DDD6FE',
  essenceGemsBadgeText: '#6D28D9',
  essenceVipOverlay: 'rgba(250,245,255,0.85)',
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

  bottomBarBackground: commonColors.darkCard,
  bottomBarBorder: commonColors.darkBorder,
  bottomBarActive: commonColors.white,
  bottomBarInactive: 'rgba(255,255,255,0.40)',

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

  addBtnBackground: 'rgba(99,102,241,0.15)',
  addBtnBorder: 'rgba(99,102,241,0.35)',
  addBtnIcon: '#818CF8',

  fabBackground: '#4F46E5',
  fabIcon: commonColors.white,

  filterPillBackground: commonColors.darkCard,
  filterPillBorder: commonColors.darkBorder,
  filterPillText: commonColors.gray,
  filterPillActiveBackground: commonColors.white,
  filterPillActiveBorder: commonColors.white,
  filterPillActiveText: commonColors.navyDark,

  essenceSectionBackground: commonColors.darkCard,
  essenceSectionBorder: commonColors.darkBorder,
  essenceInputBackground: '#1A1A1A',
  essenceInputBorder: commonColors.darkBorder,
  essenceInputText: commonColors.offWhite,
  essenceInputPlaceholder: commonColors.grayDark,
  essenceIconIndigo: '#818CF8',
  essenceIconPurple: '#A78BFA',
  essenceIconEmerald: '#34D399',
  essenceAnalysisBackground: '#1A1A1A',
  essenceAnalysisBorder: commonColors.darkBorder,
  essenceAnalysisText: commonColors.gray,
  essenceHeroBg: 'rgba(120,53,15,0.25)',
  essenceHeroBorder: 'rgba(180,83,9,0.3)',
  essenceHeroTitle: commonColors.offWhite,
  essenceHeroSubtitle: commonColors.gray,
  essenceCardSkyBg: 'rgba(12,74,110,0.25)',
  essenceCardSkyBorder: 'rgba(14,116,144,0.3)',
  essenceCardSkyTitle: '#BAE6FD',
  essenceCardPurpleBg: 'rgba(76,29,149,0.2)',
  essenceCardPurpleBorder: 'rgba(109,40,217,0.3)',
  essenceCardPurpleTitle: '#DDD6FE',
  essenceCardEmeraldBg: 'rgba(6,78,59,0.2)',
  essenceCardEmeraldBorder: 'rgba(16,185,129,0.3)',
  essenceCardEmeraldTitle: '#A7F3D0',
  essenceCardAlertBg: 'rgba(124,45,18,0.2)',
  essenceCardAlertBorder: 'rgba(234,88,12,0.3)',
  essenceCardAlertTitle: '#FED7AA',
  essenceCardBody: '#D1D5DB',
  essenceToggleActive: '#818CF8',
  essenceToggleInactive: '#374151',
  essenceGemsBadgeBackground: 'rgba(76,29,149,0.2)',
  essenceGemsBadgeBorder: 'rgba(109,40,217,0.3)',
  essenceGemsBadgeText: '#A78BFA',
  essenceVipOverlay: 'rgba(30,18,60,0.85)',
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
