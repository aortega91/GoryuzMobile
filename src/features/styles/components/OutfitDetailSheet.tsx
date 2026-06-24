import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import useStylesTheme from '@hooks/useStylesTheme';
import { CalendarIcon, ShirtIcon, StarIcon } from '@assets/icons';
import { Outfit } from '../types';

interface OutfitDetailSheetProps {
  outfit: Outfit;
  loading: boolean;
  onClose: () => void;
  onSave: (changes: { name: string; rating: number | null }) => void;
  onSchedule: () => void;
}

function OutfitDetailSheet({
  outfit,
  loading,
  onClose,
  onSave,
  onSchedule,
}: OutfitDetailSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const [name, setName] = useState(outfit.name);
  const [rating, setRating] = useState<number | null>(outfit.rating);

  const heroImage = outfit.imageData ?? outfit.items[0]?.imageData ?? null;

  const handleRate = (star: number) => {
    setRating(prev => (prev === star ? null : star));
  };

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.92}
    >
      <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
        <Text style={[styles.headerTitle, { color: s.modalTitle }]}>
          {t('styles.detailTitle')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero image */}
        <View style={[styles.hero, { backgroundColor: s.outfitCardMosaicBackground }]}>
          {heroImage ? (
            <AuthedImage data={heroImage} style={StyleSheet.absoluteFill} resizeMode="contain" />
          ) : (
            <ShirtIcon size={48} color={s.emptyIcon} />
          )}
        </View>

        {/* Name */}
        <Text style={[styles.label, { color: s.modalLabel }]}>
          {t('styles.detailNameLabel').toUpperCase()}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholder={t('styles.renamePlaceholder')}
          placeholderTextColor={s.essenceInputPlaceholder}
          style={[
            styles.input,
            {
              backgroundColor: s.essenceInputBackground,
              borderColor: s.essenceInputBorder,
              color: s.essenceInputText,
              opacity: loading ? 0.6 : 1,
            },
          ]}
        />

        {/* Rating */}
        <Text style={[styles.label, { color: s.modalLabel }]}>
          {t('styles.detailRatingLabel').toUpperCase()}
        </Text>
        <View style={[styles.ratingBox, { backgroundColor: s.essenceInputBackground, borderColor: s.essenceInputBorder }]}>
          {[1, 2, 3, 4, 5].map(star => {
            const filled = rating != null && star <= rating;
            return (
              <Touchable
                key={star}
                onPress={() => handleRate(star)}
                disabled={loading}
                borderRadius={20}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                style={styles.starBtn}
              >
                <StarIcon
                  size={30}
                  color={filled ? s.starFilled : s.emptyIcon}
                  fill={filled ? s.starFilled : 'none'}
                  strokeWidth={filled ? 0 : 1.5}
                />
              </Touchable>
            );
          })}
        </View>

        {/* Included items */}
        <Text style={[styles.label, { color: s.modalLabel }]}>
          {t('styles.detailItems').toUpperCase()}
        </Text>
        <View style={styles.itemsGrid}>
          {outfit.items.map((item, idx) => (
            <View
              // eslint-disable-next-line react/no-array-index-key
              key={`${item.id}-${idx}`}
              style={[styles.itemCard, { backgroundColor: s.essenceInputBackground, borderColor: s.essenceInputBorder }]}
            >
              <View style={styles.itemImageWrap}>
                {item.imageData ? (
                  <AuthedImage data={item.imageData} style={StyleSheet.absoluteFill} resizeMode="contain" />
                ) : (
                  <ShirtIcon size={22} color={s.emptyIcon} />
                )}
              </View>
              <Text style={[styles.itemName, { color: s.modalSubtitle }]} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer actions */}
      <View style={[styles.footer, { borderTopColor: s.modalBorder }]}>
        <Touchable
          onPress={onSchedule}
          disabled={loading}
          borderRadius={14}
          style={[styles.scheduleBtn, { borderColor: s.modalBorder, opacity: loading ? 0.6 : 1 }]}
        >
          <CalendarIcon size={18} color={s.modalTitle} />
          <Text style={[styles.scheduleBtnText, { color: s.modalTitle }]}>
            {t('styles.actionSchedule')}
          </Text>
        </Touchable>

        <Touchable
          onPress={() => onSave({ name: name.trim() || outfit.name, rating })}
          disabled={loading}
          borderRadius={14}
          style={[styles.saveBtn, { backgroundColor: s.buttonPrimary, opacity: loading ? 0.6 : 1 }]}
        >
          {loading ? (
            <ActivityIndicator size="small" color={s.buttonPrimaryText} />
          ) : (
            <Text style={[styles.saveBtnText, { color: s.buttonPrimaryText }]}>
              {t('styles.detailSave')}
            </Text>
          )}
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
  },
  hero: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  starBtn: {
    padding: 2,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  itemCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 8,
    alignItems: 'center',
    gap: 6,
  },
  itemImageWrap: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: 11, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1,
  },
  scheduleBtnText: { fontSize: 14, fontWeight: '700' },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});

export default OutfitDetailSheet;
