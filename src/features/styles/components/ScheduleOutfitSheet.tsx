import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { getImageSource } from '@api/client';
import { CalendarIcon, ShirtIcon } from '@assets/icons';
import DatePickerModal from '@features/schedule/components/DatePickerModal';
import { Outfit } from '../types';

interface ScheduleOutfitSheetProps {
  outfit: Outfit;
  loading: boolean;
  onClose: () => void;
  onSchedule: (date: string) => void;
}

function ScheduleOutfitSheet({
  outfit,
  loading,
  onClose,
  onSchedule,
}: ScheduleOutfitSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [showPicker, setShowPicker] = useState(false);

  const previewImage = outfit.imageData ?? outfit.items[0]?.imageData ?? null;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <>
      <BottomSheet
        onClose={onClose}
        backgroundColor={s.modalBackground}
        backdropColor={showPicker ? 'transparent' : s.modalBackdrop}
        maxHeightRatio={0.55}
      >
        <View style={styles.container}>
          <Text style={[styles.title, { color: s.modalTitle }]}>
            {t('styles.scheduleTitle')}
          </Text>

          {/* Outfit preview */}
          <View style={[styles.outfitRow, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}>
            <View style={styles.previewThumb}>
              {previewImage ? (
                <Image
                  source={getImageSource(previewImage)}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
              ) : (
                <ShirtIcon size={24} color={s.emptyIcon} />
              )}
            </View>
            <View style={styles.outfitInfo}>
              <Text style={[styles.outfitName, { color: s.modalTitle }]} numberOfLines={1}>
                {outfit.name}
              </Text>
              <Text style={[styles.outfitItems, { color: s.modalSubtitle }]}>
                {t('styles.itemCount', { count: outfit.items.length })}
              </Text>
            </View>
          </View>

          {/* Date selector */}
          <Touchable
            onPress={() => setShowPicker(true)}
            borderRadius={12}
            style={[styles.dateBtn, { backgroundColor: s.modalInputBackground, borderColor: s.modalInputBorder }]}
          >
            <CalendarIcon size={18} color={s.buttonPrimary} />
            <Text style={[styles.dateBtnText, { color: s.modalInputText }]}>
              {formatDate(selectedDate)}
            </Text>
          </Touchable>

          {/* Confirm */}
          <Touchable
            onPress={() => onSchedule(selectedDate)}
            borderRadius={14}
            disabled={loading}
            style={[styles.confirmBtn, { backgroundColor: s.buttonPrimary }, loading && styles.btnDisabled]}
          >
            {loading ? (
              <ActivityIndicator color={s.buttonPrimaryText} size="small" />
            ) : (
              <Text style={[styles.confirmBtnText, { color: s.buttonPrimaryText }]}>
                {t('styles.scheduleConfirm')}
              </Text>
            )}
          </Touchable>
        </View>
      </BottomSheet>

      {showPicker && (
        <DatePickerModal
          visible
          value={selectedDate}
          onChange={date => {
            setSelectedDate(date);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
          title={t('styles.schedulePickDate')}
          minDate={today}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  outfitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  previewThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: { width: '100%', height: '100%' },
  outfitInfo: { flex: 1 },
  outfitName: { fontSize: 15, fontWeight: '700' },
  outfitItems: { fontSize: 12, marginTop: 2 },
  dateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  dateBtnText: { fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
  confirmBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: 15, fontWeight: '700' },
});

export default ScheduleOutfitSheet;
