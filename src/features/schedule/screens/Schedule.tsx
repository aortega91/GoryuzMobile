import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import useScheduleTheme from '@hooks/useScheduleTheme';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ColumnsIcon,
  ListIcon,
  PlaneIcon,
  ShirtIcon,
  PlusCircleIcon,
  Wand2Icon,
} from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import { logError } from '@utilities/crashlytics';

import FeatureWelcomeModal from '@components/FeatureWelcomeModal';
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
import { CalendarEvent, DailyWeather, Trip } from '../types';
import { fetchWeatherForecast } from '../api/weatherApi';
import WeatherBadge from '../components/WeatherBadge';
import EventModal from '../components/EventModal';
import TripModal from '../components/TripModal';
import OutfitPickerSheet from '../components/OutfitPickerSheet';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Week starts on Sunday — matches the zena web implementation.
function getWeekDays(date: Date): Date[] {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startOfWeek, i));
  }
  return days;
}

function weekRangeLabel(days: Date[]): string {
  const start = days[0];
  const end = days[days.length - 1];
  const startMonth = start.toLocaleDateString('es-ES', { month: 'short' });
  const endMonth = end.toLocaleDateString('es-ES', { month: 'short' });
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()} – ${end.getDate()} ${startMonth}`;
  }
  return `${start.getDate()} ${startMonth} – ${end.getDate()} ${endMonth}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = 'week' | 'day';

const MAX_EVENTS_PER_DAY = 3;

