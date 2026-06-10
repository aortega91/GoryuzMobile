import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
} from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import { logError } from '@utilities/crashlytics';

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

function getMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }
  return days;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

type ViewMode = 'month' | 'day';

const DAY_NAMES_SHORT = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
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
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [locationWeather, setLocationWeather] = useState<Record<string, DailyWeather>>({});
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | undefined>(undefined);
  const [pickingForDate, setPickingForDate] = useState<string | null>(null);
  const [changingOutfitForEvent, setChangingOutfitForEvent] =
    useState<CalendarEvent | null>(null);

  // ─── Load data on mount ───────────────────────────────────────────────────

  useEffect(() => {
    if (eventsStatus === 'idle') { dispatch(loadEvents()); }
    dispatch(loadTrips());
    dispatch(loadOutfits());
  }, [dispatch, eventsStatus]);

  useEffect(() => {
    if (latitude == null || longitude == null) { return; }
    fetchWeatherForecast(latitude, longitude, 16)
      .then(forecast => {
        const map: Record<string, DailyWeather> = {};
        forecast.forEach(d => { map[d.date] = d; });
        setLocationWeather(map);
      })
      .catch(err => logError(err, 'Schedule.fetchWeather'));
  }, [latitude, longitude]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const monthDays = useMemo(
    () => (viewMode === 'month' ? getMonthDays(currentDate) : []),
    [currentDate, viewMode],
  );

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
    setCurrentDate(prev => {
      if (viewMode === 'month') {
        return new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      }
      return addDays(prev, offset);
    });
  };

  const handleSelectDay = (date: Date) => {
    setCurrentDate(date);
    setViewMode('day');
  };

  const handleAddOutfit = (dateStr: string) => {
    setPickingForDate(dateStr);
  };

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

  const renderMonthGrid = () => {
    const weeks = chunk(monthDays, 7);
    const currentMonth = currentDate.getMonth();

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.monthContainer, { paddingBottom: insets.bottom + 16 }]}
      >
        {/* Day name headers */}
        <View style={styles.monthHeaderRow}>
          {DAY_NAMES_SHORT.map(name => (
            <View key={name} style={styles.monthHeaderCell}>
              <Text style={[styles.monthHeaderText, { color: s.columnDayName }]}>{name}</Text>
            </View>
          ))}
        </View>

        {/* Week rows */}
        {weeks.map(week => (
          <View key={toDateStr(week[0])} style={styles.monthWeekRow}>
            {week.map(date => {
              const dateStr = toDateStr(date);
              const dayEvents = eventsByDate[dateStr] ?? [];
              const isToday = dateStr === today;
              const isCurrentMonth = date.getMonth() === currentMonth;
              const trip = tripForDate(dateStr);
              const outfitImg = dayEvents[0]?.outfit?.items[0]?.imageData;

              return (
                <Touchable
                  key={dateStr}
                  onPress={() => handleSelectDay(date)}
                  borderRadius={8}
                  style={[
                    styles.monthCell,
                    {
                      backgroundColor: s.columnBackground,
                      borderColor: s.columnBorder,
                      opacity: isCurrentMonth ? 1 : 0.35,
                    },
                  ]}
                >
                  {outfitImg != null && (
                    <AuthedImage
                      data={outfitImg}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  )}
                  {outfitImg != null && (
                    <View style={[StyleSheet.absoluteFill, styles.monthCellOverlay]} />
                  )}

                  {/* Date + trip indicator */}
                  <View style={styles.monthCellTop}>
                    <View
                      style={[
                        styles.monthDateCircle,
                        isToday && { backgroundColor: s.columnTodayBackground },
                      ]}
                    >
                      <Text
                        style={[
                          styles.monthDateText,
                          {
                            color: isToday
                              ? s.columnTodayText
                              : outfitImg != null
                              ? s.columnTodayText
                              : s.columnDayNumber,
                          },
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                    {trip != null && (
                      <PlaneIcon
                        size={8}
                        color={outfitImg != null ? s.columnTodayText : s.tripBadgeText}
                      />
                    )}
                  </View>

                  {/* Dot indicator when there's an event but no image */}
                  {dayEvents.length > 0 && outfitImg == null && (
                    <View
                      style={[styles.monthEventDot, { backgroundColor: s.buttonPrimary }]}
                    />
                  )}
                </Touchable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderDayView = () => {
    const dateStr = toDateStr(currentDate);
    const dayEvents = eventsByDate[dateStr] ?? [];
    const isMaxed = dayEvents.length >= MAX_EVENTS_PER_DAY;
    const dayWeather = locationWeather[dateStr];
    const trip = tripForDate(dateStr);

    return (
      <ScrollView
        contentContainerStyle={[styles.dayViewContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
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
    viewMode === 'month'
      ? currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      : currentDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>

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
              onPress={() => setViewMode('month')}
              borderRadius={7}
              style={[
                styles.toggleBtn,
                viewMode === 'month' && { backgroundColor: s.toggleActiveBackground },
              ]}
            >
              <ColumnsIcon
                size={15}
                color={viewMode === 'month' ? s.toggleActiveText : s.toggleInactiveText}
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
      ) : viewMode === 'month' ? (
        renderMonthGrid()
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
  // Month grid
  monthContainer: { paddingHorizontal: 12 },
  monthHeaderRow: { flexDirection: 'row', marginBottom: 4 },
  monthHeaderCell: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  monthHeaderText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  monthWeekRow: { flexDirection: 'row', gap: 3, marginBottom: 3 },
  monthCell: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 4,
    justifyContent: 'space-between',
  },
  monthCellOverlay: { backgroundColor: 'rgba(0,0,0,0.30)' },
  monthCellTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthDateCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDateText: { fontSize: 11, fontWeight: '700' },
  monthEventDot: { width: 5, height: 5, borderRadius: 3, alignSelf: 'center' },
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
