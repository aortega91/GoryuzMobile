import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import {
  CalendarIcon,
  CalendarPlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  CloudSunIcon,
  PencilIcon,
  TrashIcon,
} from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import { AgendaMotive, CalendarEvent, DayWeather, Trip, toDayWeather } from '../types';
import { AGENDA_MOTIVES, DEFAULT_MOTIVE, getMotive, getPlanIcon } from '../motives';
import { addDays, daysBetween, fromDateKey, localeFor, toDateKey } from '../dates';
import { fetchWeatherForecast, geocodeCoordinates } from '../api/weatherApi';
import DatePickerModal from './DatePickerModal';

/** Daily cap shared with the calendar: 3 plans and 3 looks on the same date. */
export const MAX_PER_DAY = 3;

/** Sheet side padding (zena `p-6`) and the suitcase grid's `gap-3`. */
const SHEET_PADDING = 24;
const GRID_GAP = 12;

interface Props {
  existingPlan?: Trip;
  /** Every plan in the agenda — used to respect the 3-per-day cap */
  plans: Trip[];
  /** Looks scheduled inside the plan's dates (fills the suitcase) */
  eventsInPlan: CalendarEvent[];
  onClose: () => void;
  onCreate: (plan: Trip) => Promise<void>;
  onUpdate: (plan: Trip) => Promise<void>;
  onDelete: (planId: string) => void;
  /** Schedules a look on one day of the plan — reuses the calendar's picker */
  onAddOutfit: (dateKey: string) => void;
}

type Mode = 'form' | 'detail';

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * zena's TripModal, generalised into plans: a motive, a name, one day or a
 * range, an optional start time and an optional destination (which brings the
 * forecast and turns the looks list into a suitcase). Opening an existing plan
 * lands on its detail — looks/suitcase — with edit and delete actions.
 */
