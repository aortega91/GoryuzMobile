import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

export interface DiscoverTheme extends Theme {
  discover: {
    background: string;
    headerTitle: string;
    headerSubtitle: string;

    bottomBarBackground: string;
    bottomBarBorder: string;
    bottomBarActive: string;
    bottomBarInactive: string;

    // Cards
    cardBackground: string;
    cardBorder: string;
    cardName: string;
    cardBrand: string;

    // Filter pills
    filterPillBackground: string;
    filterPillBorder: string;
    filterPillText: string;
    filterPillActiveBackground: string;
    filterPillActiveBorder: string;
    filterPillActiveText: string;

    // Empty / loading / error
    emptyIcon: string;
    emptyText: string;
    emptySubtitle: string;

    // Dashed upload zone
    dashedBorder: string;
    dashedBackground: string;

    // Chips (identified items)
    chipBackground: string;
    chipBorder: string;
    chipText: string;
    chipActiveBackground: string;
    chipActiveBorder: string;
    chipActiveText: string;

    // Source link rows
    sourceLinkBackground: string;
    sourceLinkBorder: string;
    sourceLinkTitle: string;
    sourceLinkIcon: string;

    // FAB
    fabBackground: string;
    fabIcon: string;

    // Gem badge
    gemBadgeBackground: string;
    gemBadgeBorder: string;
    gemBadgeText: string;

    // Buttons
    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDangerText: string;

    // Modals / sheets
    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;
    modalInputBackground: string;
    modalInputBorder: string;
    modalInputText: string;
    modalInputPlaceholder: string;

    // Segmented control
    segmentBackground: string;
    segmentBorder: string;
    segmentActiveBackground: string;
    segmentActiveText: string;
    segmentInactiveText: string;

    // Closet item selector
    closetItemBackground: string;
    closetItemBorder: string;
    closetItemSelectedBorder: string;
    closetItemSelectedBadge: string;
    closetItemSelectedCheck: string;
    closetCategoryText: string;

    // Result image
    resultImageBackground: string;
    resultImageBorder: string;

    // Link text (Ver button)
    linkText: string;
  };
}

const discoverLight: DiscoverTheme['discover'] = {
  background: commonColors.offWhite,
  headerTitle: commonColors.navyDark,
  headerSubtitle: commonColors.grayDark,

  bottomBarBackground: commonColors.white,
  bottomBarBorder: commonColors.grayLight,
  bottomBarActive: commonColors.navyDark,
  bottomBarInactive: commonColors.gray,

  cardBackground: commonColors.white,
  cardBorder: commonColors.grayLight,
  cardName: commonColors.navyDark,
  cardBrand: commonColors.grayDark,

  filterPillBackground: commonColors.white,
  filterPillBorder: commonColors.grayLight,
  filterPillText: commonColors.grayDark,
  filterPillActiveBackground: commonColors.navyDark,
  filterPillActiveBorder: commonColors.navyDark,
  filterPillActiveText: commonColors.white,

  emptyIcon: commonColors.grayLight,
  emptyText: commonColors.navyDark,
  emptySubtitle: commonColors.gray,

  dashedBorder: commonColors.grayLight,
  dashedBackground: commonColors.white,

  chipBackground: commonColors.white,
  chipBorder: commonColors.grayLight,
  chipText: commonColors.grayDark,
  chipActiveBackground: '#4F46E5',
  chipActiveBorder: '#4F46E5',
  chipActiveText: commonColors.white,

  sourceLinkBackground: commonColors.white,
  sourceLinkBorder: commonColors.grayLight,
  sourceLinkTitle: commonColors.navyDark,
  sourceLinkIcon: commonColors.grayDark,

  fabBackground: '#6366F1',
  fabIcon: commonColors.white,

  gemBadgeBackground: '#F5F3FF',
  gemBadgeBorder: '#DDD6FE',
  gemBadgeText: '#6D28D9',

  buttonPrimary: commonColors.navyDark,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: commonColors.offWhite,
  buttonSecondaryText: commonColors.navyDark,
  buttonSecondaryBorder: commonColors.grayLight,
  buttonDangerText: commonColors.errorRed,

  modalBackground: commonColors.white,
  modalBackdrop: commonColors.overlayDark,
  modalTitle: commonColors.navyDark,
  modalSubtitle: commonColors.grayDark,
  modalBorder: commonColors.grayLight,
  modalInputBackground: commonColors.offWhite,
  modalInputBorder: commonColors.grayLight,
  modalInputText: commonColors.navyDark,
  modalInputPlaceholder: commonColors.gray,

  segmentBackground: commonColors.grayLight,
  segmentBorder: commonColors.grayLight,
  segmentActiveBackground: commonColors.white,
  segmentActiveText: commonColors.navyDark,
  segmentInactiveText: commonColors.gray,

  closetItemBackground: commonColors.white,
  closetItemBorder: commonColors.grayLight,
  closetItemSelectedBorder: commonColors.navyDark,
  closetItemSelectedBadge: commonColors.navyDark,
  closetItemSelectedCheck: commonColors.white,
  closetCategoryText: commonColors.navyDark,

  resultImageBackground: commonColors.offWhite,
  resultImageBorder: commonColors.grayLight,

  linkText: '#4F46E5',
};

