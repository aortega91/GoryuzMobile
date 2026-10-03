import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useScheduleTheme from '@hooks/useScheduleTheme';
import commonColors from '@theme/commonColors';
import {
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  CalendarRangeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  CrownIcon,
  LuggageIcon,
  MapPinIcon,
  PlusIcon,
} from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import { logError } from '@utilities/crashlytics';

import SubmodulesCoachMark, { SubmoduleHintItem } from '@components/SubmodulesCoachMark';
import {
  loadEvents,
  loadTrips,
  loadOutfits,
  addEvent,
  removeEvent,
  moveEvent,
  saveTrip,
  editTrip,
  removeTrip,
} from '../scheduleSlice';
import { CalendarEvent, DayWeather, Occasion, Trip, toDayWeather } from '../types';
import { getMotive, getPlanIcon } from '../motives';
import {
  addDays,
  capitalize,
  fromDateKey,
  getWeekDays,
  localeFor,
  toDateKey,
} from '../dates';
import { fetchWeatherForecast } from '../api/weatherApi';
import WeatherBadge, { WeatherIcon, WeatherTemps } from '../components/WeatherBadge';
import EventModal from '../components/EventModal';
import PlanModal, { MAX_PER_DAY } from '../components/PlanModal';
import OutfitPickerSheet from '../components/OutfitPickerSheet';
import AddOutfitChoiceSheet from '../components/AddOutfitChoiceSheet';
import OutfitPreview from '../components/OutfitPreview';
import DatePickerModal from '../components/DatePickerModal';

// ─── Types / constants ────────────────────────────────────────────────────────

/** Agenda submodules, switched from the bottom bar (zena's `AgendaTab`). */
type AgendaTab = 'week' | 'day' | 'plans';

type ForecastMap = Record<string, DayWeather>;

interface ResolvedWeather extends DayWeather {
  /** The destination's weather rather than the user's location */
  away: boolean;
}

const BOTTOM_TAB_HEIGHT = 56;
/** Screen gutter (zena's main `p-4`) and the day card's own `p-4`. */
const SCREEN_PADDING = 16;
const CARD_PADDING = 16;
/** zena's week "+" tile: aspect 3:4 capped at `max-h-16`. */
const WEEK_ADD_MAX_HEIGHT = 64;
/** Open-Meteo gives 16 days; past that the calendar simply paints no weather. */
const FORECAST_DAYS = 16;

const OCCASION_KEYS: Record<Occasion, string> = {
  work: 'schedule.occasionWork',
  casual: 'schedule.occasionCasual',
  date: 'schedule.occasionDate',
  party: 'schedule.occasionParty',
  sport: 'schedule.occasionSport',
  travel: 'schedule.occasionTravel',
  home: 'schedule.occasionHome',
};

function toForecastMap(days: DayWeather[]): ForecastMap {
  const map: ForecastMap = {};
  days.forEach(d => { map[d.date] = d; });
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  /** Opens the stylist chat (on Styles) with this text pre-filled — zena's "Sugerencia IA". */
  onAskStylist: (draft: string) => void;
  /** Opens Subscription — the way out of the non-VIP lock. */
  onViewPlans: () => void;
}

