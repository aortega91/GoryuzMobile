import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import { TrashIcon, CalendarIcon, RefreshCwIcon } from '@assets/icons';
import { getImageSource } from '@api/client';
import { CalendarEvent } from '../types';
import DatePickerModal from './DatePickerModal';

interface Props {
  event: CalendarEvent;
  onClose: () => void;
  onRemove: (eventId: string) => void;
  onMove: (eventId: string, newDate: string) => void;
  onChangeOutfit: () => void;
}

function EventModal({ event, onClose, onRemove, onMove, onChangeOutfit }: Props) {
  const { t } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;
  const [showDatePicker, setShowDatePicker] = useState(false);

  const formattedDate = new Date(`${event.date}T12:00:00`).toLocaleDateString('es-ES', {
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

  return (
    <>
      <BottomSheet onClose={onClose} backgroundColor={s.modalBackground}>
        <View style={styles.content}>
          <View>
            <Text style={[styles.title, { color: s.modalTitle }]}>
              {t('schedule.eventTitle', { date: formattedDate })}
            </Text>
            {event.outfit && (
              <Text style={[styles.outfitName, { color: s.buttonPrimary }]} numberOfLines={1}>
                {event.outfit.name}
              </Text>
            )}
          </View>

          {event.outfit && event.outfit.items.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {event.outfit.items.map(item => (
                <View key={item.id} style={styles.itemCard}>
                  {item.imageData ? (
                    <Image
                      source={getImageSource(item.imageData)}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.itemImage, { backgroundColor: s.emptyIcon }]} />
                  )}
                  <Text style={[styles.itemName, { color: s.emptyText }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={styles.actions}>
            <Touchable
              onPress={onChangeOutfit}
              borderRadius={12}
              style={[
                styles.actionBtn,
                { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder },
              ]}
            >
              <RefreshCwIcon size={16} color={s.buttonSecondaryText} />
              <Text style={[styles.actionText, { color: s.buttonSecondaryText }]}>
                {t('schedule.changeOutfit')}
              </Text>
            </Touchable>

            <View style={styles.row}>
              <Touchable
                onPress={() => setShowDatePicker(true)}
                borderRadius={12}
                style={[
                  styles.actionBtnHalf,
                  { backgroundColor: s.buttonSecondary, borderColor: s.buttonSecondaryBorder },
                ]}
              >
                <CalendarIcon size={16} color={s.buttonSecondaryText} />
                <Text style={[styles.actionText, { color: s.buttonSecondaryText }]}>
                  {t('schedule.moveDate')}
                </Text>
              </Touchable>

              <Touchable
                onPress={handleRemove}
                borderRadius={12}
                style={[
                  styles.actionBtnHalf,
                  { backgroundColor: s.buttonDanger, borderColor: s.buttonDangerBorder },
                ]}
              >
                <TrashIcon size={16} color={s.buttonDangerText} />
                <Text style={[styles.actionText, { color: s.buttonDangerText }]}>
                  {t('schedule.removeEvent')}
                </Text>
              </Touchable>
            </View>
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
  content: { padding: 24, paddingTop: 8, gap: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  outfitName: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  itemCard: { alignItems: 'center', marginRight: 10, width: 64 },
  itemImage: { width: 64, height: 64, borderRadius: 8, marginBottom: 4 },
  itemName: { fontSize: 9, fontWeight: '600', textAlign: 'center' },
  actions: { gap: 10 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  actionBtnHalf: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  row: { flexDirection: 'row', gap: 10 },
  actionText: { fontSize: 13, fontWeight: '600' },
});

export default EventModal;