const discoverDark: DiscoverTheme['discover'] = {
  background: commonColors.darkSurface,
  headerTitle: commonColors.offWhite,
  headerSubtitle: commonColors.gray,

  bottomBarBackground: commonColors.darkCard,
  bottomBarBorder: commonColors.darkBorder,
  bottomBarActive: commonColors.white,
  bottomBarInactive: 'rgba(255,255,255,0.40)',

  cardBackground: commonColors.darkCard,
  cardBorder: commonColors.darkBorder,
  cardName: commonColors.offWhite,
  cardBrand: commonColors.gray,

  filterPillBackground: commonColors.darkCard,
  filterPillBorder: commonColors.darkBorder,
  filterPillText: commonColors.gray,
  filterPillActiveBackground: commonColors.white,
  filterPillActiveBorder: commonColors.white,
  filterPillActiveText: commonColors.navyDark,

  emptyIcon: commonColors.darkBorder,
  emptyText: commonColors.offWhite,
  emptySubtitle: commonColors.gray,

  dashedBorder: commonColors.darkBorder,
  dashedBackground: commonColors.darkCard,

  chipBackground: commonColors.darkCard,
  chipBorder: commonColors.darkBorder,
  chipText: commonColors.gray,
  chipActiveBackground: '#4F46E5',
  chipActiveBorder: '#4F46E5',
  chipActiveText: commonColors.white,

  sourceLinkBackground: commonColors.darkCard,
  sourceLinkBorder: commonColors.darkBorder,
  sourceLinkTitle: commonColors.offWhite,
  sourceLinkIcon: commonColors.gray,

  fabBackground: '#4F46E5',
  fabIcon: commonColors.white,

  gemBadgeBackground: 'rgba(76,29,149,0.2)',
  gemBadgeBorder: 'rgba(109,40,217,0.3)',
  gemBadgeText: '#A78BFA',

  buttonPrimary: '#2E4A80',
  buttonPrimaryText: commonColors.white,
  buttonSecondary: '#252525',
  buttonSecondaryText: commonColors.offWhite,
  buttonSecondaryBorder: commonColors.darkBorder,
  buttonDangerText: '#E05A5E',

  modalBackground: commonColors.darkCard,
  modalBackdrop: 'rgba(0,0,0,0.80)',
  modalTitle: commonColors.offWhite,
  modalSubtitle: commonColors.gray,
  modalBorder: commonColors.darkBorder,
  modalInputBackground: '#252525',
  modalInputBorder: commonColors.darkBorder,
  modalInputText: commonColors.offWhite,
  modalInputPlaceholder: commonColors.grayDark,

  segmentBackground: '#252525',
  segmentBorder: commonColors.darkBorder,
  segmentActiveBackground: commonColors.darkCard,
  segmentActiveText: commonColors.offWhite,
  segmentInactiveText: commonColors.gray,

  closetItemBackground: commonColors.darkCard,
  closetItemBorder: commonColors.darkBorder,
  closetItemSelectedBorder: '#2E4A80',
  closetItemSelectedBadge: '#2E4A80',
  closetItemSelectedCheck: commonColors.white,
  closetCategoryText: commonColors.offWhite,

  resultImageBackground: '#252525',
  resultImageBorder: commonColors.darkBorder,

  linkText: '#818CF8',
};

export interface DiscoverThemeInstance extends DiscoverTheme {}

export const discoverLightTheme: DiscoverThemeInstance = {
  ...lightTheme,
  discover: discoverLight,
};

export const discoverDarkTheme: DiscoverThemeInstance = {
  ...darkTheme,
  discover: discoverDark,
};