function Schedule() {
  const { t } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const events = useSelector((state: RootState) => state.schedule.events);
  const trips = useSelector((state: RootState) => state.schedule.trips);
  const outfits = useSelector((state: RootState) => state.schedule.outfits);
  const eventsStatus = useSelector((state: RootState) => state.schedule.eventsStatus);
  const latitude = useSelector((state: RootState) => state.location.latitude);
  const longitude = useSelector((state: RootState) => state.location.longitude);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [locationWeather, setLocationWeather] = useState<Record<string, DailyWeather>>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>(undefined);
  const [pickingForDate, setPickingForDate] = useState<string | null>(null);
  const [changingOutfitForEvent, setChangingOutfitForEvent] =
    useState<CalendarEvent | null>(null);

  const [refreshing, setRefreshing] = useState(false);

  // ─── Load data on mount ───────────────────────────────────────────────────

  useEffect(() => {
    if (eventsStatus === 'idle') { dispatch(loadEvents()); }
    dispatch(loadTrips());
    dispatch(loadOutfits());
  }, [dispatch, eventsStatus]);

  const loadWeather = useCallback(async () => {
    if (latitude == null || longitude == null) { return; }
    try {
      const forecast = await fetchWeatherForecast(latitude, longitude, 16);
      const map: Record<string, DailyWeather> = {};
      forecast.forEach(d => { map[d.date] = d; });
      setLocationWeather(map);
    } catch (err) {
      logError(err, 'Schedule.fetchWeather');
    }
  }, [latitude, longitude]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(loadEvents()),
        dispatch(loadTrips()),
        dispatch(loadOutfits()),
        loadWeather(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, loadWeather]);

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

  const tripForDate = useCallback(
    (dateStr: string): Trip | undefined =>
      trips.find(trip => dateStr >= trip.startDate && dateStr <= trip.endDate),
    [trips],
  );

  const eventsInTrip = useMemo(() => {
    if (!selectedTrip) { return []; }
    return events.filter(
      e => e.date >= selectedTrip.startDate && e.date <= selectedTrip.endDate,
    );
  }, [events, selectedTrip]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const navigateDate = (offset: number) => {
    setCurrentDate(prev => addDays(prev, viewMode === 'week' ? offset * 7 : offset));
  };

  const handleSelectDay = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleAddOutfit = (dateStr: string) => {
    setPickingForDate(dateStr);
  };

  // Auto-fill every empty day of the visible week, rotating through the
  // user's saved outfits. Local-only — no AI, no gem cost.
  const handleAutoAssign = () => {
    if (outfits.length === 0) { return; }
    let outfitIdx = 0;
    weekDays.forEach(date => {
      const dateStr = toDateStr(date);
      if ((eventsByDate[dateStr] ?? []).length > 0) { return; }
      const outfit = outfits[outfitIdx % outfits.length];
      outfitIdx += 1;
      const weather = locationWeather[dateStr];
      const weatherSnapshot = weather
        ? `${weather.tempMax}°/${weather.tempMin}°`
        : undefined;
      dispatch(addEvent({ date: dateStr, outfitId: outfit.id, weatherSnapshot }));
    });
  };

  const weekHasEmptyDay = useMemo(
    () => weekDays.some(date => (eventsByDate[toDateStr(date)] ?? []).length === 0),
    [weekDays, eventsByDate],
  );

  const handleOutfitSelected = (outfit: { id: string }) => {
    if (pickingForDate) {
      const dateStr = pickingForDate;
      const weather = locationWeather[dateStr];
      const weatherSnapshot = weather
        ? `${weather.tempMax}°/${weather.tempMin}°`
        : undefined;
      dispatch(addEvent({ date: dateStr, outfitId: outfit.id, weatherSnapshot }));
      setPickingForDate(null);
    } else if (changingOutfitForEvent) {
      dispatch(removeEvent(changingOutfitForEvent.id));
      dispatch(addEvent({ date: changingOutfitForEvent.date, outfitId: outfit.id }));
      setChangingOutfitForEvent(null);
      setSelectedEvent(null);
    }
  };

  const handleChangeOutfit = () => {
    if (selectedEvent) {
      setChangingOutfitForEvent(selectedEvent);
      setSelectedEvent(null);
    }
  };

  const handleRemoveEvent = (eventId: string) => {
    dispatch(removeEvent(eventId));
    setSelectedEvent(null);
  };

  const handleMoveEvent = (eventId: string, newDate: string) => {
    dispatch(moveEvent({ eventId, newDate }));
    setSelectedEvent(null);
  };

  const handleOpenTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsTripModalOpen(true);
  };

  const handleCreateTrip = () => {
    setSelectedTrip(undefined);
    setIsTripModalOpen(true);
  };

  const handleSaveTrip = (trip: Trip) => {
    if (selectedTrip) { dispatch(editTrip(trip)); }
    else { dispatch(saveTrip(trip)); }
  };

  const handleDeleteTrip = (tripId: string) => {
    dispatch(removeTrip(tripId));
    setIsTripModalOpen(false);
  };

  // ─── Renders ──────────────────────────────────────────────────────────────

  const today = toDateStr(new Date());

  const renderWeekDay = (date: Date) => {
    const dateStr = toDateStr(date);
    const dayEvents = eventsByDate[dateStr] ?? [];
    const isToday = dateStr === today;
    const isMaxed = dayEvents.length >= MAX_EVENTS_PER_DAY;
    const trip = tripForDate(dateStr);
    const dayWeather = locationWeather[dateStr];

    return (
      <View
        key={dateStr}
        style={[
          styles.weekDayCard,
          {
            backgroundColor: s.columnBackground,
            borderColor: isToday ? s.columnTodayBackground : s.columnBorder,
          },
          isToday && styles.weekDayCardToday,
        ]}
      >
        {/* Day header */}
        <View style={styles.weekDayHeader}>
          <View style={styles.weekDayHeaderLeft}>
            <Touchable
              onPress={() => handleSelectDay(date)}
              borderRadius={8}
              style={styles.weekDayDateTap}
            >
              <Text style={[styles.weekDayName, { color: s.columnDayName }]}>
                {date.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}
              </Text>
              <View
                style={[
                  styles.weekDateCircle,
                  isToday && { backgroundColor: s.columnTodayBackground },
                ]}
              >
                <Text
                  style={[
                    styles.weekDateText,
                    { color: isToday ? s.columnTodayText : s.columnDayNumber },
                  ]}
                >
                  {date.getDate()}
                </Text>
              </View>
            </Touchable>
            {trip != null && (
              <Touchable
                onPress={() => handleOpenTrip(trip)}
                borderRadius={20}
                style={[styles.weekTripPill, { backgroundColor: s.tripBadgeBackground }]}
              >
                <PlaneIcon size={10} color={s.tripBadgeText} />
                <Text
                  style={[styles.weekTripPillText, { color: s.tripBadgeText }]}
                  numberOfLines={1}
                >
                  {trip.name}
                </Text>
              </Touchable>
            )}
          </View>

          <View style={styles.weekDayHeaderRight}>
            {dayWeather && (
              <WeatherBadge
                weatherCode={dayWeather.weatherCode}
                tempMax={dayWeather.tempMax}
                tempMin={dayWeather.tempMin}
              />
            )}
            {!isMaxed && (
              <Touchable
                onPress={() => handleAddOutfit(dateStr)}
                hitSlop={6}
                borderRadius={16}
                style={[styles.weekAddBtn, { backgroundColor: s.buttonPrimary }]}
              >
                <PlusCircleIcon size={16} color={s.buttonPrimaryText} />
              </Touchable>
            )}
          </View>
        </View>

        {/* Outfits */}
        {dayEvents.length === 0 ? (
          <Touchable
            onPress={() => handleAddOutfit(dateStr)}
            borderRadius={12}
            style={[styles.weekEmptyRow, { borderColor: s.addButtonBorder }]}
          >
            <Text style={[styles.weekEmptyText, { color: s.emptyText }]}>
              {t('schedule.emptyDayShort')}
            </Text>
          </Touchable>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.weekOutfitsRow}
          >
            {dayEvents.map(event => {
              const outfitImg =
                event.outfit?.imageData ?? event.outfit?.items[0]?.imageData ?? null;
              return (
                <Touchable
                  key={event.id}
                  onPress={() => setSelectedEvent(event)}
                  borderRadius={12}
                  style={[
                    styles.weekOutfitCard,
                    { backgroundColor: s.eventCardBackground, borderColor: s.eventCardBorder },
                  ]}
                >
                  {outfitImg != null ? (
                    <AuthedImage
                      data={outfitImg}
                      style={styles.weekOutfitImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        styles.weekOutfitImage,
                        styles.weekOutfitPlaceholder,
                        { backgroundColor: s.emptyIcon },
                      ]}
                    >
                      <ShirtIcon size={24} color={s.emptyText} />
                    </View>
                  )}
                  <Text
                    style={[styles.weekOutfitName, { color: s.eventCardName }]}
                    numberOfLines={1}
                  >
                    {event.outfit?.name ?? t('schedule.unknownOutfit')}
                  </Text>
                </Touchable>
              );
            })}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderWeekView = () => (
    <ScrollView
      style={styles.scroll}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.weekContainer, { paddingBottom: insets.bottom + 16 }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={s.headerTitle}
        />
      }
    >
      {outfits.length > 0 && weekHasEmptyDay && (
        <Touchable
          onPress={handleAutoAssign}
          borderRadius={12}
          style={[styles.autoAssignBtn, { backgroundColor: s.buttonPrimary }]}
        >
          <Wand2Icon size={16} color={s.buttonPrimaryText} />
          <Text style={[styles.autoAssignText, { color: s.buttonPrimaryText }]}>
            {t('schedule.autoAssign')}
          </Text>
        </Touchable>
      )}
      {weekDays.map(renderWeekDay)}
    </ScrollView>
  );

  const renderDayView = () => {
    const dateStr = toDateStr(currentDate);
    const dayEvents = eventsByDate[dateStr] ?? [];
    const isMaxed = dayEvents.length >= MAX_EVENTS_PER_DAY;
    const dayWeather = locationWeather[dateStr];
    const trip = tripForDate(dateStr);

    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.dayViewContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={s.headerTitle}
          />
        }
      >
        <View style={styles.dayViewHeader}>
          <View>
            <Text style={[styles.dayViewDate, { color: s.headerTitle }]}>
              {currentDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
            {trip && (
              <Touchable
                onPress={() => handleOpenTrip(trip)}
                borderRadius={20}
                style={[styles.tripPill, { backgroundColor: s.tripBadgeBackground }]}
              >
                <PlaneIcon size={12} color={s.tripBadgeText} />
                <Text style={[styles.tripPillText, { color: s.tripBadgeText }]}>
                  {trip.name}
                </Text>
              </Touchable>
            )}
          </View>
          <View style={styles.dayViewRight}>
            {dayWeather && (
              <WeatherBadge
                weatherCode={dayWeather.weatherCode}
                tempMax={dayWeather.tempMax}
                tempMin={dayWeather.tempMin}
              />
            )}
            {!isMaxed && (
              <Touchable
                onPress={() => handleAddOutfit(dateStr)}
                borderRadius={10}
                style={[styles.addBtnDay, { backgroundColor: s.buttonPrimary }]}
              >
                <PlusCircleIcon size={16} color={s.buttonPrimaryText} />
                <Text style={[styles.addBtnDayText, { color: s.buttonPrimaryText }]}>
                  {t('schedule.addOutfit')}
                </Text>
              </Touchable>
            )}
          </View>
        </View>

        {dayEvents.length === 0 ? (
          <View style={styles.emptyDay}>
            <ShirtIcon size={48} color={s.emptyIcon} />
            <Text style={[styles.emptyText, { color: s.emptyText }]}>
              {t('schedule.emptyDay')}
            </Text>
          </View>
        ) : (
          dayEvents.map(event => (
            <Touchable
              key={event.id}
              onPress={() => setSelectedEvent(event)}
              borderRadius={16}
              style={[
                styles.eventCard,
                { backgroundColor: s.eventCardBackground, borderColor: s.eventCardBorder },
              ]}
            >
              <View style={styles.eventCardImageWrap}>
                {event.outfit?.imageData ? (
                  <AuthedImage
                    data={event.outfit.imageData}
                    style={styles.eventCardImage}
                    resizeMode="cover"
                  />
                ) : event.outfit?.items[0]?.imageData ? (
                  <AuthedImage
                    data={event.outfit.items[0].imageData!}
                    style={styles.eventCardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.eventCardImage,
                      styles.eventCardImagePlaceholder,
                      { backgroundColor: s.emptyIcon },
                    ]}
                  >
                    <ShirtIcon size={28} color={s.emptyText} />
                  </View>
                )}
              </View>
              <View style={styles.eventCardInfo}>
                <Text
                  style={[styles.eventCardName, { color: s.eventCardName }]}
                  numberOfLines={1}
                >
                  {event.outfit?.name ?? t('schedule.unknownOutfit')}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {event.outfit?.items.slice(0, 5).map(item => (
                    <View key={item.id} style={styles.itemMini}>
                      {item.imageData ? (
                        <AuthedImage
                          data={item.imageData}
                          style={styles.itemMiniImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.itemMiniImage,
                            { backgroundColor: s.emptyIcon },
                          ]}
                        />
                      )}
                    </View>
                  ))}
                </ScrollView>
              </View>
            </Touchable>
          ))
        )}
      </ScrollView>
    );
  };

  const dateLabel =
    viewMode === 'week'
      ? weekRangeLabel(weekDays)
      : currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>
      <FeatureWelcomeModal
        tour="agenda-tour"
        titleKey="menu.schedule"
        stepKeys={[
          'onboarding.scheduleStep1',
          'onboarding.scheduleStep2',
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitles}>
          <Text style={[styles.title, { color: s.headerTitle }]}>{t('schedule.title')}</Text>
          <Text style={[styles.subtitle, { color: s.headerSubtitle }]}>
            {t('schedule.subtitle')}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <View style={[styles.toggle, { backgroundColor: s.toggleBackground }]}>
            <Touchable
              onPress={() => setViewMode('week')}
              borderRadius={7}
              style={[
                styles.toggleBtn,
                viewMode === 'week' && { backgroundColor: s.toggleActiveBackground },
              ]}
            >
              <ColumnsIcon
                size={15}
                color={viewMode === 'week' ? s.toggleActiveText : s.toggleInactiveText}
              />
            </Touchable>
            <Touchable
              onPress={() => setViewMode('day')}
              borderRadius={7}
              style={[
                styles.toggleBtn,
                viewMode === 'day' && { backgroundColor: s.toggleActiveBackground },
              ]}
            >
              <ListIcon
                size={15}
                color={viewMode === 'day' ? s.toggleActiveText : s.toggleInactiveText}
              />
            </Touchable>
          </View>
          <Touchable
            onPress={handleCreateTrip}
            borderRadius={10}
            style={[styles.tripBtn, { backgroundColor: s.buttonPrimary }]}
          >
            <PlaneIcon size={14} color={s.buttonPrimaryText} />
            <Text style={[styles.tripBtnText, { color: s.buttonPrimaryText }]}>
              {t('schedule.createTrip')}
            </Text>
          </Touchable>
        </View>
      </View>

      {/* Date navigation */}
      <View
        style={[
          styles.nav,
          { backgroundColor: s.navBackground, borderColor: s.navBorder },
        ]}
      >
        <Touchable onPress={() => navigateDate(-1)} hitSlop={8} borderRadius={20}>
          <ChevronLeftIcon size={22} color={s.navText} />
        </Touchable>
        <Text style={[styles.navLabel, { color: s.navText }]}>{dateLabel}</Text>
        <Touchable onPress={() => navigateDate(1)} hitSlop={8} borderRadius={20}>
          <ChevronRightIcon size={22} color={s.navText} />
        </Touchable>
      </View>

      {/* Content */}
      {eventsStatus === 'loading' ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={s.buttonPrimary} />
        </View>
      ) : viewMode === 'week' ? (
        renderWeekView()
      ) : (
        renderDayView()
      )}

      {/* Modals */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRemove={handleRemoveEvent}
          onMove={handleMoveEvent}
          onChangeOutfit={handleChangeOutfit}
        />
      )}

      {isTripModalOpen && (
        <TripModal
          existingTrip={selectedTrip}
          eventsInTrip={eventsInTrip}
          onClose={() => {
            setIsTripModalOpen(false);
            setSelectedTrip(undefined);
          }}
          onSave={handleSaveTrip}
          onDelete={selectedTrip ? handleDeleteTrip : undefined}
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Lets the content ScrollView fill the area below the header/toggle so it
  // owns a scroll viewport — required for pull-to-refresh to engage even when
  // the month grid / day list is shorter than the screen.
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitles: { flex: 1 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, marginTop: 2 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  toggle: { flexDirection: 'row', borderRadius: 9, padding: 2 },
  toggleBtn: { padding: 7, borderRadius: 7 },
  tripBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tripBtnText: { fontSize: 13, fontWeight: '600' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  navLabel: { fontSize: 15, fontWeight: '600', textTransform: 'capitalize' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // Week view
  weekContainer: { paddingHorizontal: 16, gap: 10 },
  autoAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  autoAssignText: { fontSize: 14, fontWeight: '700' },
  weekDayCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  weekDayCardToday: { borderWidth: 2 },
  weekDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  weekDayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  weekDayDateTap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekDayName: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    width: 34,
  },
  weekDateCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDateText: { fontSize: 14, fontWeight: '700' },
  weekTripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    flexShrink: 1,
  },
  weekTripPillText: { fontSize: 10, fontWeight: '700' },
  weekDayHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weekAddBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEmptyRow: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  weekEmptyText: { fontSize: 13 },
  weekOutfitsRow: { gap: 10, paddingVertical: 2 },
  weekOutfitCard: {
    width: 88,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 6,
    gap: 6,
  },
  weekOutfitImage: { width: '100%', height: 96, borderRadius: 8 },
  weekOutfitPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  weekOutfitName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  // Day view
  dayViewContent: { paddingHorizontal: 20, paddingBottom: 32 },
  dayViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  dayViewDate: { fontSize: 20, fontWeight: '700', textTransform: 'capitalize' },
  tripPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  tripPillText: { fontSize: 11, fontWeight: '700' },
  dayViewRight: { alignItems: 'flex-end', gap: 8 },
  addBtnDay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnDayText: { fontSize: 13, fontWeight: '600' },
  emptyDay: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14 },
  eventCard: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    gap: 14,
    padding: 12,
  },
  eventCardImageWrap: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden' },
  eventCardImage: { width: '100%', height: '100%' },
  eventCardImagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  eventCardInfo: { flex: 1, justifyContent: 'center', gap: 8 },
  eventCardName: { fontSize: 15, fontWeight: '700' },
  itemMini: { marginRight: 6 },
  itemMiniImage: { width: 36, height: 36, borderRadius: 6 },
});

export default Schedule;
