import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  ArrowRightIcon,
  PaletteIcon,
  RefreshCwIcon,
  ShirtIcon,
  SparklesIcon,
  ThumbsDownIcon,
} from '@assets/icons';
import { ClothingItem } from '@features/collection/types';
import { SEASON_PALETTES, type PaletteColor } from '../../colorimetry/constants';
import { colorDistance, hexToRgb, rgbToLab, type SeasonKey } from '../../colorimetry/colorimetry';
import { colorName, reasonText, seasonLabel, seasonVibe } from '../../colorimetry/labels';
import type { ColorimetryProfile } from '../../colorimetry/types';
import { useGarmentColors } from '../../colorimetry/useGarmentColors';

interface Props {
  profile: ColorimetryProfile;
  closet: ClothingItem[];
  onRedo: () => void;
  /** Absent when the host cannot navigate to the closet: the link is hidden. */
  onGoToCloset?: () => void;
}

/**
 * Port of zena's ColorimetryResults: the season, what was measured and the
 * palette. Tapping a colour crosses it with the closet by perceptual distance.
 */
function ColorimetryResults({ profile, closet, onRedo, onGoToCloset }: Props) {
  const { t } = useTranslation();
  const c = useStylesTheme().colorimetry;
  const [selected, setSelected] = useState<PaletteColor | null>(null);
  const [wantsColors, setWantsColors] = useState(false);

  const palette = SEASON_PALETTES[profile.season as SeasonKey] ?? SEASON_PALETTES.softSummer;
  const paletteKey = SEASON_PALETTES[profile.season as SeasonKey] ? profile.season : 'softSummer';
  const { colors: garmentColors, measuring } = useGarmentColors(closet, wantsColors);

  /** Closet garments sorted by closeness to the chosen colour. */
  const matches = useMemo(() => {
    if (!selected) return [];
    const target = hexToRgb(selected.hex);
    if (!target) return [];
    const targetLab = rgbToLab(target);

    return closet
      .map(item => {
        const lab = garmentColors.get(item.id);
        if (!lab) return null;
        // `colorDistance` already decides whether the garment belongs to this
        // range: `null` when it does not.
        const distance = colorDistance(targetLab, lab);
        return distance === null ? null : { item, distance };
      })
      .filter((m): m is { item: ClothingItem; distance: number } => !!m)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [selected, closet, garmentColors]);

  const facts = [
    { label: t('styles.colorimetry.factUndertone'), value: t(`styles.colorimetry.undertoneValue.${profile.undertone}`) },
    { label: t('styles.colorimetry.factDepth'), value: t(`styles.colorimetry.depthValue.${profile.depth}`) },
    { label: t('styles.colorimetry.factContrast'), value: t(`styles.colorimetry.contrastValue.${profile.contrast}`) },
    { label: t('styles.colorimetry.factConfidence'), value: `${Math.round(profile.confidence * 100)}%` },
  ];

  const tipBlocks = [
    { key: 'makeup', title: t('styles.colorimetry.makeup'), tips: profile.makeup, Icon: SparklesIcon },
    { key: 'clothing', title: t('styles.colorimetry.clothing'), tips: profile.clothing, Icon: ShirtIcon },
  ].filter(block => block.tips.length > 0);

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { backgroundColor: c.heroBackground, borderColor: c.heroBorder }]}>
        <Text style={[styles.heroEyebrow, { color: c.heroEyebrow }]}>{t('styles.colorimetry.yourSeason')}</Text>
        <Text style={[styles.heroTitle, { color: c.heroTitle }]}>{seasonLabel(t, paletteKey, palette.label)}</Text>
        <Text style={[styles.heroVibe, { color: c.heroVibe }]}>{seasonVibe(t, paletteKey, palette.vibe)}</Text>
        <Text style={[styles.heroSummary, { color: c.heroSummary }]}>{profile.summary}</Text>
      </View>

      {/* What was measured, in view: it is what backs the result. */}
      <View style={styles.factsGrid}>
        {facts.map(fact => (
          <View key={fact.label} style={[styles.fact, { backgroundColor: c.factBackground, borderColor: c.factBorder }]}>
            <Text style={[styles.factLabel, { color: c.factLabel }]}>{fact.label}</Text>
            <Text style={[styles.factValue, { color: c.factValue }]}>{fact.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.skinRow, { backgroundColor: c.factBackground, borderColor: c.factBorder }]}>
        <View style={[styles.skinDot, { backgroundColor: profile.skinHex, borderColor: c.swatchBorder }]} />
        <View style={styles.flex}>
          <Text style={[styles.factLabel, { color: c.factLabel }]}>{t('styles.colorimetry.skinMeasured')}</Text>
          {profile.reasons[0] ? (
            <Text style={[styles.skinReason, { color: c.stepText }]} numberOfLines={1}>
              {reasonText(t, profile.reasons[0])}
            </Text>
          ) : null}
        </View>
      </View>

      <View>
        <View style={styles.sectionHead}>
          <PaletteIcon size={16} color={c.favorIcon} />
          <Text style={[styles.sectionTitle, { color: c.sectionHeading }]}>{t('styles.colorimetry.favor')}</Text>
        </View>
        <Text style={[styles.hint, { color: c.hint }]}>{t('styles.colorimetry.favorHint')}</Text>
        <View style={styles.swatchGrid}>
          {palette.favor.map(color => (
            <Touchable
              key={color.hex}
              onPress={() => {
                setWantsColors(true);
                setSelected(color);
              }}
              borderRadius={12}
              accessibilityLabel={colorName(t, color.name)}
              style={styles.swatchCell}
            >
              <View style={[styles.swatch, { backgroundColor: color.hex, borderColor: c.swatchBorder }]} />
              <Text style={[styles.swatchName, { color: c.swatchName }]}>{colorName(t, color.name)}</Text>
            </Touchable>
          ))}
        </View>
      </View>

      <View>
        <View style={styles.sectionHead}>
          <ThumbsDownIcon size={16} color={c.avoidIcon} />
          <Text style={[styles.sectionTitle, { color: c.sectionHeading }]}>{t('styles.colorimetry.avoid')}</Text>
        </View>
        <View style={styles.chips}>
          {palette.avoid.map(color => (
            <View key={color.hex} style={[styles.chip, { borderColor: c.avoidChipBorder }]}>
              <View style={[styles.chipDot, { backgroundColor: color.hex, borderColor: c.swatchBorder }]} />
              <Text style={[styles.chipText, { color: c.avoidChipText }]}>{colorName(t, color.name)}</Text>
            </View>
          ))}
        </View>
      </View>

      {tipBlocks.map(block => (
        <View key={block.key} style={[styles.tipCard, { backgroundColor: c.factBackground, borderColor: c.factBorder }]}>
          <View style={styles.tipHead}>
            <block.Icon size={14} color={c.sectionHeading} />
            <Text style={[styles.tipTitle, { color: c.sectionHeading }]}>{block.title}</Text>
          </View>
          {block.tips.map((tip, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <View key={i} style={styles.tipRow}>
              <Text style={[styles.tipText, { color: c.tipBullet }]}>·</Text>
              <Text style={[styles.tipText, styles.flex, { color: c.tipText }]}>{tip}</Text>
            </View>
          ))}
        </View>
      ))}

      <Touchable onPress={onRedo} borderRadius={12} style={[styles.redoBtn, { backgroundColor: c.neutralButtonBackground }]}>
        <RefreshCwIcon size={15} color={c.ghostButtonText} />
        <Text style={[styles.redoText, { color: c.ghostButtonText }]}>{t('styles.colorimetry.redo')}</Text>
      </Touchable>

      {/* Colour detail: what you own in that range. */}
      {selected && (
        <BottomSheet onClose={() => setSelected(null)} backgroundColor={c.sheetBackground} backdropColor={c.sheetBackdrop}>
          <View style={[styles.sheetHead, { borderBottomColor: c.sheetBorder }]}>
            <View style={[styles.sheetSwatch, { backgroundColor: selected.hex, borderColor: c.swatchBorder }]} />
            <View style={styles.flex}>
              <Text style={[styles.sheetName, { color: c.sheetName }]} numberOfLines={1}>
                {colorName(t, selected.name)}
              </Text>
              <Text style={[styles.sheetHex, { color: c.sheetHex }]}>{selected.hex.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.sheetBody}>
            {matches.length > 0 ? (
              <>
                <Text style={[styles.matchesTitle, { color: c.emptyText }]}>{t('styles.colorimetry.matchesTitle')}</Text>
                <View style={styles.matchGrid}>
                  {matches.map(({ item }) => (
                    <View
                      key={item.id}
                      style={[styles.matchCard, { backgroundColor: c.matchCardBackground, borderColor: c.matchCardBorder }]}
                    >
                      <View style={styles.matchImageWrap}>
                        <AuthedImage data={item.imageData} style={styles.matchImage} resizeMode="contain" />
                      </View>
                      <Text style={[styles.matchName, { color: c.matchName }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                    </View>
                  ))}
                </View>
                {measuring && <ActivityIndicator color={c.spinner} style={styles.moreSpinner} />}
              </>
            ) : measuring ? (
              <View style={styles.emptyWrap}>
                <ActivityIndicator color={c.spinner} />
                <Text style={[styles.emptyText, { color: c.emptyText }]}>{t('styles.colorimetry.matchesLoading')}</Text>
              </View>
            ) : (
              <View style={styles.emptyWrap}>
                <ShirtIcon size={32} color={c.emptyIcon} />
                <Text style={[styles.emptyText, { color: c.emptyText }]}>{t('styles.colorimetry.matchesEmpty')}</Text>
                {onGoToCloset && (
                  <Touchable
                    onPress={() => {
                      setSelected(null);
                      onGoToCloset();
                    }}
                    borderRadius={8}
                    style={styles.linkBtn}
                  >
                    <Text style={[styles.linkText, { color: c.link }]}>{t('styles.colorimetry.goToCloset')}</Text>
                    <ArrowRightIcon size={14} color={c.link} />
                  </Touchable>
                )}
              </View>
            )}
          </View>
        </BottomSheet>
      )}
    </View>
  );
}

// zena mobile (~390 px): space-y-5, grid-cols-2 facts, grid-cols-3 swatches.
const styles = StyleSheet.create({
  root: { gap: 20 },
  flex: { flex: 1, minWidth: 0 },
  hero: { borderRadius: 16, borderWidth: 1, padding: 20 },
  heroEyebrow: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  heroTitle: { fontSize: 24, fontWeight: '700' },
  heroVibe: { fontSize: 12, marginTop: 2 },
  heroSummary: { fontSize: 14, lineHeight: 22, marginTop: 12 },
  factsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fact: { width: '48.5%', flexGrow: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  factLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  factValue: { fontSize: 14, fontWeight: '700' },
  skinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  skinDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 1 },
  skinReason: { fontSize: 12 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 11, marginBottom: 8 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchCell: { width: '31.5%', flexGrow: 1, alignItems: 'center', gap: 6 },
  swatch: { width: '100%', aspectRatio: 1, borderRadius: 12, borderWidth: 1 },
  swatchName: { fontSize: 10, textAlign: 'center', lineHeight: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingLeft: 6,
    paddingRight: 12,
    paddingVertical: 4,
  },
  chipDot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
  chipText: { fontSize: 11 },
  tipCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 6 },
  tipHead: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  tipTitle: { fontSize: 12, fontWeight: '700' },
  tipRow: { flexDirection: 'row', gap: 8 },
  tipText: { fontSize: 12, lineHeight: 17 },
  redoBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  redoText: { fontSize: 14, fontWeight: '700' },
  sheetHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetSwatch: { width: 40, height: 40, borderRadius: 12, borderWidth: 1 },
  sheetName: { fontSize: 16, fontWeight: '700' },
  sheetHex: { fontSize: 11 },
  sheetBody: { paddingHorizontal: 20, paddingVertical: 16 },
  matchesTitle: { fontSize: 12, marginBottom: 12 },
  matchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  matchCard: { width: '31.5%', borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  matchImageWrap: { aspectRatio: 1, padding: 6 },
  matchImage: { width: '100%', height: '100%' },
  matchName: { fontSize: 10, textAlign: 'center', paddingHorizontal: 4, paddingBottom: 6 },
  moreSpinner: { marginTop: 12 },
  emptyWrap: { alignItems: 'center', paddingVertical: 16, gap: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  linkBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingVertical: 4 },
  linkText: { fontSize: 14, fontWeight: '700' },
});

export default ColorimetryResults;
