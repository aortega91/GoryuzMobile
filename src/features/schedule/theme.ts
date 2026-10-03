import commonColors, { tailwindHues } from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';
import { AgendaMotive } from './types';

export interface MotiveColors {
  /** Plan chip inside a day and on the plan cards */
  chipBackground: string;
  chipText: string;
  /** Tint of a day column / day card the plan occupies */
  dayTint: string;
  /** Motive picker button while selected */
  selectedBorder: string;
  selectedBackground: string;
  selectedText: string;
}

export interface StatusColors {
  background: string;
  text: string;
}

type Hue = { 50: string; 100: string; 200: string; 500: string; 700: string; 900: string; 950: string };

// zena agendaMotives.ts: chip 100/700, tint 50@70%, picker 500 border + 50 bg.
function lightMotive(h: Hue): MotiveColors {
  return {
    chipBackground: h[100],
    chipText: h[700],
    dayTint: withAlpha(h[50], 0.7),
    selectedBorder: h[500],
    selectedBackground: h[50],
    selectedText: h[700],
  };
}

// zena dark variants: chip 900@40% / 200, tint 950@30%, picker 900@30%.
function darkMotive(h: Hue): MotiveColors {
  return {
    chipBackground: withAlpha(h[900], 0.4),
    chipText: h[200],
    dayTint: withAlpha(h[950], 0.3),
    selectedBorder: h[500],
    selectedBackground: withAlpha(h[900], 0.3),
    selectedText: h[200],
  };
}

const g = tailwindHues.gray;

