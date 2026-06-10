import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import useScheduleTheme from '@hooks/useScheduleTheme';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import { ShirtIcon } from '@assets/icons';
import { ScheduleOutfit } from '../types';

interface Props {
  outfits: ScheduleOutfit[];
  onSelect: (outfit: ScheduleOutfit) => void;
  onClose: () => void;
}

function OutfitPickerSheet({ outfits, onSelect, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useScheduleTheme();
  const s = theme.schedule;

  return (
    <BottomSheet onClose={onClose} backgroundColor={s.modalBackground}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: s.modalTitle }]}>
          {t('schedule.pickOutfit')}
        </Text>

        {outfits.length === 0 ? (
          <View style={styles.empty}>
            <ShirtIcon size={48} color={s.emptyIcon} />
            <Text style={[styles.emptyText, { color: s.emptyText }]}>
              {t('schedule.noOutfits')}
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
            {outfits.map(outfit => (
              <Touchable
                key={outfit.id}
                onPress={() => { onSelect(outfit); onClose(); }}
                borderRadius={12}
                style={[styles.card, { backgroundColor: s.outfitCardBackground, borderColor: s.outfitCardBorder }]}
              >
                <View style={styles.imageContainer}>
                  {outfit.imageData ? (
                    <AuthedImage data={outfit.imageData} style={styles.image} resizeMode="cover" />
                  ) : outfit.items.length > 0 ? (
                    <View style={styles.grid2x2}>
                      {[0, 1, 2, 3].map(i => (
                        <View key={i} style={styles.gridCell}>
                          {outfit.items[i]?.imageData ? (
                            <AuthedImage
                              data={outfit.items[i].imageData!}
                              style={styles.gridImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={[styles.gridImage, { backgroundColor: s.emptyIcon }]} />
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder, { backgroundColor: s.emptyIcon }]}>
                      <ShirtIcon size={24} color={s.emptyText} />
                    </View>
                  )}
                </View>
                <Text style={[styles.name, { color: s.outfitCardName }]} numberOfLines={1}>
                  {outfit.name}
                </Text>
              </Touchable>
            ))}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, paddingTop: 8, gap: 16 },
  title: { fontSize: 17, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },
  card: { width: '47%', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  imageContainer: { width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%' },
  imagePlaceholder: { justifyContent: 'center', alignItems: 'center' },
  grid2x2: { flexDirection: 'row', flexWrap: 'wrap', width: '100%', height: '100%' },
  gridCell: { width: '50%', height: '50%' },
  gridImage: { width: '100%', height: '100%' },
  name: { fontSize: 12, fontWeight: '600', padding: 8 },
});

export default OutfitPickerSheet;
