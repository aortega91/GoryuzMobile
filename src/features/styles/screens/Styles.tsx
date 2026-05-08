import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  ShirtIcon,
  SparklesIcon,
  StarIcon,
  PlusCircleIcon,
} from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import { addCalendarEvent } from '@features/schedule/api/calendarApi';

import {
  loadOutfits,
  loadClosetItems,
  addOutfit,
  editOutfit,
  removeOutfit,
} from '../stylesSlice';
import { Outfit } from '../types';
import OutfitActionSheet from '../components/OutfitActionSheet';
import RenameOutfitSheet from '../components/RenameOutfitSheet';
import RateOutfitSheet from '../components/RateOutfitSheet';
import TagSheet from '../components/TagSheet';
import ScheduleOutfitSheet from '../components/ScheduleOutfitSheet';
import OutfitCreator from '../components/OutfitCreator';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'outfits' | 'creator' | 'essence';
type Sheet = 'action' | 'rename' | 'rate' | 'tags' | 'schedule' | null;

// ─── Outfit card (portrait, native fashion-app style) ─────────────────────────

interface OutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

function OutfitCard({ outfit, onPress }: OutfitCardProps) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  const images = outfit.imageData
    ? [outfit.imageData]
    : (outfit.items.slice(0, 4).map(i => i.imageData).filter(Boolean) as string[]);

  const isAI = outfit.source === 'ai';
  const badgeStyle = { backgroundColor: isAI ? s.outfitCardAIBadge : s.outfitCardSourceBadge };
  const badgeTextStyle = { color: isAI ? s.outfitCardAIText : s.outfitCardSourceText };

  return (
    <Touchable onPress={onPress} borderRadius={14} style={styles.card}>
      {/* Portrait image area */}
      <View style={[styles.cardImage, { backgroundColor: s.outfitCardMosaicBackground }]}>
        {images.length === 0 ? (
          <View style={styles.cardImagePlaceholder}>
            <ShirtIcon size={36} color={s.emptyIcon} />
          </View>
        ) : images.length === 1 ? (
          <Image source={{ uri: images[0] }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.mosaic}>
            {[0, 1, 2, 3].map(i => (
              images[i] ? (
                <Image key={images[i]} source={{ uri: images[i] }} style={styles.mosaicCell} resizeMode="cover" />
              ) : (
                <View key={i} style={[styles.mosaicCell, { backgroundColor: s.outfitCardMosaicBackground }]} />
              )
            ))}
          </View>
        )}

        {/* Source badge — top right */}
        <View style={[styles.sourceBadge, badgeStyle]}>
          <Text style={[styles.sourceBadgeText, badgeTextStyle]}>
            {isAI ? 'IA' : t('styles.sourceManual')}
          </Text>
        </View>

        {/* Tags — top left */}
        {outfit.tags.length > 0 && (
          <View style={styles.tagsOverlay}>
            {outfit.tags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gradient-like overlay at bottom */}
        <View style={styles.overlay}>
          <Text style={styles.overlayName} numberOfLines={1}>
            {outfit.name}
          </Text>
          {outfit.rating != null && (
            <View style={styles.overlayStars}>
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon
                  key={star}
                  size={9}
                  color={star <= outfit.rating! ? '#F5C842' : 'rgba(255,255,255,0.35)'}
                  strokeWidth={0}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </Touchable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

function Styles() {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const outfits = useSelector((state: RootState) => state.styles.outfits);
  const closetItems = useSelector((state: RootState) => state.styles.closetItems);
  const outfitsStatus = useSelector((state: RootState) => state.styles.outfitsStatus);
  const closetStatus = useSelector((state: RootState) => state.styles.closetStatus);

  const [activeTab, setActiveTab] = useState<Tab>('outfits');
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [creatorSaving, setCreatorSaving] = useState(false);

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (outfitsStatus === 'idle') dispatch(loadOutfits());
    if (closetStatus === 'idle') dispatch(loadClosetItems());
  }, [dispatch, outfitsStatus, closetStatus]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const allTags = useMemo(
    () => Array.from(new Set(outfits.flatMap(o => o.tags))).sort(),
    [outfits],
  );

  const filteredOutfits = useMemo(() => {
    let result = outfits;
    if (tagFilter) result = result.filter(o => o.tags.includes(tagFilter));
    if (starFilter) result = result.filter(o => o.rating === starFilter);
    return result;
  }, [outfits, tagFilter, starFilter]);

  const hasActiveFilter = tagFilter != null || starFilter != null;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const openAction = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setActiveSheet('action');
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setSelectedOutfit(null);
    setSheetLoading(false);
  }, []);

  const handleRename = async (name: string) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    await dispatch(editOutfit({ id: selectedOutfit.id, name }));
    closeSheet();
  };

  const handleRate = async (rating: number | null) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    await dispatch(editOutfit({ id: selectedOutfit.id, rating }));
    closeSheet();
  };

  const handleTagsSave = async (tags: string[]) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    await dispatch(editOutfit({ id: selectedOutfit.id, tags }));
    closeSheet();
  };

  const handleSchedule = async (date: string) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    try {
      await addCalendarEvent({ date, outfitId: selectedOutfit.id });
    } finally {
      closeSheet();
    }
  };

  const handleDelete = async () => {
    if (!selectedOutfit) return;
    await dispatch(removeOutfit(selectedOutfit.id));
    closeSheet();
  };

  const handleCreatorSave = async (name: string, itemIds: string[]) => {
    setCreatorSaving(true);
    await dispatch(addOutfit({ name, itemIds }));
    setCreatorSaving(false);
    setActiveTab('outfits');
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const renderOutfitsTab = () => (
    <View style={styles.tabContent}>
      {/* Single compact filter row: "Todos" + tag chips + star chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersRow}
      >
        {/* Clear all */}
        <Touchable
          onPress={() => { setTagFilter(null); setStarFilter(null); }}
          borderRadius={20}
          style={[
            styles.filterChip,
            { backgroundColor: !hasActiveFilter ? s.tagActiveBackground : s.tagBackground },
          ]}
        >
          <Text style={[styles.filterChipText, { color: !hasActiveFilter ? s.tagActiveText : s.tagText }]}>
            {t('styles.filterAll')}
          </Text>
        </Touchable>

        {/* Tag chips */}
        {allTags.length > 0 && (
          <>
            <View style={[styles.filterSep, { backgroundColor: s.tagBackground }]} />
            {allTags.map(tag => (
              <Touchable
                key={tag}
                onPress={() => setTagFilter(tagFilter === tag ? null : tag)}
                borderRadius={20}
                style={[
                  styles.filterChip,
                  { backgroundColor: tagFilter === tag ? s.tagActiveBackground : s.tagBackground },
                ]}
              >
                <Text style={[styles.filterChipText, { color: tagFilter === tag ? s.tagActiveText : s.tagText }]}>
                  {tag}
                </Text>
              </Touchable>
            ))}
          </>
        )}

        {/* Star chips */}
        <View style={[styles.filterSep, { backgroundColor: s.tagBackground }]} />
        {[5, 4, 3, 2, 1].map(star => (
          <Touchable
            key={star}
            onPress={() => setStarFilter(starFilter === star ? null : star)}
            borderRadius={20}
            style={[
              styles.filterChip,
              styles.filterChipStar,
              { backgroundColor: starFilter === star ? s.tagActiveBackground : s.tagBackground },
            ]}
          >
            <StarIcon
              size={11}
              color={starFilter === star ? s.tagActiveText : s.starFilled}
              strokeWidth={0}
            />
            <Text style={[styles.filterChipText, { color: starFilter === star ? s.tagActiveText : s.tagText }]}>
              {star}
            </Text>
          </Touchable>
        ))}
      </ScrollView>

      {/* Grid */}
      {outfitsStatus === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={s.buttonPrimary} />
        </View>
      ) : filteredOutfits.length === 0 ? (
        <View style={styles.center}>
          <ShirtIcon size={52} color={s.emptyIcon} />
          <Text style={[styles.emptyText, { color: s.emptyText }]}>{t('styles.emptyTitle')}</Text>
          <Text style={[styles.emptySub, { color: s.emptySubtitle }]}>{t('styles.emptySubtitle')}</Text>
          <Touchable
            onPress={() => setActiveTab('creator')}
            borderRadius={14}
            style={[styles.emptyBtn, { backgroundColor: s.buttonPrimary }]}
          >
            <PlusCircleIcon size={16} color={s.buttonPrimaryText} />
            <Text style={[styles.emptyBtnText, { color: s.buttonPrimaryText }]}>
              {t('styles.createFirst')}
            </Text>
          </Touchable>
        </View>
      ) : (
        <FlatList
          data={filteredOutfits}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OutfitCard outfit={item} onPress={() => openAction(item)} />
          )}
        />
      )}
    </View>
  );

  const renderCreatorTab = () => (
    <OutfitCreator
      closetItems={closetItems}
      closetLoading={closetStatus === 'loading'}
      saving={creatorSaving}
      onSave={handleCreatorSave}
    />
  );

  const renderEssenceTab = () => (
    <View style={styles.center}>
      <SparklesIcon size={52} color={s.emptyIcon} />
      <Text style={[styles.emptyText, { color: s.emptyText }]}>{t('styles.essenceTitle')}</Text>
      <Text style={[styles.emptySub, { color: s.emptySubtitle }]}>{t('styles.essenceSubtitle')}</Text>
    </View>
  );

  const TABS: { key: Tab; label: string }[] = [
    { key: 'outfits', label: t('styles.tabOutfits') },
    { key: 'creator', label: t('styles.tabCreator') },
    { key: 'essence', label: t('styles.tabEssence') },
  ];

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: s.headerTitle }]}>{t('styles.title')}</Text>
        <Touchable
          onPress={() => setActiveTab('creator')}
          hitSlop={8}
          borderRadius={10}
          style={[styles.addBtn, { backgroundColor: s.tabActive }]}
        >
          <PlusCircleIcon size={16} color={s.tabActiveText} />
          <Text style={[styles.addBtnText, { color: s.tabActiveText }]}>
            {t('styles.createShort')}
          </Text>
        </Touchable>
      </View>

      {/* Tab bar */}
      <View
        style={[
          styles.tabBar,
          { backgroundColor: s.tabBackground, borderBottomColor: s.tabBorder },
        ]}
      >
        {TABS.map(tab => (
          <Touchable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            borderRadius={8}
            style={[styles.tabBtn, activeTab === tab.key && { backgroundColor: s.tabActive }]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === tab.key ? s.tabActiveText : s.tabInactiveText },
              ]}
            >
              {tab.label}
            </Text>
          </Touchable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'outfits' && renderOutfitsTab()}
      {activeTab === 'creator' && renderCreatorTab()}
      {activeTab === 'essence' && renderEssenceTab()}

      {/* Sheets */}
      {activeSheet === 'action' && selectedOutfit && (
        <OutfitActionSheet
          outfit={selectedOutfit}
          onClose={closeSheet}
          onSchedule={() => { setActiveSheet('schedule'); }}
          onShare={() => { closeSheet(); }}
          onTags={() => { setActiveSheet('tags'); }}
          onRename={() => { setActiveSheet('rename'); }}
          onRate={() => { setActiveSheet('rate'); }}
          onDelete={handleDelete}
        />
      )}

      {activeSheet === 'rename' && selectedOutfit && (
        <RenameOutfitSheet
          currentName={selectedOutfit.name}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleRename}
        />
      )}

      {activeSheet === 'rate' && selectedOutfit && (
        <RateOutfitSheet
          currentRating={selectedOutfit.rating}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleRate}
        />
      )}

      {activeSheet === 'tags' && selectedOutfit && (
        <TagSheet
          currentTags={selectedOutfit.tags}
          allTags={allTags}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleTagsSave}
        />
      )}

      {activeSheet === 'schedule' && selectedOutfit && (
        <ScheduleOutfitSheet
          outfit={selectedOutfit}
          loading={sheetLoading}
          onClose={closeSheet}
          onSchedule={handleSchedule}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CARD_GAP = 10;

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, flex: 1 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { fontSize: 12, fontWeight: '700' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabBtnText: { fontSize: 11, fontWeight: '700' },
  tabContent: { flex: 1 },

  // Filters — single compact row
  filtersRow: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 7,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterChipStar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  filterSep: { width: 1, height: 16, borderRadius: 1, opacity: 0.4 },

  // Outfit grid
  gridContent: { paddingHorizontal: CARD_GAP, paddingBottom: 32 },
  gridRow: { gap: CARD_GAP, marginBottom: CARD_GAP },

  // Portrait card
  card: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  cardImage: {
    aspectRatio: 3 / 4,
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosaic: { ...StyleSheet.absoluteFillObject, flexDirection: 'row', flexWrap: 'wrap' },
  mosaicCell: { width: '50%', height: '50%' },

  // Overlay elements on the card
  sourceBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  sourceBadgeText: { fontSize: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  tagsOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 4,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tagChipText: { fontSize: 8, fontWeight: '700', color: '#1B2A4A' },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.48)',
    paddingHorizontal: 10,
    paddingTop: 24,
    paddingBottom: 10,
  },
  overlayName: { color: '#fff', fontSize: 12, fontWeight: '700' },
  overlayStars: { flexDirection: 'row', gap: 2, marginTop: 3 },

  // Empty / loading
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 13, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700' },
});

export default Styles;
