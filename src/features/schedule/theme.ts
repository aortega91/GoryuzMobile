import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette } from '@theme/palettes';

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

    bottomBarBackground: string;
    bottomBarBorder: string;
    bottomBarActive: string;
    bottomBarInactive: string;

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

// ─── Light-structural variant — used by natural/moderno/elegancia ─────────────

function buildScheduleLight(palette: BrandPalette): ScheduleTheme {
  const accent600 = palette.accent[600];

  return {
    ...getCommonTheme(palette),
    schedule: {
      background: commonColors.offWhite,
      headerTitle: palette.primary,
      headerSubtitle: commonColors.grayDark,

      navBackground: commonColors.white,
      navBorder: commonColors.grayLight,
      navText: palette.primary,

      toggleBackground: commonColors.grayLight,
      toggleActiveBackground: commonColors.white,
      toggleActiveText: palette.primary,
      toggleInactiveText: commonColors.gray,

      bottomBarBackground: commonColors.white,
      bottomBarBorder: commonColors.grayLight,
      bottomBarActive: accent600,
      bottomBarInactive: commonColors.gray,

      columnBorder: commonColors.grayLight,
      columnBackground: commonColors.white,
      columnHeaderBackground: commonColors.offWhite,
      columnDayName: commonColors.gray,
      columnDayNumber: palette.primary,
      columnTodayBackground: palette.primary,
      columnTodayText: commonColors.white,

      eventCardBackground: commonColors.offWhite,
      eventCardBorder: commonColors.grayLight,
      eventCardName: palette.primary,

      addButtonBorder: commonColors.grayLight,
      addButtonIcon: commonColors.gray,

      tripBadgeBackground: palette.primary,
      tripBadgeText: accent600,

      weatherSunny: commonColors.warningAmber,
      weatherCloudy: commonColors.gray,
      weatherRainy: '#5B8DB8',
      weatherSnowy: '#8BBBD9',
      weatherTemp: commonColors.grayDark,

      emptyIcon: commonColors.grayLight,
      emptyText: commonColors.gray,

      modalBackground: commonColors.white,
      modalBackdrop: commonColors.overlayDark,
      modalTitle: palette.primary,
      modalSubtitle: commonColors.grayDark,
      modalBorder: commonColors.grayLight,

      inputBackground: commonColors.offWhite,
      inputBorder: commonColors.grayLight,
      inputBorderFocus: accent600,
      inputText: palette.primary,
      inputLabel: commonColors.grayDark,
      inputPlaceholder: commonColors.gray,
      inputHint: commonColors.gray,

      buttonPrimary: accent600,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.offWhite,
      buttonSecondaryText: palette.primary,
      buttonSecondaryBorder: commonColors.grayLight,
      buttonDanger: '#FEF2F2',
      buttonDangerText: commonColors.errorRed,
      buttonDangerBorder: '#FECACA',

      outfitCardBackground: commonColors.white,
      outfitCardBorder: commonColors.grayLight,
      outfitCardName: palette.primary,
      outfitCardSelected: accent600,

      tripCardBackground: commonColors.white,
      tripCardBorder: commonColors.grayLight,

      calendarBackground: commonColors.white,
      calendarDayText: palette.primary,
      calendarDaySelected: accent600,
      calendarDaySelectedText: commonColors.white,
      calendarDayToday: accent600,
      calendarDayTodayText: commonColors.white,
      calendarDayOtherMonth: commonColors.gray,
      calendarNavIcon: palette.primary,
      calendarHeaderText: palette.primary,

      packingItemBackground: commonColors.offWhite,
      packingItemBorder: commonColors.grayLight,
      packingItemName: palette.primary,
    },
  };
}

// ─── Dark-structural variant — used only by `boutique` ────────────────────────

function buildScheduleDark(palette: BrandPalette): ScheduleTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];
  const accent700 = palette.accent[700];

  return {
    ...getCommonTheme(palette),
    schedule: {
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

      bottomBarBackground: commonColors.darkCard,
      bottomBarBorder: commonColors.darkBorder,
      bottomBarActive: commonColors.offWhite,
      bottomBarInactive: commonColors.gray,

      columnBorder: commonColors.darkBorder,
      columnBackground: commonColors.darkCard,
      columnHeaderBackground: commonColors.darkCard,
      columnDayName: commonColors.gray,
      columnDayNumber: commonColors.offWhite,
      columnTodayBackground: accentDefault,
      columnTodayText: commonColors.white,

      eventCardBackground: commonColors.darkCard,
      eventCardBorder: commonColors.darkBorder,
      eventCardName: commonColors.offWhite,

      addButtonBorder: commonColors.darkBorder,
      addButtonIcon: commonColors.gray,

      // Badge fill — deep accent tone rather than a raised/active surface.
      tripBadgeBackground: accent700,
      tripBadgeText: accent400,

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
      inputBorderFocus: accent400,
      inputText: commonColors.offWhite,
      inputLabel: commonColors.gray,
      inputPlaceholder: commonColors.grayDark,
      inputHint: commonColors.grayDark,

      buttonPrimary: accent400,
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
      outfitCardSelected: accentDefault,

      tripCardBackground: commonColors.darkCard,
      tripCardBorder: commonColors.darkBorder,

      calendarBackground: commonColors.darkCard,
      calendarDayText: commonColors.offWhite,
      calendarDaySelected: accentDefault,
      calendarDaySelectedText: commonColors.white,
      calendarDayToday: accentDefault,
      calendarDayTodayText: commonColors.white,
      calendarDayOtherMonth: '#374151',
      calendarNavIcon: commonColors.offWhite,
      calendarHeaderText: commonColors.offWhite,

      packingItemBackground: commonColors.darkCard,
      packingItemBorder: commonColors.darkBorder,
      packingItemName: commonColors.offWhite,
    },
  };
}

export function getScheduleTheme(palette: BrandPalette): ScheduleTheme {
  return palette.dark ? buildScheduleDark(palette) : buildScheduleLight(palette);
}