function PlanModal({
  existingPlan,
  plans,
  eventsInPlan,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  onAddOutfit,
}: Props) {
  const { t, i18n } = useTranslation();
  const locale = localeFor(i18n.language);
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const { width } = useWindowDimensions();
  // Suitcase grid is `grid-cols-2` at phone width (zena's `xs:` isn't a breakpoint).
  const packingItemWidth = (width - SHEET_PADDING * 2 - GRID_GAP) / 2;

  const todayKey = toDateKey(new Date());

  const [mode, setMode] = useState<Mode>(existingPlan ? 'detail' : 'form');
  const [motive, setMotive] = useState<AgendaMotive>(existingPlan?.motive ?? DEFAULT_MOTIVE);
  const [name, setName] = useState(existingPlan?.name ?? '');
  const [startDate, setStartDate] = useState(existingPlan?.startDate ?? todayKey);
  const [endDate, setEndDate] = useState(
    existingPlan?.endDate ?? toDateKey(addDays(new Date(), 3)),
  );
  const [isMultiDay, setIsMultiDay] = useState(
    existingPlan ? existingPlan.startDate !== existingPlan.endDate : true,
  );
  const [hasStartTime, setHasStartTime] = useState(!!existingPlan?.startTime);
  const [startTime, setStartTime] = useState(existingPlan?.startTime || '09:00');
  // Travelling is independent of the motive, so it starts off for new plans.
  const [hasDestination, setHasDestination] = useState(!!existingPlan?.destination);
  const [destination, setDestination] = useState(existingPlan?.destination ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [startPickerVisible, setStartPickerVisible] = useState(false);
  const [endPickerVisible, setEndPickerVisible] = useState(false);
  const [isPickingDay, setIsPickingDay] = useState(false);

  const formatDay = (key: string, opts: Intl.DateTimeFormatOptions) =>
    fromDateKey(key).toLocaleDateString(locale, opts);

  const formatRange = (plan: Trip) => {
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    if (plan.startDate === plan.endDate) return formatDay(plan.startDate, opts);
    return `${formatDay(plan.startDate, opts)} – ${formatDay(plan.endDate, opts)}`;
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  /** A day takes up to 3 plans — without counting the plan being edited. */
  const findFullDay = (start: string, end: string): string | null => {
    const others = plans.filter(p => p.id !== existingPlan?.id);
    const full = daysBetween(start, end, 400).find(
      day => others.filter(p => day >= p.startDate && day <= p.endDate).length >= MAX_PER_DAY,
    );
    return full ?? null;
  };

  const validate = (): { start: string; end: string } | null => {
    if (!name.trim()) {
      setError(t('schedule.errorPlanNameRequired'));
      return null;
    }
    if (hasDestination && destination.trim().length < 3) {
      setError(t('schedule.errorDestinationInvalid'));
      return null;
    }
    const end = isMultiDay ? endDate : startDate;
    if (end < startDate) {
      setError(t('schedule.errorEndBeforeStart'));
      return null;
    }
    const fullDay = findFullDay(startDate, end);
    if (fullDay) {
      setError(
        t('schedule.errorMaxPlansPerDay', {
          date: formatDay(fullDay, { day: 'numeric', month: 'long' }),
        }),
      );
      return null;
    }
    return { start: startDate, end };
  };

  /** The forecast only makes sense for a plan with a locatable destination. */
  const resolveWeather = async (
    start: string,
    end: string,
  ): Promise<Pick<Trip, 'lat' | 'lng' | 'weatherForecast' | 'dailyWeather'>> => {
    if (!hasDestination) {
      // Keep the old coordinates (zena sends undefined) but wipe the forecast.
      return {
        lat: existingPlan?.lat ?? null,
        lng: existingPlan?.lng ?? null,
        weatherForecast: '',
        dailyWeather: [],
      };
    }
    const place = destination.trim();

    let coords: { lat: number; lng: number } | null = null;
    if (
      existingPlan?.destination === place &&
      existingPlan.lat != null &&
      existingPlan.lng != null
    ) {
      coords = { lat: existingPlan.lat, lng: existingPlan.lng };
    } else {
      try {
        coords = await geocodeCoordinates(place);
      } catch (err) {
        logError(err, 'PlanModal.geocode');
      }
    }

    if (!coords) {
      return {
        lat: null,
        lng: null,
        weatherForecast: t('schedule.weatherNoLocation', { destination: place }),
        dailyWeather: [],
      };
    }

    let daily: DayWeather[] = [];
    try {
      const forecast = await fetchWeatherForecast(coords.lat, coords.lng, 16);
      daily = forecast.filter(d => d.date >= start && d.date <= end).map(toDayWeather);
    } catch (err) {
      logError(err, 'PlanModal.fetchWeather');
    }

    const weatherForecast = daily.length
      ? t('schedule.weatherSummary', {
        destination: place,
        max: Math.max(...daily.map(d => d.max)),
        min: Math.min(...daily.map(d => d.min)),
      })
      : t('schedule.weatherUnavailable', { destination: place });

    return { lat: coords.lat, lng: coords.lng, weatherForecast, dailyWeather: daily };
  };

  const handleSave = async () => {
    setError('');
    const dates = validate();
    if (!dates) return;

    setSaving(true);
    try {
      const weather = await resolveWeather(dates.start, dates.end);
      const plan: Trip = {
        ...(existingPlan ?? {}),
        id: existingPlan?.id ?? generateId(),
        name: name.trim(),
        motive,
        destination: hasDestination ? destination.trim() : '',
        startDate: dates.start,
        endDate: dates.end,
        startTime: hasStartTime ? startTime : null,
        ...weather,
      };

      if (existingPlan) {
        await onUpdate(plan);
        setMode('detail');
      } else {
        await onCreate(plan);
        onClose();
      }
    } catch (err) {
      logError(err, 'PlanModal.save');
      setError(t('schedule.errorSavePlan'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!existingPlan) return;
    Alert.alert(t('schedule.deletePlanTitle'), t('schedule.deletePlanConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('schedule.deletePlan'),
        style: 'destructive',
        onPress: () => {
          onDelete(existingPlan.id);
          onClose();
        },
      },
    ]);
  };

  // ─── Detail helpers ───────────────────────────────────────────────────────

  const packingItems = useMemo(() => {
    const map = new Map<string, { id: string; name: string; imageData: string | null }>();
    eventsInPlan.forEach(e => {
      e.outfit?.items.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item);
      });
    });
    return Array.from(map.values());
  }, [eventsInPlan]);

  const planDays = existingPlan ? daysBetween(existingPlan.startDate, existingPlan.endDate) : [];
  const isSingleDayPlan = !!existingPlan && existingPlan.startDate === existingPlan.endDate;
  const eventsOnDay = (day: string) => eventsInPlan.filter(e => e.date === day).length;

  /** A one-day plan has nothing to ask; a longer one needs the target day. */
  const handleAddOutfit = () => {
    if (!existingPlan) return;
    if (isSingleDayPlan) {
      onAddOutfit(existingPlan.startDate);
      return;
    }
    setIsPickingDay(prev => !prev);
  };

  const stepTime = (part: 'h' | 'm', delta: number) => {
    const [h, m] = startTime.split(':').map(Number);
    if (part === 'h') {
      setStartTime(`${pad((h + delta + 24) % 24)}:${pad(m)}`);
    } else {
      setStartTime(`${pad(h)}:${pad((m + delta + 60) % 60)}`);
    }
  };

  // ─── Render: form ─────────────────────────────────────────────────────────

  const motiveColors = s.motives[motive];
  const FormIcon = getPlanIcon(motive, hasDestination);

  const renderSwitchRow = (
    label: string,
    hint: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <View style={styles.switchRow}>
      <View style={styles.switchTexts}>
        <Text style={[styles.label, { color: s.inputLabel }]}>{label}</Text>
        <Text style={[styles.hint, { color: s.inputHint }]}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        disabled={saving}
        trackColor={{ false: s.switchTrackOff, true: s.switchTrackOn }}
        thumbColor={s.switchThumb}
        ios_backgroundColor={s.switchTrackOff}
        style={saving && styles.disabled}
      />
    </View>
  );

  const renderDateButton = (value: string, onPress: () => void) => (
    <Touchable
      onPress={onPress}
      disabled={saving}
      borderRadius={12}
      style={[
        styles.dateBtn,
        { backgroundColor: s.inputBackground, borderColor: s.inputBorder },
        saving && styles.disabled,
      ]}
    >
      <CalendarIcon size={16} color={s.inputPlaceholder} />
      <Text style={[styles.dateBtnText, { color: s.inputText }]} numberOfLines={1}>
        {formatDay(value, { day: 'numeric', month: 'short', year: 'numeric' })}
      </Text>
    </Touchable>
  );

  const renderTimeStepper = (part: 'h' | 'm') => {
    const [h, m] = startTime.split(':');
    const step = part === 'h' ? 1 : 5;
    return (
      <View
        style={[
          styles.timeBox,
          { backgroundColor: s.inputBackground, borderColor: s.inputBorder },
          saving && styles.disabled,
        ]}
      >
        <Touchable
          onPress={() => stepTime(part, -step)}
          disabled={saving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          borderRadius={14}
          style={styles.timeStepBtn}
        >
          <ChevronLeftIcon size={18} color={s.inputLabel} />
        </Touchable>
        <Text style={[styles.timeValue, { color: s.inputText }]}>{part === 'h' ? h : m}</Text>
        <Touchable
          onPress={() => stepTime(part, step)}
          disabled={saving}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          borderRadius={14}
          style={styles.timeStepBtn}
        >
          <ChevronRightIcon size={18} color={s.inputLabel} />
        </Touchable>
      </View>
    );
  };

  const renderForm = () => (
    <>
      <View style={styles.formTitleRow}>
        <View style={[styles.formTitleIcon, { backgroundColor: motiveColors.chipBackground }]}>
          <FormIcon size={26} color={motiveColors.chipText} />
        </View>
        <Text style={[styles.formTitle, { color: s.modalTitle }]}>
          {existingPlan ? t('schedule.editPlan') : t('schedule.newPlan')}
        </Text>
      </View>

      <ScrollView
        style={styles.shrink}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.formBody}
      >
        {/* Motive */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: s.inputLabel }]}>{t('schedule.planMotive')}</Text>
          <View style={styles.motiveGrid}>
            {AGENDA_MOTIVES.map(option => {
              const active = motive === option.id;
              const colors = s.motives[option.id];
              const { Icon } = option;
              const fg = active ? colors.selectedText : s.chipNeutralText;
              return (
                <Touchable
                  key={option.id}
                  onPress={() => setMotive(option.id)}
                  disabled={saving}
                  borderRadius={12}
                  style={[
                    styles.motiveBtn,
                    { borderColor: active ? colors.selectedBorder : s.inputBorder },
                    active && { backgroundColor: colors.selectedBackground },
                    saving && styles.disabled,
                  ]}
                >
                  <Icon size={20} color={fg} />
                  <Text style={[styles.motiveLabel, { color: fg }]} numberOfLines={1}>
                    {t(option.labelKey)}
                  </Text>
                </Touchable>
              );
            })}
          </View>
        </View>

        {/* Name */}
        <View style={styles.fieldTight}>
          <Text style={[styles.label, { color: s.inputLabel }]}>{t('schedule.planName')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            editable={!saving}
            placeholder={
              hasDestination
                ? t('schedule.tripNamePlaceholder')
                : t('schedule.planNamePlaceholder')
            }
            placeholderTextColor={s.inputPlaceholder}
            style={[
              styles.input,
              { backgroundColor: s.inputBackground, borderColor: s.inputBorder, color: s.inputText },
              saving && styles.disabled,
            ]}
          />
        </View>

        {/* Duration */}
        <View style={styles.field}>
          {renderSwitchRow(
            t('schedule.multiDayQuestion'),
            t('schedule.multiDayHint'),
            isMultiDay,
            setIsMultiDay,
          )}
          {isMultiDay ? (
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={[styles.subLabel, { color: s.inputHint }]}>
                  {t('schedule.startDate')}
                </Text>
                {renderDateButton(startDate, () => setStartPickerVisible(true))}
              </View>
              <View style={styles.dateField}>
                <Text style={[styles.subLabel, { color: s.inputHint }]}>
                  {t('schedule.endDate')}
                </Text>
                {renderDateButton(endDate, () => setEndPickerVisible(true))}
              </View>
            </View>
          ) : (
            <View>
              <Text style={[styles.subLabel, { color: s.inputHint }]}>
                {t('schedule.planDate')}
              </Text>
              {renderDateButton(startDate, () => setStartPickerVisible(true))}
            </View>
          )}
        </View>

        {/* Start time (optional) */}
        <View style={styles.field}>
          {renderSwitchRow(
            t('schedule.startTimeQuestion'),
            t('schedule.startTimeHint'),
            hasStartTime,
            setHasStartTime,
          )}
          {hasStartTime && (
            <View style={styles.timeRow}>
              <ClockIcon size={20} color={s.inputPlaceholder} />
              {renderTimeStepper('h')}
              <Text style={[styles.timeColon, { color: s.inputText }]}>:</Text>
              {renderTimeStepper('m')}
            </View>
          )}
        </View>

        {/* Destination (optional) */}
        <View style={styles.field}>
          {renderSwitchRow(
            t('schedule.hasDestinationLabel'),
            t('schedule.hasDestinationHint'),
            hasDestination,
            setHasDestination,
          )}
          {hasDestination && (
            <>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: s.inputBorder, backgroundColor: s.inputBackground },
                  saving && styles.disabled,
                ]}
              >
                <MapPinIcon size={18} color={s.inputPlaceholder} />
                <TextInput
                  value={destination}
                  onChangeText={setDestination}
                  editable={!saving}
                  placeholder={t('schedule.destinationPlaceholder')}
                  placeholderTextColor={s.inputPlaceholder}
                  style={[styles.inputInner, { color: s.inputText }]}
                />
              </View>
              <View style={styles.hintRow}>
                <CloudSunIcon size={12} color={s.inputHint} />
                <Text style={[styles.hintRowText, { color: s.inputHint }]}>
                  {t('schedule.weatherValidationInfo')}
                </Text>
              </View>
            </>
          )}
        </View>

        {!!error && (
          <View style={[styles.errorBox, { backgroundColor: s.buttonDanger }]}>
            <Text style={[styles.errorText, { color: s.buttonDangerText }]}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Actions stay below the scrolling form, like zena's `mt-8` footer */}
      <View style={styles.formActions}>
        {existingPlan && (
          <Touchable
            onPress={() => {
              setError('');
              setMode('detail');
            }}
            disabled={saving}
            borderRadius={16}
            style={[
              styles.btnSecondary,
              { backgroundColor: s.chipNeutralBackground },
              saving && styles.disabled,
            ]}
          >
            <Text style={[styles.btnText, { color: s.mutedButtonText }]}>
              {t('common.cancel')}
            </Text>
          </Touchable>
        )}
        <Touchable
          onPress={handleSave}
          disabled={saving}
          borderRadius={16}
          style={[styles.btnPrimary, { backgroundColor: s.buttonPrimary }, saving && styles.disabled]}
        >
          {saving ? (
            <ActivityIndicator size="small" color={s.buttonPrimaryText} />
          ) : (
            <Text style={[styles.btnText, { color: s.buttonPrimaryText }]}>
              {t('schedule.savePlan')}
            </Text>
          )}
        </Touchable>
      </View>
    </>
  );

  // ─── Render: detail (looks / suitcase) ────────────────────────────────────

  const renderDetail = () => {
    if (!existingPlan) return null;
    const detailMotive = getMotive(existingPlan.motive);
    const colors = s.motives[detailMotive.id];
    const travels = !!existingPlan.destination;
    const PlanIcon = getPlanIcon(existingPlan.motive, travels);

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailBody}>
        {/* Header block — `flex flex-col mb-6 space-y-4` */}
        <View style={styles.detailTop}>
          <View style={styles.detailHeader}>
            <View style={styles.detailTitleArea}>
              <View style={[styles.motiveChip, { backgroundColor: colors.chipBackground }]}>
                <PlanIcon size={12} color={colors.chipText} />
                <Text style={[styles.motiveChipText, { color: colors.chipText }]}>
                  {t(detailMotive.labelKey)}
                </Text>
              </View>
              <Text style={[styles.detailTitle, { color: s.modalTitle }]} numberOfLines={1}>
                {existingPlan.name}
              </Text>
              <View style={styles.metaChips}>
                {travels && (
                  <View style={[styles.metaChip, { backgroundColor: s.chipNeutralBackground }]}>
                    <MapPinIcon size={14} color={s.chipNeutralIcon} />
                    <Text style={[styles.metaChipText, { color: s.chipNeutralText }]} numberOfLines={1}>
                      {existingPlan.destination}
                    </Text>
                  </View>
                )}
                <View style={[styles.metaChip, { backgroundColor: s.chipNeutralBackground }]}>
                  <CalendarIcon size={14} color={s.chipNeutralIcon} />
                  <Text style={[styles.metaChipText, { color: s.chipNeutralText }]}>
                    {formatRange(existingPlan)}
                  </Text>
                </View>
                {!!existingPlan.startTime && (
                  <View style={[styles.metaChip, { backgroundColor: s.chipNeutralBackground }]}>
                    <ClockIcon size={14} color={s.chipNeutralIcon} />
                    <Text style={[styles.metaChipText, { color: s.chipNeutralText }]}>
                      {existingPlan.startTime}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={[styles.detailActions, { backgroundColor: s.mutedButtonBackground }]}>
              <Touchable
                onPress={() => setMode('form')}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                borderRadius={8}
                style={styles.iconBtn}
              >
                <PencilIcon size={18} color={s.chipNeutralText} />
              </Touchable>
              <Touchable
                onPress={handleDelete}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                borderRadius={8}
                style={styles.iconBtn}
              >
                <TrashIcon size={18} color={s.chipNeutralText} />
              </Touchable>
            </View>
          </View>

          {!!existingPlan.weatherForecast && (
            <View
              style={[
                styles.weatherBanner,
                { backgroundColor: s.weatherBoxBackground, borderColor: s.weatherBoxBorder },
              ]}
            >
              <View
                style={[styles.weatherBannerIcon, { backgroundColor: s.weatherBannerIconBackground }]}
              >
                <CloudSunIcon size={18} color={s.weatherBannerIcon} />
              </View>
              <Text style={[styles.weatherText, { color: s.weatherBannerText }]}>
                {existingPlan.weatherForecast}
              </Text>
            </View>
          )}
        </View>

        {/* Title + button stack on mobile (`flex-col gap-2 mb-4`) */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <PlanIcon size={20} color={s.chipNeutralIcon} />
            <Text style={[styles.sectionTitle, { color: s.modalTitle }]} numberOfLines={1}>
              {travels ? t('schedule.suitcaseTitle') : t('schedule.planLooksTitle')}
            </Text>
            <View style={[styles.countBadge, { backgroundColor: s.countBadgeBackground }]}>
              <Text style={[styles.countBadgeText, { color: s.countBadgeText }]}>
                {packingItems.length}
              </Text>
            </View>
          </View>
          <Touchable
            onPress={handleAddOutfit}
            borderRadius={12}
            style={[styles.addOutfitBtn, { backgroundColor: s.buttonPrimary }]}
          >
            <CalendarPlusIcon size={16} color={s.buttonPrimaryText} />
            <Text style={[styles.addOutfitText, { color: s.buttonPrimaryText }]}>
              {t('schedule.planAddOutfit')}
            </Text>
          </Touchable>
        </View>

        {/* Day picker: a multi-day plan can't guess which day the look goes to. */}
        {isPickingDay && (
          <View
            style={[
              styles.dayPicker,
              { backgroundColor: s.inputBackground, borderColor: s.inputBorder },
            ]}
          >
            <Text style={[styles.dayPickerLabel, { color: s.inputHint }]}>
              {t('schedule.planPickDay')}
            </Text>
            <View style={styles.dayPickerGrid}>
              {planDays.map(day => {
                const used = eventsOnDay(day);
                const isFull = used >= MAX_PER_DAY;
                return (
                  <Touchable
                    key={day}
                    disabled={isFull}
                    onPress={() => {
                      setIsPickingDay(false);
                      onAddOutfit(day);
                    }}
                    borderRadius={12}
                    style={[
                      styles.dayOption,
                      { backgroundColor: s.modalBackground, borderColor: s.inputBorder },
                      isFull && styles.dayOptionFull,
                    ]}
                  >
                    <Text style={[styles.dayOptionLabel, { color: s.modalTitle }]} numberOfLines={1}>
                      {formatDay(day, { weekday: 'short', day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={[styles.dayOptionMeta, { color: s.inputHint }]}>
                      {isFull
                        ? t('schedule.planDayFull')
                        : t('schedule.planDayLooks', { count: used })}
                    </Text>
                  </Touchable>
                );
              })}
            </View>
          </View>
        )}

        {packingItems.length === 0 ? (
          <View
            style={[
              styles.emptyPacking,
              { backgroundColor: s.packingItemBackground, borderColor: s.gridDivider },
            ]}
          >
            <View style={[styles.emptyPackingIcon, { backgroundColor: s.dayEmptyIconBackground }]}>
              <PlanIcon size={40} color={s.emptyIcon} />
            </View>
            <Text style={[styles.emptyTitle, { color: s.modalTitle }]}>
              {t('schedule.emptyPacking')}
            </Text>
            <Text style={[styles.emptyHint, { color: s.inputHint }]}>
              {t('schedule.emptyPackingHint')}
            </Text>
          </View>
        ) : (
          <View style={styles.packingGrid}>
            {packingItems.map(item => (
              <View
                key={item.id}
                style={[
                  styles.packingItem,
                  { width: packingItemWidth, backgroundColor: s.packingItemBackground },
                ]}
              >
                <View
                  style={[styles.packingImage, { backgroundColor: s.dayEmptyIconBackground }]}
                >
                  {item.imageData && (
                    <AuthedImage data={item.imageData} style={styles.fill} resizeMode="cover" />
                  )}
                </View>
                <Text style={[styles.packingName, { color: s.packingItemName }]} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <>
      <BottomSheet onClose={onClose} backgroundColor={s.modalBackground} maxHeightRatio={0.92}>
        <View style={styles.content}>{mode === 'form' ? renderForm() : renderDetail()}</View>
      </BottomSheet>

      <DatePickerModal
        visible={startPickerVisible}
        value={startDate}
        onChange={date => {
          setStartDate(date);
          if (date > endDate) setEndDate(date);
        }}
        onClose={() => setStartPickerVisible(false)}
        title={isMultiDay ? t('schedule.startDate') : t('schedule.planDate')}
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
  content: { paddingHorizontal: SHEET_PADDING, paddingTop: 4, flexShrink: 1 },
  shrink: { flexShrink: 1 },
  fill: { width: '100%', height: '100%' },
  disabled: { opacity: 0.6 },
  // Form — title `text-2xl font-extrabold mb-6`, icon box `p-2.5 rounded-xl mr-4`
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  formTitleIcon: { padding: 10, borderRadius: 12 },
  formTitle: { fontSize: 24, lineHeight: 32, fontWeight: '800', flexShrink: 1 },
  formBody: { gap: 20 },
  field: { gap: 8 },
  fieldTight: { gap: 6 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600', marginLeft: 4 },
  subLabel: { fontSize: 12, lineHeight: 16, fontWeight: '600', marginLeft: 4, marginBottom: 6 },
  hint: { fontSize: 11, lineHeight: 16, marginLeft: 4, marginTop: 2, flexShrink: 1 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 4 },
  hintRowText: { fontSize: 11, lineHeight: 16, flexShrink: 1 },
  motiveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  motiveBtn: {
    width: '31.5%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  motiveLabel: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  inputInner: { flex: 1, fontSize: 16, padding: 0 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  switchTexts: { flex: 1, paddingRight: 16 },
  dateRow: { flexDirection: 'row', gap: 16 },
  dateField: { flex: 1 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  dateBtnText: { fontSize: 15, fontWeight: '500', flexShrink: 1 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 4 },
  timeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 4,
  },
  timeStepBtn: { padding: 4 },
  timeValue: { fontSize: 18, fontWeight: '700', minWidth: 28, textAlign: 'center' },
  timeColon: { fontSize: 18, fontWeight: '700' },
  // `bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium`
  errorBox: { borderRadius: 12, padding: 12 },
  errorText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  // `mt-8 flex gap-3`, buttons `py-4 px-6 rounded-2xl font-bold`
  formActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  btnPrimary: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  btnSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  btnText: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  // Detail
  detailBody: { paddingBottom: 24 },
  detailTop: { gap: 16, marginBottom: 24 },
  detailHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  detailTitleArea: { flex: 1, minWidth: 0, paddingRight: 16 },
  motiveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  motiveChipText: { fontSize: 11, lineHeight: 16, fontWeight: '700' },
  detailTitle: { fontSize: 24, lineHeight: 32, fontWeight: '800' },
  detailActions: { flexDirection: 'row', borderRadius: 12, padding: 4 },
  iconBtn: { padding: 10, borderRadius: 8 },
  metaChips: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8, columnGap: 16, marginTop: 8 },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '100%',
  },
  metaChipText: { fontSize: 14, lineHeight: 20, fontWeight: '500', flexShrink: 1 },
  weatherBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  weatherBannerIcon: { padding: 8, borderRadius: 12 },
  weatherText: { flex: 1, fontSize: 14, lineHeight: 23, fontWeight: '500' },
  sectionHeader: { gap: 8, marginBottom: 16 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, lineHeight: 28, fontWeight: '700', flexShrink: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 12, lineHeight: 16, fontWeight: '700' },
  addOutfitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addOutfitText: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  dayPicker: { borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 16 },
  dayPickerLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    marginLeft: 2,
    marginBottom: 8,
  },
  dayPickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dayOption: {
    width: '48.5%',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  dayOptionFull: { opacity: 0.4 },
  dayOptionLabel: { fontSize: 14, lineHeight: 20, fontWeight: '700', textTransform: 'capitalize' },
  dayOptionMeta: { fontSize: 11, lineHeight: 16 },
  // `py-16 rounded-[32px] border-2 border-dashed`, icon `p-5 rounded-full mb-4`
  emptyPacking: {
    alignItems: 'center',
    paddingVertical: 64,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 32,
  },
  emptyPackingIcon: { padding: 20, borderRadius: 40, marginBottom: 16 },
  emptyTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  emptyHint: { fontSize: 12, lineHeight: 20, textAlign: 'center', paddingHorizontal: 32 },
  // `grid-cols-2 gap-3`, items `rounded-2xl p-2`, image `aspect-square rounded-xl mb-2.5`
  packingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  packingItem: { borderRadius: 16, padding: 8 },
  packingImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
  },
  packingName: { fontSize: 11, lineHeight: 14, fontWeight: '600', paddingHorizontal: 4 },
});

export default PlanModal;
