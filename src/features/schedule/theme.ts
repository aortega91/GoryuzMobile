import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

export interface ScheduleTheme extends Theme {
  schedule: {
    background: string;
    headerTitle: string;
    headerSubtitle: string;

    navBackground: string;
    navBorder: string;
    navText: string;

    toggleBackground: string;
    toggleActiveBackground: string;
    toggleActiveText: string;
    toggleInactiveText: string;

    columnBorder: string;
    columnBackground: string;
    columnHeaderBackground: string;
    columnDayName: string;
    columnDayNumber: string;
    columnTodayBackground: string;
    columnTodayText: string;

    eventCardBackground: string;
    eventCardBorder: string;
    eventCardName: string;

    addButtonBorder: string;
    addButtonIcon: string;

    tripBadgeBackground: string;
    tripBadgeText: string;

    weatherSunny: string;
    weatherCloudy: string;
    weatherRainy: string;
    weatherSnowy: string;
    weatherTemp: string;

    emptyIcon: string;
    emptyText: string;

    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;

    inputBackground: string;
    inputBorder: string;
    inputBorderFocus: string;
    inputText: string;
    inputLabel: string;
    inputPlaceholder: string;
    inputHint: string;

    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDanger: string;
    buttonDangerText: string;
    buttonDangerBorder: string;

    outfitCardBackground: string;
    outfitCardBorder: string;
    outfitCardName: string;
    outfitCardSelected: string;

    tripCardBackground: string;
    tripCardBorder: string;

    calendarBackground: string;
    calendarDayText: string;
    calendarDaySelected: string;
    calendarDaySelectedText: string;
    calendarDayToday: string;
    calendarDayTodayText: string;
    calendarDayOtherMonth: string;
    calendarNavIcon: string;
    calendarHeaderText: string;

    packingItemBackground: string;
    packingItemBorder: string;
    packingItemName: string;
  };
}

const scheduleLight: ScheduleTheme['schedule'] = {
  background: commonColors.offWhite,
  headerTitle: commonColors.navyDark,
  headerSubtitle: commonColors.grayDark,

  navBackground: commonColors.white,
  navBorder: commonColors.grayLight,
  navText: commonColors.navyDark,

  toggleBackground: commonColors.grayLight,
  toggleActiveBackground: commonColors.white,
  toggleActiveText: commonColors.navyDark,
  toggleInactiveText: commonColors.gray,

  columnBorder: commonColors.grayLight,
  columnBackground: commonColors.white,
  columnHeaderBackground: commonColors.offWhite,
  columnDayName: commonColors.gray,
  columnDayNumber: commonColors.navyDark,
  columnTodayBackground: commonColors.navyDark,
  columnTodayText: commonColors.white,

  eventCardBackground: commonColors.offWhite,
  eventCardBorder: commonColors.grayLight,
  eventCardName: commonColors.navyDark,

  addButtonBorder: commonColors.grayLight,
  addButtonIcon: commonColors.gray,

  tripBadgeBackground: commonColors.navyDark,
  tripBadgeText: commonColors.copper,

  weatherSunny: commonColors.warningAmber,
  weatherCloudy: commonColors.gray,
  weatherRainy: '#5B8DB8',
  weatherSnowy: '#8BBBD9',
  weatherTemp: commonColors.grayDark,

  emptyIcon: commonColors.grayLight,
  emptyText: commonColors.gray,

  modalBackground: commonColors.white,
  modalBackdrop: commonColors.overlayDark,
  modalTitle: commonColors.navyDark,
  modalSubtitle: commonColors.grayDark,
  modalBorder: commonColors.grayLight,

  inputBackground: commonColors.offWhite,
  inputBorder: commonColors.grayLight,
  inputBorderFocus: commonColors.indigo,
  inputText: commonColors.navyDark,
  inputLabel: commonColors.grayDark,
  inputPlaceholder: commonColors.gray,
  inputHint: commonColors.gray,

  buttonPrimary: commonColors.indigo,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: commonColors.offWhite,
  buttonSecondaryText: commonColors.navyDark,
  buttonSecondaryBorder: commonColors.grayLight,
  buttonDanger: '#FEF2F2',
  buttonDangerText: commonColors.errorRed,
  buttonDangerBorder: '#FECACA',

  outfitCardBackground: commonColors.white,
  outfitCardBorder: commonColors.grayLight,
  outfitCardName: commonColors.navyDark,
  outfitCardSelected: commonColors.indigo,

  tripCardBackground: commonColors.white,
  tripCardBorder: commonColors.grayLight,

  calendarBackground: commonColors.white,
  calendarDayText: commonColors.navyDark,
  calendarDaySelected: commonColors.indigo,
  calendarDaySelectedText: commonColors.white,
  calendarDayToday: commonColors.copper,
  calendarDayTodayText: commonColors.white,
  calendarDayOtherMonth: commonColors.gray,
  calendarNavIcon: commonColors.navyDark,
  calendarHeaderText: commonColors.navyDark,

  packingItemBackground: commonColors.offWhite,
  packingItemBorder: commonColors.grayLight,
  packingItemName: commonColors.navyDark,
};