function motiveColors(dark: boolean): Record<AgendaMotive, MotiveColors> {
  const build = dark ? darkMotive : lightMotive;
  return {
    work: build(tailwindHues.blue),
    interview: build(tailwindHues.amber),
    party: build(tailwindHues.fuchsia),
    date: build(tailwindHues.rose),
    vacation: build(tailwindHues.emerald),
    sport: build(tailwindHues.orange),
    family: build(tailwindHues.teal),
    study: build(tailwindHues.violet),
    other: dark
      ? {
        chipBackground: g[700],
        chipText: g[200],
        dayTint: withAlpha(g[800], 0.6),
        selectedBorder: g[400],
        selectedBackground: g[700],
        selectedText: g[200],
      }
      : {
        chipBackground: g[100],
        chipText: g[700],
        dayTint: g[50],
        selectedBorder: g[400],
        selectedBackground: g[100],
        selectedText: g[700],
      },
  };
}

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
    // Spinner tile while outfit images download
    imageLoader: string;
    imagePlaceholder: string;
    emptyText: string;

    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;

    // Add-outfit choice sheet (zena AddToCalendarChoiceModal)
    choiceCardBackground: string;
    choiceCardBorder: string;
    choiceIconBackground: string;
    choiceAiIcon: string;
    choiceSavedIcon: string;
    choiceTitleIconBackground: string;
    choiceTitleIcon: string;

    // Non-VIP lock over the whole Agenda (zena CalendarView isLocked)
    lockCardBackground: string;
    lockCardBorder: string;
    lockIcon: string;
    lockTitle: string;
    lockDesc: string;
    lockButtonBackground: string;
    lockButtonText: string;

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

    // Header actions (design: "Auto-Asignar" soft button next to "Nuevo plan")
    headerSecondaryBackground: string;
    headerSecondaryBorder: string;
    headerSecondaryText: string;

    // Week grid
    gridBackground: string;
    gridDivider: string;
    dayPastText: string;

    // Day view — design's dark "Nuevo Look" button
    strongButton: string;
    strongButtonText: string;
    weatherBoxBackground: string;
    weatherBoxBorder: string;
    weatherAwayText: string;
    occasionChipBackground: string;
    occasionChipText: string;
    ratingBadgeBackground: string;
    ratingBadgeText: string;
    ratingStar: string;

    // Plan form / detail
    switchTrackOn: string;
    switchTrackOff: string;
    switchThumb: string;
    countBadgeBackground: string;
    countBadgeText: string;
    linkText: string;
    chipNeutralBackground: string;
    chipNeutralText: string;
    chipNeutralIcon: string;

    // zena mobile rendering — week grid "+" tile (normal / past day)
    weekAddBorder: string;
    weekAddIcon: string;
    weekAddPastBorder: string;
    weekAddPastIcon: string;
    // Plans tab dashed "New plan" card
    newPlanBorder: string;
    newPlanText: string;
    // Day tab look tiles + empty state
    dayTileBackground: string;
    dayTileBorder: string;
    dayTileName: string;
    dayTileMeta: string;
    dayEmptyBackground: string;
    dayEmptyBorder: string;
    dayEmptyIconBackground: string;
    dayEmptyIcon: string;
    dayEmptyTitle: string;
    dayEmptyHint: string;
    // Muted buttons (event "Move", plan form "Cancel")
    mutedButtonBackground: string;
    mutedButtonText: string;
    // Plan detail forecast banner
    weatherBannerText: string;
    weatherBannerIcon: string;
    weatherBannerIconBackground: string;

    statusPast: StatusColors;
    statusUpcoming: StatusColors;
    statusOngoing: StatusColors;
    motives: Record<AgendaMotive, MotiveColors>;
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
      navBorder: g[100],
      navText: palette.primary,

      toggleBackground: commonColors.grayLight,
      toggleActiveBackground: commonColors.white,
      toggleActiveText: palette.primary,
      toggleInactiveText: commonColors.gray,

      bottomBarBackground: commonColors.white,
      bottomBarBorder: commonColors.grayLight,
      bottomBarActive: accent600,
      bottomBarInactive: commonColors.gray,

      columnBorder: g[100],
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
      imageLoader: accent600,
      imagePlaceholder: tailwindHues.gray[200],
      emptyText: commonColors.gray,

      modalBackground: commonColors.white,
      modalBackdrop: commonColors.overlayDark,
      modalTitle: palette.primary,
      modalSubtitle: commonColors.grayDark,
      modalBorder: commonColors.grayLight,

      // Add-outfit choice sheet (zena AddToCalendarChoiceModal)
      choiceCardBackground: tailwindHues.gray[50],
      choiceCardBorder: tailwindHues.gray[100],
      choiceIconBackground: commonColors.white,
      choiceAiIcon: palette.accent[500],
      choiceSavedIcon: tailwindHues.yellow[500],
      choiceTitleIconBackground: palette.accent[50],
      choiceTitleIcon: accent600,

      // Non-VIP lock over the whole Agenda (zena CalendarView isLocked)
      lockCardBackground: withAlpha(commonColors.white, 0.9),
      lockCardBorder: withAlpha(commonColors.white, 0.2),
      lockIcon: tailwindHues.rose[500],
      lockTitle: tailwindHues.gray[900],
      lockDesc: tailwindHues.gray[500],
      lockButtonBackground: tailwindHues.gray[900],
      lockButtonText: commonColors.white,

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
      tripCardBorder: g[100],

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

      headerSecondaryBackground: palette.accent[50],
      headerSecondaryBorder: palette.accent[100],
      headerSecondaryText: accent600,

      gridBackground: commonColors.white,
      gridDivider: g[100],
      dayPastText: g[300],

      strongButton: palette.primary,
      strongButtonText: commonColors.white,
      weatherBoxBackground: tailwindHues.blue[50],
      weatherBoxBorder: tailwindHues.blue[100],
      weatherAwayText: tailwindHues.blue[700],
      occasionChipBackground: palette.accent[50],
      occasionChipText: accent600,
      ratingBadgeBackground: 'rgba(0,0,0,0.6)',
      ratingBadgeText: commonColors.white,
      ratingStar: tailwindHues.yellow[400],

      switchTrackOn: accent600,
      switchTrackOff: g[300],
      switchThumb: commonColors.white,
      countBadgeBackground: palette.accent[100],
      countBadgeText: accent600,
      linkText: accent600,
      chipNeutralBackground: g[100],
      chipNeutralText: g[500],
      chipNeutralIcon: palette.accent[500],

      weekAddBorder: g[200],
      weekAddIcon: g[300],
      weekAddPastBorder: g[100],
      weekAddPastIcon: g[200],
      newPlanBorder: g[300],
      newPlanText: g[400],
      dayTileBackground: g[50],
      dayTileBorder: g[100],
      dayTileName: g[800],
      dayTileMeta: g[500],
      dayEmptyBackground: withAlpha(g[50], 0.5),
      dayEmptyBorder: g[200],
      dayEmptyIconBackground: commonColors.white,
      dayEmptyIcon: g[400],
      dayEmptyTitle: g[900],
      dayEmptyHint: g[500],
      mutedButtonBackground: g[50],
      mutedButtonText: g[600],
      weatherBannerText: tailwindHues.blue[800],
      weatherBannerIcon: tailwindHues.blue[700],
      weatherBannerIconBackground: commonColors.white,

      statusPast: { background: g[100], text: g[500] },
      statusUpcoming: { background: palette.accent[50], text: accent600 },
      statusOngoing: { background: tailwindHues.emerald[50], text: tailwindHues.emerald[600] },
      motives: motiveColors(false),
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
      imageLoader: accent400,
      imagePlaceholder: tailwindHues.gray[800],
      emptyText: commonColors.gray,

      modalBackground: commonColors.darkCard,
      modalBackdrop: 'rgba(0,0,0,0.80)',
      modalTitle: commonColors.offWhite,
      modalSubtitle: commonColors.gray,
      modalBorder: commonColors.darkBorder,

      // Add-outfit choice sheet (zena AddToCalendarChoiceModal)
      choiceCardBackground: withAlpha(tailwindHues.gray[800], 0.5),
      choiceCardBorder: withAlpha(tailwindHues.gray[700], 0.5),
      choiceIconBackground: tailwindHues.gray[800],
      choiceAiIcon: palette.accent[500],
      choiceSavedIcon: tailwindHues.yellow[500],
      choiceTitleIconBackground: withAlpha(palette.accent[950], 0.3),
      choiceTitleIcon: accent400,

      // Non-VIP lock over the whole Agenda (zena CalendarView isLocked)
      lockCardBackground: withAlpha(tailwindHues.gray[900], 0.9),
      lockCardBorder: tailwindHues.gray[700],
      lockIcon: tailwindHues.rose[500],
      lockTitle: commonColors.white,
      lockDesc: tailwindHues.gray[300],
      lockButtonBackground: tailwindHues.gray[900],
      lockButtonText: commonColors.white,

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

      headerSecondaryBackground: withAlpha(accent400, 0.15),
      headerSecondaryBorder: accent700,
      headerSecondaryText: accent400,

      gridBackground: commonColors.darkCard,
      gridDivider: commonColors.darkBorder,
      dayPastText: g[600],

      strongButton: accentDefault,
      strongButtonText: commonColors.white,
      weatherBoxBackground: withAlpha(tailwindHues.blue[900], 0.2),
      weatherBoxBorder: withAlpha(tailwindHues.blue[800], 0.5),
      weatherAwayText: tailwindHues.blue[300],
      occasionChipBackground: withAlpha(accent400, 0.15),
      occasionChipText: accent400,
      ratingBadgeBackground: 'rgba(0,0,0,0.6)',
      ratingBadgeText: commonColors.white,
      ratingStar: tailwindHues.yellow[400],

      switchTrackOn: accentDefault,
      switchTrackOff: g[700],
      switchThumb: commonColors.white,
      countBadgeBackground: withAlpha(palette.accent[900], 0.4),
      countBadgeText: palette.accent[300],
      linkText: accentDefault,
      chipNeutralBackground: commonColors.darkSurface,
      chipNeutralText: commonColors.gray,
      chipNeutralIcon: accentDefault,

      weekAddBorder: g[600],
      weekAddIcon: g[500],
      weekAddPastBorder: g[700],
      weekAddPastIcon: g[700],
      newPlanBorder: g[600],
      newPlanText: g[500],
      dayTileBackground: withAlpha(g[700], 0.4),
      dayTileBorder: g[700],
      dayTileName: commonColors.white,
      dayTileMeta: g[400],
      dayEmptyBackground: withAlpha(g[800], 0.3),
      dayEmptyBorder: g[700],
      dayEmptyIconBackground: g[800],
      dayEmptyIcon: g[400],
      dayEmptyTitle: g[200],
      dayEmptyHint: g[400],
      mutedButtonBackground: g[800],
      mutedButtonText: g[300],
      weatherBannerText: tailwindHues.blue[200],
      weatherBannerIcon: tailwindHues.blue[300],
      weatherBannerIconBackground: g[800],

      statusPast: { background: g[700], text: g[300] },
      statusUpcoming: { background: withAlpha(palette.accent[900], 0.3), text: palette.accent[300] },
      statusOngoing: { background: withAlpha(tailwindHues.emerald[900], 0.3), text: tailwindHues.emerald[300] },
      motives: motiveColors(true),
    },
  };
}

export function getScheduleTheme(palette: BrandPalette): ScheduleTheme {
  return palette.dark ? buildScheduleDark(palette) : buildScheduleLight(palette);
}
