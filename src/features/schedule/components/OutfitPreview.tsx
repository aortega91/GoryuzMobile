import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import AuthedImage from '@components/AuthedImage';
import useScheduleTheme from '@hooks/useScheduleTheme';
import { ShirtIcon } from '@assets/icons';
import { ScheduleOutfit } from '../types';

interface Props {
  outfit: ScheduleOutfit | null;
  style?: StyleProp<ViewStyle>;
  /** Icon size of the empty placeholder */
  placeholderSize?: number;
}

/**
 * The design's OutfitPreview: the generated look image when there is one,
 * otherwise a 2×2 collage of the outfit's first four garments.
 */
function OutfitPreview({ outfit, style, placeholderSize = 20 }: Props) {
  const theme = useScheduleTheme();
  const s = theme.schedule;

  if (outfit?.imageData) {
    return (
      <View style={[styles.wrap, style]}>
        <AuthedImage data={outfit.imageData} style={styles.fill} resizeMode="cover" />
      </View>
    );
  }

  const items = outfit?.items ?? [];
  if (!items.some(item => item.imageData)) {
    return (
      <View style={[styles.wrap, styles.center, { backgroundColor: s.eventCardBackground }, style]}>
        <ShirtIcon size={placeholderSize} color={s.emptyText} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, styles.grid, { backgroundColor: s.gridDivider }, style]}>
      {[0, 1, 2, 3].map(i => {
        const img = items[i]?.imageData;
        return (
          <View key={i} style={styles.cell}>
            <View style={[styles.cellInner, { backgroundColor: s.gridBackground }]}>
              {img ? (
                <AuthedImage data={img} style={styles.fill} resizeMode="cover" />
              ) : (
                <View style={[styles.fill, { backgroundColor: s.eventCardBackground }]} />
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  center: { alignItems: 'center', justifyContent: 'center' },
  fill: { width: '100%', height: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '50%', height: '50%', padding: 0.5 },
  cellInner: { flex: 1, overflow: 'hidden' },
});

export default OutfitPreview;