function Schedule({ onAskStylist, onViewPlans }: Props) {
  const { t, i18n } = useTranslation();
  const locale = localeFor(i18n.language);
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const events = useSelector((state: RootState) => state.schedule.events);
  const trips = useSelector((state: RootState) => state.schedule.trips);
  const outfits = useSelector((state: RootState) => state.schedule.outfits);
  const eventsStatus = useSelector((state: RootState) => state.schedule.eventsStatus);
  const tripsStatus = useSelector((state: RootState) => state.schedule.tripsStatus);
  const latitude = useSelector((state: RootState) => state.location.latitude);
  const longitude = useSelector((state: RootState) => state.location.longitude);
  // zena: the Agenda is a Cenit (VIP) feature. Only lock once the plan is known,
  // so VIPs never see the lock flash while the profile loads.
  const subscriptionPlan = useSelector((state: RootState) => state.profile.data?.plan);
  const isLocked = subscriptionPlan !== undefined && subscriptionPlan !== 'vip';

  const { width: windowWidth } = useWindowDimensions();

  const bottomBarTotalHeight = BOTTOM_TAB_HEIGHT + insets.bottom;
  // Week column = (grid width - 2px border) / 7; its body has `p-1` (4px) sides.
  const weekColumnInner = (windowWidth - SCREEN_PADDING * 2 - 2) / 7 - 8;
  const weekAddTileHeight = Math.min(WEEK_ADD_MAX_HEIGHT, (weekColumnInner * 4) / 3);
  // Day grid: `grid-cols-2 gap-3` inside the bordered `p-4` card.
  const dayTileWidth = (windowWidth - SCREEN_PADDING * 2 - 2 - CARD_PADDING * 2 - 12) / 2;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<AgendaTab>('week');
  const [localForecast, setLocalForecast] = useState<ForecastMap>({});
  const [destinationForecasts, setDestinationForecasts] = useState<Record<string, ForecastMap>>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  // Only the id: the plan is derived from the store on every render, otherwise
  // the modal would keep showing the stale copy after saving an edit.
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [pickingForDate, setPickingForDate] = useState<string | null>(null);
  // Day whose "add outfit" choice (AI suggestion vs saved outfit) is showing.
  const [choosingForDate, setChoosingForDate] = useState<string | null>(null);
  const [changingOutfitForEvent, setChangingOutfitForEvent] =
    useState<CalendarEvent | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const todayKey = toDateKey(new Date());

  // ─── Load data ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (eventsStatus === 'idle') { dispatch(loadEvents()); }
    dispatch(loadTrips());
    dispatch(loadOutfits());
  }, [dispatch, eventsStatus]);

  const loadLocalWeather = useCallback(async () => {
    if (latitude == null || longitude == null) { return; }
    try {
      const forecast = await fetchWeatherForecast(latitude, longitude, FORECAST_DAYS);
      setLocalForecast(toForecastMap(forecast.map(toDayWeather)));
    } catch (err) {
      logError(err, 'Schedule.fetchLocalWeather');
    }
  }, [latitude, longitude]);

  useEffect(() => {
    loadLocalWeather();
  }, [loadLocalWeather]);

  // Destinations of the plans that touch the forecast window, deduplicated by
  // coordinate. Their weather is fetched live instead of trusting the copy
  // stored when the plan was created, which may be empty or stale (zena does
  // the same with `useForecastsByPoint`).
  const forecastEndKey = toDateKey(addDays(new Date(), FORECAST_DAYS - 1));
  const destinationPointsKey = useMemo(() => {
    const keys = new Set<string>();
    trips.forEach(plan => {
      const inWindow = plan.endDate >= todayKey && plan.startDate <= forecastEndKey;
      if (inWindow && plan.destination && plan.lat != null && plan.lng != null) {
        keys.add(`${plan.lat},${plan.lng}`);
      }
    });
    return Array.from(keys).sort().join('|');
  }, [trips, todayKey, forecastEndKey]);

  const loadDestinationWeather = useCallback(async () => {
    if (!destinationPointsKey) {
      setDestinationForecasts({});
      return;
    }
    const points = destinationPointsKey.split('|');
    const results = await Promise.all(
      points.map(async key => {
        const [lat, lng] = key.split(',').map(Number);
        try {
          const forecast = await fetchWeatherForecast(lat, lng, FORECAST_DAYS);
          return [key, toForecastMap(forecast.map(toDayWeather))] as const;
        } catch (err) {
          logError(err, 'Schedule.fetchDestinationWeather');
          return [key, {}] as const;
        }
      }),
    );
    setDestinationForecasts(Object.fromEntries(results));
  }, [destinationPointsKey]);

  useEffect(() => {
    loadDestinationWeather();
  }, [loadDestinationWeather]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(loadEvents()),
        dispatch(loadTrips()),
        dispatch(loadOutfits()),
        loadLocalWeather(),
        loadDestinationWeather(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, loadLocalWeather, loadDestinationWeather]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(e => {
      if (!map[e.date]) { map[e.date] = []; }
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  /** Plans (a trip or any other motive) occupying that day: up to 3. */
  const plansForDate = useCallback(
    (dateKey: string): Trip[] =>
      trips
        .filter(plan => dateKey >= plan.startDate && dateKey <= plan.endDate)
        .sort((a, b) => (a.startTime || '99:99').localeCompare(b.startTime || '99:99'))
        .slice(0, MAX_PER_DAY),
    [trips],
  );

  /**
   * The day's weather: the destination's when the day falls inside a plan
   * with a destination, the user's location's otherwise. A travel day with no
   * forecast available paints nothing — home weather would be another city's.
   */
  const weatherForDate = (dateKey: string): ResolvedWeather | null => {
    if (dateKey < todayKey) { return null; }
    const planAway = plansForDate(dateKey).find(plan => plan.destination);
    if (planAway) {
      const key =
        planAway.lat != null && planAway.lng != null ? `${planAway.lat},${planAway.lng}` : null;
      const live = key ? destinationForecasts[key]?.[dateKey] : undefined;
      const stored = planAway.dailyWeather?.find(d => d.date === dateKey);
      const day = live ?? stored;
      return day ? { ...day, away: true } : null;
    }
    const local = localForecast[dateKey];
    return local ? { ...local, away: false } : null;
  };

  const selectedPlan = selectedPlanId ? trips.find(p => p.id === selectedPlanId) : undefined;

  const eventsInPlan = useMemo(() => {
    if (!selectedPlan) { return []; }
    return events.filter(
      e => e.date >= selectedPlan.startDate && e.date <= selectedPlan.endDate,
    );
  }, [events, selectedPlan]);

  const sortedPlans = useMemo(
    () => [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate)),
    [trips],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const navigateDate = (offset: number) => {
    setCurrentDate(prev => addDays(prev, activeTab === 'week' ? offset * 7 : offset));
  };

  const handleSelectDay = (date: Date) => {
    setCurrentDate(date);
    setActiveTab('day');
  };

  const weatherSnapshotFor = (dateKey: string) => {
    const weather = weatherForDate(dateKey);
    return weather ? `${weather.max}°/${weather.min}°` : undefined;
  };

  const handleAddOutfit = (dateKey: string) => {
    if ((eventsByDate[dateKey] ?? []).length >= MAX_PER_DAY) { return; }
    setChoosingForDate(dateKey);
  };

  const handleChooseSaved = () => {
    setPickingForDate(choosingForDate);
    setChoosingForDate(null);
  };

  // zena requestOutfitForDate: the stylist chat opens with the day already asked about.
  const handleChooseAi = () => {
    if (!choosingForDate) return;
    const day = fromDateKey(choosingForDate).toLocaleDateString(i18n.language, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    setChoosingForDate(null);
    onAskStylist(t('schedule.askStylistDraft', { date: day }));
  };

  const handleOutfitSelected = (outfit: { id: string }) => {
    if (pickingForDate) {
      const dateKey = pickingForDate;
      dispatch(addEvent({
        date: dateKey,
        outfitId: outfit.id,
        weatherSnapshot: weatherSnapshotFor(dateKey),
      }));
      setPickingForDate(null);
    } else if (changingOutfitForEvent) {
      dispatch(removeEvent(changingOutfitForEvent.id));
      dispatch(addEvent({ date: changingOutfitForEvent.date, outfitId: outfit.id }));
      setChangingOutfitForEvent(null);
      setSelectedEvent(null);
    }
  };

  const startChangingOutfit = (event: CalendarEvent) => {
    setChangingOutfitForEvent(event);
    setSelectedEvent(null);
  };

  const handleRemoveEvent = (eventId: string) => {
    dispatch(removeEvent(eventId));
    setSelectedEvent(null);
  };

  const handleMoveEvent = (eventId: string, newDate: string) => {
    dispatch(moveEvent({ eventId, newDate }));
    setSelectedEvent(null);
  };

  const handleOpenPlan = (plan: Trip) => {
    setSelectedPlanId(plan.id);
    setIsPlanModalOpen(true);
  };

  const handleNewPlan = () => {
    setSelectedPlanId(null);
    setIsPlanModalOpen(true);
  };

  const handleClosePlan = () => {
    setIsPlanModalOpen(false);
    setSelectedPlanId(null);
  };

  const handleCreatePlan = async (plan: Trip) => {
    await dispatch(saveTrip(plan)).unwrap();
  };

  const handleUpdatePlan = async (plan: Trip) => {
    await dispatch(editTrip(plan)).unwrap();
  };

  const handleDeletePlan = (planId: string) => {
    dispatch(removeTrip(planId));
  };

  /** The plan sheet closes so the outfit picker can take the screen. */
  const handlePlanAddOutfit = (dateKey: string) => {
    handleClosePlan();
    handleAddOutfit(dateKey);
  };

  // ─── Pieces ───────────────────────────────────────────────────────────────

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={s.headerTitle} />
  );

  const getPlanStatus = (plan: Trip) => {
    if (todayKey > plan.endDate) { return { label: t('schedule.planPast'), colors: s.statusPast }; }
    if (todayKey < plan.startDate) {
      return { label: t('schedule.planUpcoming'), colors: s.statusUpcoming };
    }
    return { label: t('schedule.planOngoing'), colors: s.statusOngoing };
  };

  const formatPlanRange = (plan: Trip) => {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    const start = fromDateKey(plan.startDate).toLocaleDateString(locale, opts);
    if (plan.startDate === plan.endDate) { return start; }
    return `${start} – ${fromDateKey(plan.endDate).toLocaleDateString(locale, opts)}`;
  };

  const planChipLabel = (plan: Trip) =>
    `${plan.startTime ? `${plan.startTime} · ` : ''}${plan.name}`;

  // ─── Submodule: week ──────────────────────────────────────────────────────
  // zena renderWeekTab at phone width: header (3-letter day, 28px number,
  // weather icon + 8px max/min), icon-only plan chips, 3:4 look tiles without
  // names, then the dashed "+" tile (max 64px tall) until the day is full.

  const renderWeekColumn = (date: Date, index: number) => {
    const dateKey = toDateKey(date);
    const dayEvents = eventsByDate[dateKey] ?? [];
    const dayPlans = plansForDate(dateKey);
    const weather = weatherForDate(dateKey);
    const isToday = dateKey === todayKey;
    const isPast = dateKey < todayKey;
    const isMaxed = dayEvents.length >= MAX_PER_DAY;
    // The column's tint comes from the day's first plan.
    const tint = dayPlans.length ? s.motives[getMotive(dayPlans[0].motive).id].dayTint : undefined;

    let dayNumberColor = s.columnDayNumber;
    if (isToday) { dayNumberColor = s.columnTodayText; } else if (isPast) { dayNumberColor = s.dayPastText; }

    return (
      <View
        key={dateKey}
        style={[
          styles.weekColumn,
          index > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: s.gridDivider },
          tint ? { backgroundColor: tint } : null,
        ]}
      >
        {/* Day header */}
        <Touchable
          onPress={() => handleSelectDay(date)}
          style={[styles.weekColumnHeader, { borderBottomColor: s.gridDivider }]}
        >
          <Text
            style={[styles.weekDayName, { color: isToday ? s.linkText : s.columnDayName }]}
            numberOfLines={1}
          >
            {date.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '').slice(0, 3)}
          </Text>
          <View
            style={[
              styles.weekDayCircle,
              isToday && { backgroundColor: s.columnTodayBackground },
            ]}
          >
            <Text style={[styles.weekDayNumber, { color: dayNumberColor }]}>{date.getDate()}</Text>
          </View>
          <View style={styles.weekWeather}>
            {weather && (
              <>
                <WeatherIcon type={weather.type} size={12} />
                <WeatherTemps max={weather.max} min={weather.min} away={weather.away} />
              </>
            )}
          </View>
        </Touchable>

        {/* Plan chips — icon only on mobile (zena hides the label below md) */}
        {dayPlans.length > 0 && (
          <View style={styles.weekPlans}>
            {dayPlans.map(plan => {
              const colors = s.motives[getMotive(plan.motive).id];
              const Icon = getPlanIcon(plan.motive, !!plan.destination);
              return (
                <Touchable
                  key={plan.id}
                  onPress={() => handleOpenPlan(plan)}
                  borderRadius={8}
                  accessibilityLabel={planChipLabel(plan)}
                  style={[styles.weekPlanChip, { backgroundColor: colors.chipBackground }]}
                >
                  <Icon size={10} color={colors.chipText} />
                </Touchable>
              );
            })}
          </View>
        )}

        {/* Day body: looks first, then the "+" tile */}
        <View style={styles.weekBody}>
          {dayEvents.map(event => (
            <Touchable
              key={event.id}
              onPress={() => setSelectedEvent(event)}
              borderRadius={8}
              accessibilityLabel={event.outfit?.name ?? t('schedule.unknownOutfit')}
              style={[
                styles.weekOutfitTile,
                { backgroundColor: s.dayTileBackground, borderColor: s.dayTileBorder },
              ]}
            >
              <OutfitPreview outfit={event.outfit} style={styles.tileImage} placeholderSize={14} />
            </Touchable>
          ))}
          {!isMaxed && (
            <Touchable
              onPress={() => handleAddOutfit(dateKey)}
              borderRadius={8}
              accessibilityLabel={t('schedule.addOutfit')}
              style={[
                styles.weekAddTile,
                {
                  height: weekAddTileHeight,
                  borderColor: isPast ? s.weekAddPastBorder : s.weekAddBorder,
                },
              ]}
            >
              <PlusIcon size={16} color={isPast ? s.weekAddPastIcon : s.weekAddIcon} />
            </Touchable>
          )}
        </View>
      </View>
    );
  };

  const renderWeekView = () => (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.tabContent, { paddingBottom: bottomBarTotalHeight + 16 }]}
      refreshControl={refreshControl}
    >
      <View
        style={[styles.weekGrid, { backgroundColor: s.gridBackground, borderColor: s.columnBorder }]}
      >
        {weekDays.map(renderWeekColumn)}
      </View>
    </ScrollView>
  );

  // ─── Submodule: day ───────────────────────────────────────────────────────
  // zena renderDayTab at phone width: a (tinted) card with the big day number,
  // weekday + month, plan chips, then weather box and "Add outfit" on one row,
  // and a 2-column grid of 3:4 look tiles (name + occasion) — tapping one opens
  // the event sheet, which holds move / change / remove.

  const renderDayOutfitTile = (event: CalendarEvent) => (
    <Touchable
      key={event.id}
      onPress={() => setSelectedEvent(event)}
      borderRadius={12}
      style={[
        styles.dayTile,
        {
          width: dayTileWidth,
          backgroundColor: s.dayTileBackground,
          borderColor: s.dayTileBorder,
        },
      ]}
    >
      <OutfitPreview outfit={event.outfit} style={styles.tileImage} placeholderSize={28} />
      <View style={styles.dayTileInfo}>
        <Text style={[styles.dayTileName, { color: s.dayTileName }]} numberOfLines={1}>
          {event.outfit?.name ?? t('schedule.unknownOutfit')}
        </Text>
        <Text style={[styles.dayTileMeta, { color: s.dayTileMeta }]} numberOfLines={1}>
          {t(event.occasion ? OCCASION_KEYS[event.occasion] : 'schedule.noOccasion')}
        </Text>
      </View>
    </Touchable>
  );

  const renderDayView = () => {
    const dateKey = toDateKey(currentDate);
    const dayEvents = eventsByDate[dateKey] ?? [];
    const dayPlans = plansForDate(dateKey);
    const weather = weatherForDate(dateKey);
    const isMaxed = dayEvents.length >= MAX_PER_DAY;
    const isToday = dateKey === todayKey;
    const travelPlan = dayPlans.find(p => p.destination) ?? dayPlans[0];
    const tint = dayPlans.length ? s.motives[getMotive(dayPlans[0].motive).id].dayTint : undefined;

    return (
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.tabContent, { paddingBottom: bottomBarTotalHeight + 16 }]}
        refreshControl={refreshControl}
      >
        <View
          style={[
            styles.dayCard,
            { backgroundColor: tint ?? s.gridBackground, borderColor: s.columnBorder },
          ]}
        >
          <View style={styles.dayHeader}>
            <View>
              <View style={styles.dayTitleRow}>
                <Text style={[styles.dayNumber, { color: isToday ? s.linkText : s.headerTitle }]}>
                  {currentDate.getDate()}
                </Text>
                <View style={styles.dayTitleTexts}>
                  <Text style={[styles.dayWeekday, { color: s.headerTitle }]} numberOfLines={1}>
                    {capitalize(currentDate.toLocaleDateString(locale, { weekday: 'long' }))}
                  </Text>
                  <Text style={[styles.dayMonth, { color: s.headerSubtitle }]} numberOfLines={1}>
                    {capitalize(currentDate.toLocaleDateString(locale, { month: 'long' }))}
                  </Text>
                </View>
              </View>
              {dayPlans.length > 0 && (
                <View style={styles.dayPlanChips}>
                  {dayPlans.map(plan => {
                    const colors = s.motives[getMotive(plan.motive).id];
                    const Icon = getPlanIcon(plan.motive, !!plan.destination);
                    return (
                      <Touchable
                        key={plan.id}
                        onPress={() => handleOpenPlan(plan)}
                        borderRadius={20}
                        style={[styles.dayPlanChip, { backgroundColor: colors.chipBackground }]}
                      >
                        <Icon size={12} color={colors.chipText} />
                        <Text
                          style={[styles.dayPlanChipText, { color: colors.chipText }]}
                          numberOfLines={1}
                        >
                          {planChipLabel(plan)}
                        </Text>
                      </Touchable>
                    );
                  })}
                </View>
              )}
            </View>

            {(weather || !isMaxed) && (
              <View style={styles.dayHeaderActions}>
                {weather && (
                  <View
                    style={[
                      styles.weatherBox,
                      { backgroundColor: s.weatherBoxBackground, borderColor: s.weatherBoxBorder },
                    ]}
                  >
                    <WeatherBadge type={weather.type} max={weather.max} min={weather.min} />
                    {weather.away && !!travelPlan?.destination && (
                      <Text
                        style={[styles.weatherBoxPlace, { color: s.weatherAwayText }]}
                        numberOfLines={1}
                      >
                        {travelPlan.destination}
                      </Text>
                    )}
                  </View>
                )}
                {!isMaxed && (
                  <Touchable
                    onPress={() => handleAddOutfit(dateKey)}
                    borderRadius={12}
                    style={[styles.addOutfitBtn, { backgroundColor: s.buttonPrimary }]}
                  >
                    <PlusIcon size={18} color={s.buttonPrimaryText} />
                    <Text style={[styles.addOutfitText, { color: s.buttonPrimaryText }]}>
                      {t('schedule.addOutfit')}
                    </Text>
                  </Touchable>
                )}
              </View>
            )}
          </View>

          {dayEvents.length === 0 ? (
            <View
              style={[
                styles.dayEmpty,
                { borderColor: s.dayEmptyBorder, backgroundColor: s.dayEmptyBackground },
              ]}
            >
              <View style={[styles.dayEmptyIcon, { backgroundColor: s.dayEmptyIconBackground }]}>
                <CalendarIcon size={24} color={s.dayEmptyIcon} />
              </View>
              <Text style={[styles.dayEmptyTitle, { color: s.dayEmptyTitle }]}>
                {t('schedule.dayEmptyTitle')}
              </Text>
              <Text style={[styles.dayEmptyHint, { color: s.dayEmptyHint }]}>
                {t('schedule.dayEmptyHint')}
              </Text>
            </View>
          ) : (
            <View style={styles.dayGrid}>{dayEvents.map(renderDayOutfitTile)}</View>
          )}
        </View>
      </ScrollView>
    );
  };

  // ─── Submodule: plans ─────────────────────────────────────────────────────

  const renderPlanCard = (plan: Trip) => {
    const motive = getMotive(plan.motive);
    const colors = s.motives[motive.id];
    const status = getPlanStatus(plan);
    const Icon = getPlanIcon(plan.motive, !!plan.destination);

    return (
      <Touchable
        key={plan.id}
        onPress={() => handleOpenPlan(plan)}
        borderRadius={16}
        style={[styles.planCard, { backgroundColor: s.tripCardBackground, borderColor: s.tripCardBorder }]}
      >
        <View style={styles.planCardTop}>
          <View style={[styles.planCardIcon, { backgroundColor: colors.chipBackground }]}>
            <Icon size={18} color={colors.chipText} />
          </View>
          <View style={styles.planCardBadges}>
            <View style={[styles.planBadge, { backgroundColor: colors.chipBackground }]}>
              <Text style={[styles.planBadgeText, { color: colors.chipText }]}>
                {t(motive.labelKey)}
              </Text>
            </View>
            <View style={[styles.planBadge, { backgroundColor: status.colors.background }]}>
              <Text style={[styles.planBadgeText, { color: status.colors.text }]}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.planCardName, { color: s.eventCardName }]} numberOfLines={1}>
          {plan.name}
        </Text>
        {!!plan.destination && (
          <View style={styles.planMetaRow}>
            <MapPinIcon size={12} color={s.headerSubtitle} />
            <Text style={[styles.planMeta, { color: s.headerSubtitle }]} numberOfLines={1}>
              {plan.destination}
            </Text>
          </View>
        )}
        <View style={styles.planMetaRow}>
          <CalendarIcon size={12} color={s.emptyText} />
          <Text style={[styles.planMeta, { color: s.emptyText }]}>{formatPlanRange(plan)}</Text>
          {!!plan.startTime && (
            <>
              <View style={styles.planClock}>
                <ClockIcon size={12} color={s.emptyText} />
              </View>
              <Text style={[styles.planMeta, { color: s.emptyText }]}>{plan.startTime}</Text>
            </>
          )}
        </View>

        <View style={[styles.planCardFooter, { borderTopColor: s.tripCardBorder }]}>
          <Text style={[styles.planCardLink, { color: s.linkText }]}>
            {t('schedule.viewPlanDetail')}
          </Text>
          <ChevronRightIcon size={16} color={s.linkText} />
        </View>
      </Touchable>
    );
  };

  const renderPlansView = () => (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.tabContent, styles.plansList, { paddingBottom: bottomBarTotalHeight + 16 }]}
      refreshControl={refreshControl}
    >
      {sortedPlans.length === 0 ? (
        <View
          style={[styles.plansEmpty, { backgroundColor: s.tripCardBackground, borderColor: s.tripCardBorder }]}
        >
          <View style={[styles.plansEmptyIcon, { backgroundColor: s.headerSecondaryBackground }]}>
            <LuggageIcon size={28} color={s.linkText} />
          </View>
          <Text style={[styles.plansEmptyTitle, { color: s.eventCardName }]}>
            {t('schedule.noPlans')}
          </Text>
          <Text style={[styles.plansEmptyHint, { color: s.headerSubtitle }]}>
            {t('schedule.noPlansHint')}
          </Text>
          <Touchable
            onPress={handleNewPlan}
            borderRadius={12}
            style={[styles.plansEmptyBtn, { backgroundColor: s.buttonPrimary }]}
          >
            <PlusIcon size={16} color={s.buttonPrimaryText} />
            <Text style={[styles.plansEmptyBtnText, { color: s.buttonPrimaryText }]}>
              {t('schedule.newPlan')}
            </Text>
          </Touchable>
        </View>
      ) : (
        <>
          {sortedPlans.map(renderPlanCard)}
          <Touchable
            onPress={handleNewPlan}
            borderRadius={16}
            style={[styles.newPlanCard, { borderColor: s.newPlanBorder }]}
          >
            <PlusIcon size={24} color={s.newPlanText} />
            <Text style={[styles.newPlanCardText, { color: s.newPlanText }]}>
              {t('schedule.newPlan')}
            </Text>
          </Touchable>
        </>
      )}
    </ScrollView>
  );

  // ─── Layout ───────────────────────────────────────────────────────────────

  const dateLabel = capitalize(
    activeTab === 'day'
      ? currentDate.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
      : currentDate.toLocaleDateString(locale, { month: 'long', year: 'numeric' }),
  );

  const scheduleTabs: SubmoduleHintItem[] = [
    { id: 'week', label: t('schedule.tabWeek'), hint: t('schedule.hintWeek'), Icon: CalendarRangeIcon },
    { id: 'day', label: t('schedule.tabDay'), hint: t('schedule.hintDay'), Icon: CalendarDaysIcon },
    { id: 'plans', label: t('schedule.tabPlans'), hint: t('schedule.hintPlans'), Icon: LuggageIcon },
  ];

  const isLoading =
    (activeTab !== 'plans' && eventsStatus === 'loading' && events.length === 0) ||
    (activeTab === 'plans' && tripsStatus === 'loading' && trips.length === 0);

  let content: React.ReactNode;
  if (isLoading) {
    content = (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={s.buttonPrimary} />
      </View>
    );
  } else if (activeTab === 'week') {
    content = renderWeekView();
  } else if (activeTab === 'day') {
    content = renderDayView();
  } else {
    content = renderPlansView();
  }

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>
      {/* Everything but the lock card is dimmed and inert for non-VIP plans */}
      <View style={[styles.root, isLocked && styles.locked]} pointerEvents={isLocked ? 'none' : 'auto'}>
        {/* Header — zena: title + one-line description, round icon actions */}
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={[styles.title, { color: s.headerTitle }]} numberOfLines={1}>
              {t('schedule.title')}
            </Text>
            <Text style={[styles.subtitle, { color: s.headerSubtitle }]} numberOfLines={1}>
              {t('schedule.subtitle')}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <Touchable
              onPress={handleNewPlan}
              borderRadius={20}
              accessibilityLabel={t('schedule.createPlanAria')}
              style={[styles.headerIconBtn, { backgroundColor: s.buttonPrimary }]}
            >
              <PlusIcon size={20} color={s.buttonPrimaryText} />
            </Touchable>
          </View>
        </View>

        {/* Date navigation — only the calendar submodules */}
        {activeTab !== 'plans' && (
          <View style={[styles.nav, { backgroundColor: s.navBackground, borderColor: s.navBorder }]}>
            <Touchable
              onPress={() => navigateDate(-1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              borderRadius={12}
              style={styles.navBtn}
              accessibilityLabel={t('schedule.previousPeriod')}
            >
              <ChevronLeftIcon size={20} color={s.navText} />
            </Touchable>
            <Touchable
              onPress={() => setDatePickerVisible(true)}
              borderRadius={10}
              style={styles.navLabelBtn}
              accessibilityLabel={t('schedule.changeDate')}
            >
              <Text style={[styles.navLabel, { color: s.navText }]} numberOfLines={1}>
                {dateLabel}
              </Text>
            </Touchable>
            <Touchable
              onPress={() => navigateDate(1)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              borderRadius={12}
              style={styles.navBtn}
              accessibilityLabel={t('schedule.nextPeriod')}
            >
              <ChevronRightIcon size={20} color={s.navText} />
            </Touchable>
          </View>
        )}

        {content}
      </View>

      {/* Bottom submodules bar (week / day / plans) */}
      <View
        pointerEvents={isLocked ? 'none' : 'auto'}
        style={[
          styles.bottomBar,
          isLocked && styles.locked,
          {
            height: bottomBarTotalHeight,
            paddingBottom: insets.bottom,
            backgroundColor: s.bottomBarBackground,
            borderTopColor: s.bottomBarBorder,
          },
        ]}
      >
        {scheduleTabs.map(tab => {
          const isActive = activeTab === tab.id;
          const color = isActive ? s.bottomBarActive : s.bottomBarInactive;
          const { Icon } = tab;
          return (
            <Touchable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as AgendaTab)}
              borderRadius={8}
              style={styles.bottomTabItem}
            >
              <Icon size={20} color={color} />
              <Text style={[styles.bottomTabLabel, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      <SubmodulesCoachMark
        viewId="agenda"
        enabled={!isLocked}
        barHeight={bottomBarTotalHeight}
        items={scheduleTabs}
      />

      {isLocked && (
        <View style={styles.lockOverlay} pointerEvents="box-none">
          <View style={[styles.lockCard, { backgroundColor: s.lockCardBackground, borderColor: s.lockCardBorder }]}>
            <CrownIcon size={48} color={s.lockIcon} />
            <Text style={[styles.lockTitle, { color: s.lockTitle }]}>{t('schedule.lockedTitle')}</Text>
            <Text style={[styles.lockDesc, { color: s.lockDesc }]}>
              {t('schedule.lockedDesc', { plan: 'Cenit' })}
            </Text>
            <Touchable
              onPress={onViewPlans}
              borderRadius={12}
              style={[styles.lockButton, { backgroundColor: s.lockButtonBackground }]}
            >
              <Text style={[styles.lockButtonText, { color: s.lockButtonText }]}>{t('schedule.lockedCta')}</Text>
              <ArrowRightIcon size={18} color={s.lockButtonText} />
            </Touchable>
          </View>
        </View>
      )}

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRemove={handleRemoveEvent}
          onMove={handleMoveEvent}
          onChangeOutfit={() => startChangingOutfit(selectedEvent)}
        />
      )}

      {isPlanModalOpen && (
        <PlanModal
          key={selectedPlan?.id ?? 'new-plan'}
          existingPlan={selectedPlan}
          plans={trips}
          eventsInPlan={eventsInPlan}
          onClose={handleClosePlan}
          onCreate={handleCreatePlan}
          onUpdate={handleUpdatePlan}
          onDelete={handleDeletePlan}
          onAddOutfit={handlePlanAddOutfit}
        />
      )}

      {choosingForDate !== null && (
        <AddOutfitChoiceSheet
          onChooseAi={handleChooseAi}
          onChooseSaved={handleChooseSaved}
          onClose={() => setChoosingForDate(null)}
        />
      )}

      {(pickingForDate !== null || changingOutfitForEvent !== null) && (
        <OutfitPickerSheet
          outfits={outfits}
          onSelect={handleOutfitSelected}
          onClose={() => {
            setPickingForDate(null);
            setChangingOutfitForEvent(null);
          }}
        />
      )}

      <DatePickerModal
        visible={datePickerVisible}
        value={toDateKey(currentDate)}
        onChange={key => setCurrentDate(fromDateKey(key))}
        onClose={() => setDatePickerVisible(false)}
        title={t('schedule.changeDate')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Lets the content ScrollView own a scroll viewport — required for
  // pull-to-refresh to engage even when the content is shorter than the screen.
  scroll: { flex: 1 },
  tabContent: { paddingHorizontal: SCREEN_PADDING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tileImage: { width: '100%', aspectRatio: 3 / 4 },
  // Header — `flex items-start justify-between gap-3`, then `gap-4` below
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTexts: { flex: 1, minWidth: 0 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Date navigation — `p-2 rounded-2xl border`, arrows `p-2`, label text-base
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: SCREEN_PADDING,
    marginBottom: 16,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  navBtn: { padding: 8, borderRadius: 12 },
  navLabelBtn: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  navLabel: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  // Week grid
  weekGrid: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  weekColumn: { flex: 1, minHeight: 300 },
  weekColumnHeader: {
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 10,
    gap: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weekDayName: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.45,
  },
  weekDayCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayNumber: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  weekWeather: { height: 28, alignItems: 'center', justifyContent: 'flex-start' },
  weekPlans: { marginHorizontal: 4, marginTop: 6, gap: 4 },
  weekPlanChip: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 8,
  },
  weekBody: { flex: 1, padding: 4, gap: 6 },
  weekOutfitTile: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  weekAddTile: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Day view — `p-4 rounded-2xl border` card
  dayCard: { padding: CARD_PADDING, borderRadius: 16, borderWidth: 1 },
  dayHeader: { gap: 16, marginBottom: 24 },
  dayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  dayNumber: { fontSize: 36, lineHeight: 40, fontWeight: '800', letterSpacing: -0.9 },
  dayTitleTexts: { flexShrink: 1 },
  dayWeekday: { fontSize: 18, lineHeight: 20, fontWeight: '600' },
  dayMonth: { fontSize: 14, lineHeight: 20 },
  dayPlanChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayPlanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '100%',
  },
  dayPlanChipText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
    flexShrink: 1,
  },
  dayHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    flexShrink: 1,
  },
  weatherBoxPlace: { fontSize: 10, lineHeight: 15, fontWeight: '600', maxWidth: 120 },
  addOutfitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addOutfitText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  dayGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  dayTile: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  dayTileInfo: { padding: 8 },
  dayTileName: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  dayTileMeta: { fontSize: 10, lineHeight: 15 },
  dayEmpty: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  dayEmptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  dayEmptyTitle: { fontSize: 16, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
  dayEmptyHint: { fontSize: 14, lineHeight: 20, marginTop: 4, textAlign: 'center' },
  // Plans view — `grid-cols-1 gap-3` on mobile
  plansList: { gap: 12 },
  planCard: { borderRadius: 16, borderWidth: 1, padding: 16 },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planCardBadges: { flexDirection: 'row', gap: 6, flexShrink: 1 },
  planBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  planBadgeText: { fontSize: 10, lineHeight: 15, fontWeight: '700' },
  planCardName: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  planMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  planMeta: { fontSize: 12, lineHeight: 16, flexShrink: 1 },
  planClock: { marginLeft: 4 },
  planCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  planCardLink: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  newPlanCard: {
    minHeight: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  newPlanCardText: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  plansEmpty: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 64,
    paddingHorizontal: 24,
  },
  plansEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  plansEmptyTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', textAlign: 'center' },
  plansEmptyHint: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  plansEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  plansEmptyBtnText: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  // Bottom submodules bar — `px-2`, items `py-2.5 gap-0.5`, 20px icon, 10px label
  locked: { opacity: 0.4 },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 16,
  },
  lockCard: {
    width: '100%',
    maxWidth: 384,
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: commonColors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  lockTitle: { fontSize: 24, fontWeight: '700', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  lockDesc: { fontSize: 15, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
  lockButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  lockButtonText: { fontSize: 15, fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomTabItem: {
    flex: 1,
    height: BOTTOM_TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bottomTabLabel: { fontSize: 10, lineHeight: 15, fontWeight: '600' },
});

export default Schedule;