const scheduleDark: ScheduleTheme['schedule'] = {
  background: commonColors.darkSurface,
  headerTitle: commonColors.offWhite,
  headerSubtitle: commonColors.gray,

  navBackground: commonColors.darkCard,
  navBorder: commonColors.darkBorder,
  navText: commonColors.offWhite,

  toggleBackground: commonColors.darkCard,
  toggleActiveBackground: commonColors.darkCard,
  toggleActiveText: commonColors.offWhite,
  toggleInactiveText: commonColors.gray,

  columnBorder: commonColors.darkBorder,
  columnBackground: commonColors.darkCard,
  columnHeaderBackground: commonColors.darkCard,
  columnDayName: commonColors.gray,
  columnDayNumber: commonColors.offWhite,
  columnTodayBackground: commonColors.copper,
  columnTodayText: commonColors.white,

  eventCardBackground: commonColors.darkCard,
  eventCardBorder: commonColors.darkBorder,
  eventCardName: commonColors.offWhite,

  addButtonBorder: commonColors.darkBorder,
  addButtonIcon: commonColors.gray,

  tripBadgeBackground: commonColors.navyMid,
  tripBadgeText: commonColors.copperLight,

  weatherSunny: commonColors.warningAmber,
  weatherCloudy: commonColors.gray,
  weatherRainy: '#6B9DC4',
  weatherSnowy: '#9BBFD9',
  weatherTemp: commonColors.gray,

  emptyIcon: commonColors.darkBorder,
  emptyText: commonColors.gray,

  modalBackground: commonColors.darkCard,
  modalBackdrop: 'rgba(0,0,0,0.80)',
  modalTitle: commonColors.offWhite,
  modalSubtitle: commonColors.gray,
  modalBorder: commonColors.darkBorder,

  inputBackground: commonColors.darkCard,
  inputBorder: commonColors.darkBorder,
  inputBorderFocus: commonColors.indigoLight,
  inputText: commonColors.offWhite,
  inputLabel: commonColors.gray,
  inputPlaceholder: commonColors.grayDark,
  inputHint: commonColors.grayDark,

  buttonPrimary: commonColors.indigoLight,
  buttonPrimaryText: commonColors.white,
  buttonSecondary: commonColors.darkCard,
  buttonSecondaryText: commonColors.offWhite,
  buttonSecondaryBorder: commonColors.darkBorder,
  buttonDanger: '#2D1515',
  buttonDangerText: '#E05A5E',
  buttonDangerBorder: '#5C1A1A',

  outfitCardBackground: commonColors.darkCard,
  outfitCardBorder: commonColors.darkBorder,
  outfitCardName: commonColors.offWhite,
  outfitCardSelected: commonColors.indigo,

  tripCardBackground: commonColors.darkCard,
  tripCardBorder: commonColors.darkBorder,

  calendarBackground: commonColors.darkCard,
  calendarDayText: commonColors.offWhite,
  calendarDaySelected: commonColors.indigo,
  calendarDaySelectedText: commonColors.white,
  calendarDayToday: commonColors.copper,
  calendarDayTodayText: commonColors.white,
  calendarDayOtherMonth: '#374151',
  calendarNavIcon: commonColors.offWhite,
  calendarHeaderText: commonColors.offWhite,

  packingItemBackground: commonColors.darkCard,
  packingItemBorder: commonColors.darkBorder,
  packingItemName: commonColors.offWhite,
};

export interface ScheduleThemeInstance extends ScheduleTheme {}

export const scheduleLightTheme: ScheduleThemeInstance = {
  ...lightTheme,
  schedule: scheduleLight,
};

export const scheduleDarkTheme: ScheduleThemeInstance = {
  ...darkTheme,
  schedule: scheduleDark,
};