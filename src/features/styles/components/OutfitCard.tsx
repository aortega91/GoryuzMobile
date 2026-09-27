import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  AlertCircleIcon,
  CalendarPlusIcon,
  EyeIcon,
  FileTextIcon,
  LockIcon,
  PersonStandingIcon,
  ShirtIcon,
  StarIcon,
  TagIcon,
  TrashIcon,
} from '@assets/icons';
import { Outfit } from '../types';

interface Props {
  outfit: Outfit;
  /** Some garments are no longer in the closet. */
  hasMissingItems: boolean;
  /** The avatar is being dressed with this creation right now. */
  isDressing: boolean;
  /** Scheduling is a VIP feature — the icon shows a lock otherwise. */
  scheduleLocked: boolean;
  onOpen: () => void;
  onTags: () => void;
  onTechSheet: () => void;
  onSchedule: () => void;
  onTryOn: () => void;
  onDelete: () => void;
  onMissingItems: () => void;
}

/**
 * Grid card of a creation — two per row, same pattern as the closet (zena
 * StylistView). The whole image opens the detail; the icon row below holds the
 * actions, always visible. The tech sheet only exists on beauty designs, where
 * it takes the place of scheduling.
 */
function OutfitCard({
  outfit,
  hasMissingItems,
  isDressing,
  scheduleLocked,
  onOpen,
  onTags,
  onTechSheet,
  onSchedule,
  onTryOn,
  onDelete,
  onMissingItems,
}: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const isDesign = outfit.kind !== 'outfit';
  const isBeauty = outfit.kind === 'hair' || outfit.kind === 'nails' || outfit.kind === 'makeup';
  const items = outfit.items.slice(0, 4);

  return (
    <View style={[styles.card, { backgroundColor: s.outfitCardBackground, borderColor: s.outfitCardBorder }]}>
      <Touchable
        onPress={onOpen}
        borderRadius={0}
        accessibilityLabel={`${t('styles.detailView')}: ${outfit.name}`}
        style={[styles.media, { backgroundColor: s.outfitCardMosaicBackground }]}
      >
        {outfit.imageData ? (
          <AuthedImage data={outfit.imageData} style={StyleSheet.absoluteFill} resizeMode="contain" />
        ) : (
          <View style={[styles.mosaic, { backgroundColor: s.outfitCardBorder }]}>
            {([[0, 1], [2, 3]] as const).map(pair => (
              <View key={pair.join('-')} style={styles.mosaicRow}>
                {pair.map(i => (
                  <View key={i} style={[styles.mosaicCell, { backgroundColor: s.outfitCardBackground }]}>
                    {items[i]?.imageData ? (
                      <AuthedImage data={items[i].imageData!} style={StyleSheet.absoluteFill} resizeMode="cover" />
                    ) : items[i] ? (
                      <Text style={[styles.mosaicLabel, { color: s.emptySubtitle }]} numberOfLines={2}>
                        {items[i].name}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {outfit.source && (
          <View
            style={[
              styles.sourceBadge,
              { backgroundColor: outfit.source === 'ai' ? s.outfitCardAIBadge : s.cardSourceManualBackground },
            ]}
          >
            <Text style={[styles.sourceText, { color: s.cardSourceText }]}>
              {outfit.source === 'ai' ? t('styles.sourceAi') : t('styles.sourceManual')}
            </Text>
          </View>
        )}

        <View style={styles.topRight}>
          <View style={[styles.eyeBadge, { backgroundColor: s.cardEyeBackground }]}>
            <EyeIcon size={13} color={s.cardEyeIcon} />
          </View>
          {hasMissingItems && (
            <Touchable
              onPress={onMissingItems}
              borderRadius={12}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              accessibilityLabel={t('styles.missingItemTitle')}
              style={[styles.missingBadge, { backgroundColor: s.cardMissingBadge }]}
            >
              <AlertCircleIcon size={13} color={s.toneOnColor} />
            </Touchable>
          )}
        </View>

        {isDressing && (
          <View style={[StyleSheet.absoluteFill, styles.dressing, { backgroundColor: s.imageLoadingOverlay }]}>
            <ActivityIndicator color={s.buttonPrimary} />
          </View>
        )}
      </Touchable>

      <View style={[styles.info, { backgroundColor: s.cardInfoBackground, borderTopColor: s.outfitCardBorder }]}>
        <Text style={[styles.name, { color: s.outfitCardName }]} numberOfLines={1}>
          {outfit.name}
        </Text>
        <View style={styles.metaRow}>
          {outfit.rating ? (
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  size={10}
                  color={star <= outfit.rating! ? s.starFilled : s.starEmpty}
                  fill={star <= outfit.rating! ? s.starFilled : 'none'}
                  strokeWidth={star <= outfit.rating! ? 0 : 1.5}
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.meta, { color: s.cardMeta }]}>{t('styles.unrated')}</Text>
          )}
          {!isDesign && (
            <View style={styles.itemsCount}>
              <ShirtIcon size={10} color={s.cardMeta} />
              <Text style={[styles.meta, { color: s.cardMeta }]}>{outfit.items.length}</Text>
            </View>
          )}
        </View>
        {outfit.tags.length > 0 && (
          <View style={styles.tags}>
            {outfit.tags.slice(0, 2).map(tag => (
              <Text
                key={tag}
                numberOfLines={1}
                style={[styles.tag, { backgroundColor: s.cardTagChipBackground, color: s.cardTagChipText }]}
              >
                {tag}
              </Text>
            ))}
            {outfit.tags.length > 2 && (
              <Text style={[styles.tagMore, { color: s.cardMeta }]}>+{outfit.tags.length - 2}</Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Touchable onPress={onTags} borderRadius={8} accessibilityLabel={t('styles.actionTags')} style={styles.action}>
            <TagIcon size={15} color={s.toneTags} />
          </Touchable>
          {isBeauty ? (
            <Touchable
              onPress={onTechSheet}
              borderRadius={8}
              accessibilityLabel={t('styles.techSheetAction')}
              style={styles.action}
            >
              <FileTextIcon size={15} color={s.toneTechSheet} />
            </Touchable>
          ) : outfit.kind === 'outfit' ? (
            <Touchable
              onPress={onSchedule}
              borderRadius={8}
              accessibilityLabel={t('styles.actionSchedule')}
              style={styles.action}
            >
              {scheduleLocked ? (
                <LockIcon size={14} color={s.cardMeta} />
              ) : (
                <CalendarPlusIcon size={15} color={s.toneSchedule} />
              )}
            </Touchable>
          ) : null}
          <Touchable
            onPress={onTryOn}
            disabled={isDressing}
            borderRadius={8}
            accessibilityLabel={t('styles.tryOnAvatarAction')}
            style={styles.action}
          >
            {isDressing ? (
              <ActivityIndicator size="small" color={s.toneTechSheet} />
            ) : (
              <PersonStandingIcon size={15} color={s.toneTechSheet} />
            )}
          </Touchable>
          <Touchable onPress={onDelete} borderRadius={8} accessibilityLabel={t('styles.actionDelete')} style={styles.action}>
            <TrashIcon size={15} color={s.actionDangerText} />
          </Touchable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 12, overflow: 'hidden', borderWidth: 1 },
  media: { width: '100%', aspectRatio: 1, overflow: 'hidden' },
  mosaic: { ...StyleSheet.absoluteFillObject, gap: 1 },
  mosaicRow: { flex: 1, flexDirection: 'row', gap: 1 },
  mosaicCell: { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mosaicLabel: { fontSize: 8, fontWeight: '600', textAlign: 'center', padding: 4 },
  sourceBadge: { position: 'absolute', top: 6, left: 6, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  sourceText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4, textTransform: 'uppercase' },
  topRight: { position: 'absolute', top: 6, right: 6, alignItems: 'flex-end', gap: 5 },
  eyeBadge: { padding: 5, borderRadius: 12 },
  missingBadge: { padding: 4, borderRadius: 12 },
  dressing: { alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, paddingHorizontal: 9, paddingTop: 7, borderTopWidth: StyleSheet.hairlineWidth },
  name: { fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, gap: 4 },
  stars: { flexDirection: 'row', gap: 1 },
  meta: { fontSize: 10 },
  itemsCount: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 5 },
  tag: {
    maxWidth: '100%',
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tagMore: { fontSize: 9, fontWeight: '700', paddingVertical: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 'auto', paddingTop: 4, paddingBottom: 4 },
  action: { flex: 1, minHeight: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
});

export default OutfitCard;
