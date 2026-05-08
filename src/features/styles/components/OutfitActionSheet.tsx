import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  CalendarIcon,
  Share2Icon,
  SparklesIcon,
  PencilIcon,
  TrashIcon,
  ShirtIcon,
  StarIcon,
} from '@assets/icons';
import { Outfit } from '../types';

interface OutfitActionSheetProps {
  outfit: Outfit;
  onClose: () => void;
  onSchedule: () => void;
  onShare: () => void;
  onTags: () => void;
  onRename: () => void;
  onRate: () => void;
  onDelete: () => void;
}

function OutfitActionSheet({
  outfit,
  onClose,
  onSchedule,
  onShare,
  onTags,
  onRename,
  onRate,
  onDelete,
}: OutfitActionSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const previewImage = outfit.imageData ?? outfit.items[0]?.imageData ?? null;

  const primaryActions = [
    {
      key: 'schedule',
      icon: <CalendarIcon size={20} color={s.actionIcon} />,
      label: t('styles.actionSchedule'),
      onPress: onSchedule,
    },
    {
      key: 'share',
      icon: <Share2Icon size={20} color={s.actionIcon} />,
      label: t('styles.actionShare'),
      onPress: onShare,
    },
    {
      key: 'tags',
      icon: <SparklesIcon size={20} color={s.actionIcon} />,
      label: t('styles.actionTags'),
      onPress: onTags,
    },
    {
      key: 'rename',
      icon: <PencilIcon size={20} color={s.actionIcon} />,
      label: t('styles.actionRename'),
      onPress: onRename,
    },
    {
      key: 'rate',
      icon: <StarIcon size={20} color={s.actionIcon} />,
      label: t('styles.actionRate'),
      onPress: onRate,
    },
  ];

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.75}
    >
      <View style={styles.container}>
        {/* Outfit preview header */}
        <View style={styles.header}>
          <View style={[styles.previewThumb, { backgroundColor: s.outfitCardMosaicBackground }]}>
            {previewImage ? (
              <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <ShirtIcon size={24} color={s.emptyIcon} />
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.outfitName, { color: s.modalTitle }]} numberOfLines={1}>
              {outfit.name}
            </Text>
            <Text style={[styles.itemCount, { color: s.modalSubtitle }]}>
              {t('styles.itemCount', { count: outfit.items.length })}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: s.actionDivider }]} />

        {primaryActions.map((action, idx) => (
          <React.Fragment key={action.key}>
            {idx > 0 && <View style={[styles.divider, { backgroundColor: s.actionDivider }]} />}
            <Touchable
              onPress={() => { action.onPress(); }}
              borderRadius={0}
              style={styles.actionRow}
            >
              {action.icon}
              <Text style={[styles.actionLabel, { color: s.actionText }]}>{action.label}</Text>
            </Touchable>
          </React.Fragment>
        ))}

        <View style={[styles.divider, { backgroundColor: s.actionDivider }]} />
        <Touchable onPress={onDelete} borderRadius={0} style={styles.actionRow}>
          <TrashIcon size={20} color={s.actionDangerText} />
          <Text style={[styles.actionLabel, { color: s.actionDangerText }]}>
            {t('styles.actionDelete')}
          </Text>
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 8 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  headerInfo: { flex: 1 },
  outfitName: { fontSize: 16, fontWeight: '700' },
  itemCount: { fontSize: 12, marginTop: 2 },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: 20 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionLabel: { fontSize: 15, fontWeight: '500' },
});

export default OutfitActionSheet;
