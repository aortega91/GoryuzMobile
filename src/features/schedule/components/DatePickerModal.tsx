import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import Touchable from '@components/Touchable';
import { ChevronLeftIcon, ChevronRightIcon } from '@assets/icons';

interface Props {
  visible: boolean;
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
  title?: string;
  minDate?: string;
}

function DatePickerModal({ visible, value, onChange, onClose, title, minDate }: Props) {
  const { t } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;

  const initialDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const MONTH_NAMES = [
    t('schedule.monthJan'), t('schedule.monthFeb'), t('schedule.monthMar'),
    t('schedule.monthApr'), t('schedule.monthMay'), t('schedule.monthJun'),
    t('schedule.monthJul'), t('schedule.monthAug'), t('schedule.monthSep'),
    t('schedule.monthOct'), t('schedule.monthNov'), t('schedule.monthDec'),
  ];

  const DAY_NAMES = [
    t('schedule.daySun'), t('schedule.dayMon'), t('schedule.dayTue'),
    t('schedule.dayWed'), t('schedule.dayThu'), t('schedule.dayFri'),
    t('schedule.daySat'),
  ];

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) { cells.push(null); }
  for (let d = 1; d <= daysInMonth; d++) { cells.push(d); }
  while (cells.length % 7 !== 0) { cells.push(null); }

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else { setViewMonth(m => m - 1); }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else { setViewMonth(m => m + 1); }
  };

  const toDayStr = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${viewYear}-${mm}-${dd}`;
  };

  const isDisabled = (day: number) => !!minDate && toDayStr(day) < minDate;

  const handleSelectDay = (day: number) => {
    if (isDisabled(day)) { return; }
    onChange(toDayStr(day));
    onClose();
  };

  const isToday = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    return d.toDateString() === today.toDateString();
  };

  const isSelected = (day: number) => {
    if (!selectedDate) { return false; }
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: s.modalBackdrop }]} onPress={onClose}>
        <Pressable style={[styles.card, { backgroundColor: s.calendarBackground }]} onPress={() => {}}>
          {title && (
            <Text style={[styles.title, { color: s.modalTitle }]}>{title}</Text>
          )}
          <View style={styles.header}>
            <Touchable onPress={handlePrevMonth} hitSlop={8}>
              <ChevronLeftIcon size={20} color={s.calendarNavIcon} />
            </Touchable>
            <Text style={[styles.monthLabel, { color: s.calendarHeaderText }]}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </Text>
            <Touchable onPress={handleNextMonth} hitSlop={8}>
              <ChevronRightIcon size={20} color={s.calendarNavIcon} />
            </Touchable>
          </View>

          <View style={styles.dayNamesRow}>
            {DAY_NAMES.map((d, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Text key={`dn-${i}`} style={[styles.dayName, { color: s.calendarDayOtherMonth }]}>
                {d}
              </Text>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, i) => {
              if (!day) {
                // eslint-disable-next-line react/no-array-index-key
                return <View key={`empty-${i}`} style={styles.cell} />;
              }
              const selected = isSelected(day);
              const todayDay = isToday(day);
              const disabled = isDisabled(day);
              let bg = 'transparent';
              let textColor = disabled ? s.calendarDayOtherMonth : s.calendarDayText;
              if (!disabled && selected) {
                bg = s.calendarDaySelected;
                textColor = s.calendarDaySelectedText;
              } else if (!disabled && todayDay) {
                bg = s.calendarDayToday;
                textColor = s.calendarDayTodayText;
              }
              return (
                <Touchable
                  key={`day-${day}`}
                  onPress={() => handleSelectDay(day)}
                  borderRadius={20}
                  style={[styles.cell, disabled && styles.cellDisabled]}
                >
                  <View style={[styles.dayCircle, { backgroundColor: bg }]}>
                    <Text style={[styles.dayText, { color: textColor }]}>{day}</Text>
                  </View>
                </Touchable>
              );
            })}
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 340, borderRadius: 20, padding: 20 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthLabel: { fontSize: 15, fontWeight: '600' },
  dayNamesRow: { flexDirection: 'row', marginBottom: 8 },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: { fontSize: 13, fontWeight: '500' },
  cellDisabled: { opacity: 0.35 },
});

export default DatePickerModal;
