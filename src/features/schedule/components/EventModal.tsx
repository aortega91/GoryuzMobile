import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import { TrashIcon, CalendarIcon, RefreshCwIcon } from '@assets/icons';
import { CalendarEvent, Occasion } from '../types';
import { localeFor } from '../dates';
import DatePickerModal from './DatePickerModal';

interface Props {
  event: CalendarEvent;
  onClose: () => void;
  onRemove: (eventId: string) => void;
  onMove: (eventId: string, newDate: string) => void;
  onChangeOutfit: () => void;
}

const OCCASION_KEYS: Record<Occasion, string> = {
  work: 'schedule.occasionWork',
  casual: 'schedule.occasionCasual',
  date: 'schedule.occasionDate',
  party: 'schedule.occasionParty',
  sport: 'schedule.occasionSport',
  travel: 'schedule.occasionTravel',
  home: 'schedule.occasionHome',
};

/** Sheet padding (zena `p-6`) and the garment grid's `gap-3`. */
const SHEET_PADDING = 24;
const GRID_GAP = 12;

/**
 * zena's CalendarEventModal at phone width: calendar icon + "Outfit for …"
 * title, occasion pill and weather snapshot, a 3-column grid of the garments
 * and Move / Remove side by side. "Change outfit" is app-only (it has no zena
 * counterpart) and sits below them with the same muted style.
 */
function EventModal({ event, onClose, onRemove, onMove, onChangeOutfit }: Props) {
  const { t, i18n } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const { width } = useWindowDimensions();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const itemSize = (width - SHEET_PADDING * 2 - GRID_GAP * 2) / 3;

  const formattedDate = new Date(`${event.date}T12:00:00`).toLocaleDateString(localeFor(i18n.language), {
    day: 'numeric',
    month: 'long',
  });

  const handleRemove = () => {
    onRemove(event.id);
    onClose();
  };

  const handleMove = (newDate: string) => {
    onMove(event.id, newDate);
    onClose();
  };

  const items = event.outfit?.items ?? [];

  return (
    <>
      <BottomSheet onClose={onClose} backgroundColor={s.modalBackground}>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={[styles.titleIcon, { backgroundColor: s.headerSecondaryBackground }]}>
              <CalendarIcon size={20} color={s.linkText} />
            </View>
            <Text style={[styles.title, { color: s.modalTitle }]}>
              {t('schedule.eventTitle', { date: formattedDate })}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <View style={[styles.occasionPill, { backgroundColor: s.occasionChipBackground }]}>
              <Text style={[styles.metaText, { color: s.occasionChipText }]}>
                {t(event.occasion ? OCCASION_KEYS[event.occasion] : 'schedule.occasionUnspecified')}
              </Text>
            </View>
            {!!event.weatherSnapshot && (
              <Text style={[styles.metaText, { color: s.emptyText }]}>{event.weatherSnapshot}</Text>
            )}
          </View>

          {items.length > 0 && (
            <ScrollView style={styles.itemsScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.itemsGrid}>
                {items.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.item,
                      { width: itemSize, height: itemSize, borderColor: s.dayTileBorder },
                    ]}
                  >
                    {item.imageData ? (
                      <AuthedImage data={item.imageData} style={styles.fill} resizeMode="cover" />
                    ) : (
                      <View style={[styles.fill, { backgroundColor: s.dayTileBackground }]} />
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View style={styles.actions}>
            <View style={styles.row}>
              <Touchable
                onPress={() => setShowDatePicker(true)}
                borderRadius={16}
                style={[styles.actionBtn, styles.half, { backgroundColor: s.mutedButtonBackground }]}
              >
                <CalendarIcon size={16} color={s.mutedButtonText} />
                <Text style={[styles.actionText, { color: s.mutedButtonText }]}>
                  {t('schedule.moveDate')}
                </Text>
              </Touchable>

              <Touchable
                onPress={handleRemove}
                borderRadius={16}
                style={[styles.actionBtn, styles.half, { backgroundColor: s.buttonDanger }]}
              >
                <TrashIcon size={16} color={s.buttonDangerText} />
                <Text style={[styles.actionText, { color: s.buttonDangerText }]}>
                  {t('schedule.removeEvent')}
                </Text>
              </Touchable>
            </View>

            <Touchable
              onPress={onChangeOutfit}
              borderRadius={16}
              style={[styles.actionBtn, { backgroundColor: s.mutedButtonBackground }]}
            >
              <RefreshCwIcon size={16} color={s.mutedButtonText} />
              <Text style={[styles.actionText, { color: s.mutedButtonText }]}>
                {t('schedule.changeOutfit')}
              </Text>
            </Touchable>
          </View>
        </View>
      </BottomSheet>

      <DatePickerModal
        visible={showDatePicker}
        value={event.date}
        onChange={handleMove}
        onClose={() => setShowDatePicker(false)}
        title={t('schedule.selectNewDate')}
      />
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: SHEET_PADDING, paddingTop: 8, flexShrink: 1 },
  fill: { width: '100%', height: '100%' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  titleIcon: { padding: 8, borderRadius: 12 },
  title: { flex: 1, fontSize: 18, lineHeight: 22, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 4, marginBottom: 16 },
  occasionPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaText: {
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsScroll: { flexShrink: 1 },
  itemsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: GRID_GAP },
  item: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  actions: { marginTop: 24, gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionText: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
});

export default EventModal;
