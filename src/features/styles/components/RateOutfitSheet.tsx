import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { StarIcon } from '@assets/icons';

interface RateOutfitSheetProps {
  currentRating: number | null;
  loading: boolean;
  onClose: () => void;
  onSave: (rating: number | null) => void;
}

function RateOutfitSheet({
  currentRating,
  loading,
  onClose,
  onSave,
}: RateOutfitSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const [rating, setRating] = useState<number | null>(currentRating);

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.45}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: s.modalTitle }]}>{t('styles.rateTitle')}</Text>
        <Text style={[styles.subtitle, { color: s.modalSubtitle }]}>{t('styles.rateSubtitle')}</Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map(star => (
            <Touchable
              key={star}
              onPress={() => setRating(prev => (prev === star ? null : star))}
              hitSlop={8}
              borderRadius={24}
              style={styles.starBtn}
            >
              <StarIcon
                size={36}
                color={rating != null && star <= rating ? s.starFilled : s.starEmpty}
                fill={rating != null && star <= rating ? s.starFilled : 'none'}
                strokeWidth={rating != null && star <= rating ? 0 : 1.5}
              />
            </Touchable>
          ))}
        </View>

        <Touchable
          onPress={() => onSave(rating)}
          borderRadius={14}
          disabled={loading}
          style={[styles.saveBtn, { backgroundColor: s.buttonPrimary }, loading && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={s.buttonPrimaryText} size="small" />
          ) : (
            <Text style={[styles.saveBtnText, { color: s.buttonPrimaryText }]}>
              {t('styles.rateSave')}
            </Text>
          )}
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  subtitle: { fontSize: 13, marginBottom: 24 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 28 },
  starBtn: { padding: 4 },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});

export default RateOutfitSheet;
