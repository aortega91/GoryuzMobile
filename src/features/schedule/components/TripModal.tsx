import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import {
  PlaneIcon,
  BriefcaseIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  AlertTriangleIcon,
} from '@assets/icons';
import { getImageSource } from '@api/client';
import { Trip, CalendarEvent, DailyWeather } from '../types';
import { geocodeDestination, fetchWeatherForecast } from '../api/weatherApi';
import DatePickerModal from './DatePickerModal';

interface Props {
  existingTrip?: Trip;
  eventsInTrip?: CalendarEvent[];
  onClose: () => void;
  onSave: (trip: Trip) => void;
  onDelete?: (tripId: string) => void;
}

type Mode = 'form' | 'packing';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function TripModal({ existingTrip, eventsInTrip = [], onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;

  const [mode, setMode] = useState<Mode>(existingTrip ? 'packing' : 'form');
  const [name, setName] = useState(existingTrip?.name ?? '');
  const [destination, setDestination] = useState(existingTrip?.destination ?? '');
  const [startDate, setStartDate] = useState(
    existingTrip?.startDate ?? new Date().toISOString().split('T')[0],
  );
  const [endDate, setEndDate] = useState(
    existingTrip?.endDate ??
      new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);

  const packingItems = useMemo(() => {
    const map = new Map<string, { id: string; name: string; imageData: string | null }>();
    eventsInTrip.forEach(e => {
      e.outfit?.items.forEach(item => {
        if (!map.has(item.id)) { map.set(item.id, item); }
      });
    });
    return Array.from(map.values());
  }, [eventsInTrip]);

  const handleSave = async () => {
    if (!name.trim()) { setError(t('schedule.errorNameRequired')); return; }
    if (!destination.trim()) { setError(t('schedule.errorDestRequired')); return; }
    if (!startDate || !endDate) { setError(t('schedule.errorDatesRequired')); return; }
    if (startDate > endDate) { setError(t('schedule.errorDateOrder')); return; }

    setSaving(true);
    setError('');

    try {
      const geo = await geocodeDestination(destination);
      if (!geo) {
        setError(t('schedule.errorInvalidDestination'));
        setSaving(false);
        return;
      }

      let dailyWeather: DailyWeather[] | null = null;
      try {
        const allWeather = await fetchWeatherForecast(geo.lat, geo.lon, 16);
        dailyWeather = allWeather.filter(w => w.date >= startDate && w.date <= endDate);
      } catch {
        // non-fatal: save trip without weather
      }

      const trip: Trip = {
        id: existingTrip?.id ?? generateId(),
        name: name.trim(),
        destination: geo.displayName,
        startDate,
        endDate,
        lat: geo.lat,
        lng: geo.lon,
        weatherForecast: dailyWeather
          ? `${t('schedule.weatherIn')} ${geo.displayName}: ${
              dailyWeather[0]
                ? `${dailyWeather[0].tempMax}°/${dailyWeather[0].tempMin}°`
                : '--'
            }`
          : null,
        dailyWeather,
      };

      onSave(trip);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (existingTrip && onDelete) {
      onDelete(existingTrip.id);
      onClose();
    }
  };

  return (
    <>
      <BottomSheet onClose={onClose} backgroundColor={s.modalBackground} maxHeightRatio={0.9}>
        <View style={styles.content}>
          {mode === 'form' ? (
            <>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <PlaneIcon size={20} color={s.tripBadgeBackground} />
                  <Text style={[styles.modalTitle, { color: s.modalTitle }]}>
                    {existingTrip ? t('schedule.editTrip') : t('schedule.createTrip')}
                  </Text>
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
                <Text style={[styles.label, { color: s.inputLabel }]}>
                  {t('schedule.tripName')}
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  editable={!saving}
                  placeholder={t('schedule.tripNamePlaceholder')}
                  placeholderTextColor={s.inputPlaceholder}
                  style={[
                    styles.input,
                    { backgroundColor: s.inputBackground, borderColor: s.inputBorder, color: s.inputText },
                    saving && styles.disabled,
                  ]}
                />

                <Text style={[styles.label, { color: s.inputLabel }]}>
                  {t('schedule.destination')}
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: s.inputBorder, backgroundColor: s.inputBackground },
                  ]}
                >
                  <MapPinIcon size={16} color={s.inputPlaceholder} />
                  <TextInput
                    value={destination}
                    onChangeText={setDestination}
                    editable={!saving}
                    placeholder={t('schedule.destinationPlaceholder')}
                    placeholderTextColor={s.inputPlaceholder}
                    style={[styles.inputInner, { color: s.inputText }, saving && styles.disabled]}
                  />
                </View>
                <Text style={[styles.hint, { color: s.inputHint }]}>
                  {t('schedule.destinationHint')}
                </Text>

                <View style={styles.dateRow}>
                  <View style={styles.dateField}>
                    <Text style={[styles.label, { color: s.inputLabel }]}>
                      {t('schedule.startDate')}
                    </Text>
                    <Touchable
                      onPress={() => setStartPickerVisible(true)}
                      disabled={saving}
                      borderRadius={10}
                      style={[
                        styles.dateBtn,
                        { backgroundColor: s.inputBackground, borderColor: s.inputBorder },
                        saving && styles.disabled,
                      ]}
                    >
                      <CalendarIcon size={14} color={s.inputPlaceholder} />
                      <Text style={[styles.dateBtnText, { color: s.inputText }]}>
                        {formatDate(startDate)}
                      </Text>
                    </Touchable>
                  </View>
                  <View style={styles.dateField}>
                    <Text style={[styles.label, { color: s.inputLabel }]}>
                      {t('schedule.endDate')}
                    </Text>
                    <Touchable
                      onPress={() => setEndPickerVisible(true)}
                      disabled={saving}
                      borderRadius={10}
                      style={[
                        styles.dateBtn,
                        { backgroundColor: s.inputBackground, borderColor: s.inputBorder },
                        saving && styles.disabled,
                      ]}
                    >
                      <CalendarIcon size={14} color={s.inputPlaceholder} />
                      <Text style={[styles.dateBtnText, { color: s.inputText }]}>
                        {formatDate(endDate)}
                      </Text>
                    </Touchable>
                  </View>
                </View>

                {!!error && (
                  <View
                    style={[
                      styles.errorBox,
                      { backgroundColor: s.buttonDanger, borderColor: s.buttonDangerBorder },
                    ]}
                  >
                    <AlertTriangleIcon size={14} color={s.buttonDangerText} />
                    <Text style={[styles.errorText, { color: s.buttonDangerText }]}>{error}</Text>
                  </View>
                )}

                <View style={styles.formActions}>
                  {existingTrip && (
                    <Touchable
                      onPress={() => setMode('packing')}
                      disabled={saving}
                      borderRadius={12}
                      style={[
                        styles.btnSecondary,
                        { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder },
                        saving && styles.disabled,
                      ]}
                    >
                      <Text style={[styles.btnText, { color: s.buttonSecondaryText }]}>
                        {t('common.cancel')}
                      </Text>
                    </Touchable>
                  )}
                  <Touchable
                    onPress={handleSave}
                    disabled={saving}
                    borderRadius={12}
                    style={[
                      styles.btnPrimary,
                      { backgroundColor: s.buttonPrimary },
                      saving && styles.disabled,
                    ]}
                  >
                    {saving ? (
                      <ActivityIndicator size="small" color={s.buttonPrimaryText} />
                    ) : (
                      <Text style={[styles.btnText, { color: s.buttonPrimaryText }]}>
                        {existingTrip ? t('schedule.updateTrip') : t('schedule.saveTrip')}
                      </Text>
                    )}
                  </Touchable>
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <View style={styles.packingHeader}>
                <View style={styles.packingTitleArea}>
                  <View style={styles.modalTitleRow}>
                    <BriefcaseIcon size={20} color={s.tripBadgeBackground} />
                    <Text
                      style={[styles.modalTitle, { color: s.modalTitle }]}
                      numberOfLines={1}
                    >
                      {existingTrip?.name}
                    </Text>
                  </View>
                  <View style={styles.packingMeta}>
                    <MapPinIcon size={12} color={s.modalSubtitle} />
                    <Text style={[styles.metaText, { color: s.modalSubtitle }]}>
                      {existingTrip?.destination}
                    </Text>
                    <CalendarIcon size={12} color={s.modalSubtitle} />
                    <Text style={[styles.metaText, { color: s.modalSubtitle }]}>
                      {existingTrip
                        ? `${formatDate(existingTrip.startDate)} – ${formatDate(existingTrip.endDate)}`
                        : ''}
                    </Text>
                  </View>
                </View>
                <View style={styles.packingActions}>
                  <Touchable
                    onPress={() => setMode('form')}
                    hitSlop={8}
                    borderRadius={8}
                    style={[styles.iconBtn, { backgroundColor: s.buttonSecondary }]}
                  >
                    <PencilIcon size={16} color={s.buttonSecondaryText} />
                  </Touchable>
                  {onDelete && (
                    <Touchable
                      onPress={handleDelete}
                      hitSlop={8}
                      borderRadius={8}
                      style={[styles.iconBtn, { backgroundColor: s.buttonDanger }]}
                    >
                      <TrashIcon size={16} color={s.buttonDangerText} />
                    </Touchable>
                  )}
                </View>
              </View>

              {existingTrip?.weatherForecast && (
                <View
                  style={[
                    styles.weatherBanner,
                    { backgroundColor: s.navBackground, borderColor: s.navBorder },
                  ]}
                >
                  <Text style={[styles.weatherText, { color: s.modalSubtitle }]}>
                    {existingTrip.weatherForecast}
                  </Text>
                </View>
              )}

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.packingGrid}
              >
                {packingItems.length === 0 ? (
                  <View style={styles.emptyPacking}>
                    <BriefcaseIcon size={48} color={s.emptyIcon} />
                    <Text style={[styles.emptyText, { color: s.emptyText }]}>
                      {t('schedule.emptyPacking')}
                    </Text>
                    <Text style={[styles.emptyHint, { color: s.inputHint }]}>
                      {t('schedule.emptyPackingHint')}
                    </Text>
                  </View>
                ) : (
                  packingItems.map(item => (
                    <View
                      key={item.id}
                      style={[
                        styles.packingItem,
                        { backgroundColor: s.packingItemBackground, borderColor: s.packingItemBorder },
                      ]}
                    >
                      {item.imageData ? (
                        <Image
                          source={getImageSource(item.imageData)}
                          style={styles.packingImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.packingImage, { backgroundColor: s.emptyIcon }]} />
                      )}
                      <Text
                        style={[styles.packingName, { color: s.packingItemName }]}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            </>
          )}
        </View>
      </BottomSheet>

      <DatePickerModal
        visible={startPickerVisible}
        value={startDate}
        onChange={date => {
          setStartDate(date);
          if (date > endDate) { setEndDate(date); }
        }}
        onClose={() => setStartPickerVisible(false)}
        title={t('schedule.startDate')}
      />
      <DatePickerModal
        visible={endPickerVisible}
        value={endDate}
        onChange={setEndDate}
        onClose={() => setEndPickerVisible(false)}
        title={t('schedule.endDate')}
        minDate={startDate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 8, gap: 16 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  formScroll: { flexGrow: 0 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    gap: 8,
  },
  inputInner: { flex: 1, fontSize: 15 },
  hint: { fontSize: 11, marginBottom: 16 },
  dateRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  dateField: { flex: 1 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 6,
  },
  dateBtnText: { fontSize: 13, fontWeight: '500' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { flex: 1, fontSize: 12, fontWeight: '500' },
  formActions: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 8 },
  btnPrimary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
  },
  btnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  btnText: { fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
  packingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  packingTitleArea: { flex: 1 },
  packingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  metaText: { fontSize: 12 },
  packingActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: { padding: 8, borderRadius: 8 },
  weatherBanner: { borderWidth: 1, borderRadius: 10, padding: 10 },
  weatherText: { fontSize: 12 },
  packingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  emptyPacking: { width: '100%', alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontWeight: '600' },
  emptyHint: { fontSize: 12, textAlign: 'center' },
  packingItem: {
    width: '30%',
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  packingImage: { width: '100%', aspectRatio: 1 },
  packingName: { fontSize: 11, padding: 6, textAlign: 'center' },
});

export default TripModal;