import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { getImageSource } from '@api/client';
import Touchable from '@components/Touchable';
import BottomSheet from '@components/BottomSheet';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  SparklesIcon,
  StarIcon,
  ColumnsIcon,
  CrownIcon,
  FilterIcon,
  CheckIcon,
  ShirtIcon,
  ScissorsIcon,
  HandIcon,
  ArrowLeftIcon,
} from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import { addCalendarEvent } from '@features/schedule/api/calendarApi';
import { loadCollection } from '@features/collection/collectionSlice';
import HaircutCreator from '../components/HaircutCreator';
import MakeupCreator from '../components/MakeupCreator';
import NailCreator from '../components/NailCreator';
import ManualOutfitCreator from '../components/ManualOutfitCreator';
import AIOutfitCreator from '../components/AIOutfitCreator';

import {
  loadOutfits,
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

type Tab = 'looks' | 'essence' | 'runway';
type Sheet = 'action' | 'rename' | 'rate' | 'tags' | 'schedule' | null;

const BOTTOM_TAB_HEIGHT = 56;

// ─── Outfit card (portrait, native fashion-app style) ─────────────────────────

interface OutfitCardProps {
  outfit: Outfit;
  onPress: () => void;
}

function OutfitCard({ outfit, onPress }: OutfitCardProps) {
  const { styles: s } = useStylesTheme();
  const items = outfit.items.slice(0, 4);
  const isAI = outfit.source === 'ai';

  return (
    <Touchable
      onPress={onPress}
      borderRadius={16}
      style={[
        styles.card,
        { backgroundColor: s.outfitCardBackground, borderColor: s.outfitCardBorder },
      ]}
    >
      {/* Square image area */}
      <View style={[styles.cardMedia, { backgroundColor: s.outfitCardMosaicBackground }]}>
        {outfit.imageData ? (
          <Image
            source={getImageSource(outfit.imageData)}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.mosaic, { backgroundColor: s.outfitCardBorder }]}>
            {([[0, 1], [2, 3]] as const).map((pair, rowIdx) => (
              // eslint-disable-next-line react/no-array-index-key
              <View key={rowIdx} style={styles.mosaicRow}>
                {pair.map(i => (
                  <View
                    key={i}
                    style={[styles.mosaicCell, { backgroundColor: s.outfitCardBackground }]}
                  >
                    {items[i]?.imageData ? (
                      <Image
                        source={getImageSource(items[i].imageData!)}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                    ) : items[i] ? (
                      <Text
                        style={[styles.mosaicLabel, { color: s.emptySubtitle }]}
                        numberOfLines={2}
                      >
                        {items[i].name}
                      </Text>
                    ) : (
                      <View
                        style={[
                          StyleSheet.absoluteFillObject,
                          { backgroundColor: s.outfitCardMosaicBackground },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {outfit.tags.length > 0 && (
          <View style={styles.tagsOverlay}>
            {outfit.tags.slice(0, 2).map(tag => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagChipText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Info below image */}
      <View style={styles.cardInfo}>
        <View style={styles.cardRow}>
          <View style={styles.cardNameWrap}>
            <Text style={[styles.cardName, { color: s.outfitCardName }]} numberOfLines={1}>
              {outfit.name}
            </Text>
            {outfit.rating != null ? (
              <View style={styles.cardRatingRow}>
                <StarIcon size={11} color={s.starFilled} fill={s.starFilled} strokeWidth={0} />
                <Text style={[styles.cardRatingText, { color: s.emptySubtitle }]}>
                  {outfit.rating}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.sourceBadge,
              isAI
                ? { backgroundColor: s.outfitCardAIBadge, borderColor: s.outfitCardAIBadge }
                : { backgroundColor: 'transparent', borderColor: s.outfitCardBorder },
            ]}
          >
            <Text
              style={[
                styles.sourceBadgeText,
                { color: isAI ? s.outfitCardAIText : s.outfitCardSourceText },
              ]}
            >
              {isAI ? 'IA' : 'MANUAL'}
            </Text>
          </View>
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
  const outfitsStatus = useSelector((state: RootState) => state.styles.outfitsStatus);
  const closetItems = useSelector((state: RootState) => state.collection.items);
  const closetStatus = useSelector((state: RootState) => state.collection.status);
  const profile = useSelector((state: RootState) => state.profile.data);

  const [activeTab, setActiveTab] = useState<Tab>('looks');
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [filterSheet, setFilterSheet] = useState<'stars' | 'tags' | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [creatorSaving, setCreatorSaving] = useState(false);
  const [showHaircut, setShowHaircut] = useState(false);
  const [showMakeup, setShowMakeup] = useState(false);
  const [showNails, setShowNails] = useState(false);
  const [showManualCreator, setShowManualCreator] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (outfitsStatus === 'idle') dispatch(loadOutfits());
    if (closetStatus === 'idle') dispatch(loadCollection());
  }, [dispatch, outfitsStatus, closetStatus]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadOutfits());
    setRefreshing(false);
  }, [dispatch]);

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

  // Bottom bar height including safe area
  const bottomBarTotalHeight = BOTTOM_TAB_HEIGHT + insets.bottom;

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

  const handleShare = async () => {
    if (!selectedOutfit) return;
    closeSheet();
    const pieces = selectedOutfit.items.map(i => i.name).join(', ');
    await Share.share({
      title: selectedOutfit.name,
      message: pieces
        ? `${selectedOutfit.name} — ${pieces}`
        : selectedOutfit.name,
    });
  };

  const handleCreatorSave = async (name: string, itemIds: string[]) => {
    setCreatorSaving(true);
    await dispatch(addOutfit({ name, itemIds }));
    setCreatorSaving(false);
    setActiveTab('looks');
  };

  const handleManualSave = async (name: string, itemIds: string[]) => {
    setCreatorSaving(true);
    await dispatch(addOutfit({ name, itemIds }));
    setCreatorSaving(false);
    setShowManualCreator(false);
    setActiveTab('looks');
  };

  const handleAISave = async (name: string, itemIds: string[]) => {
    setCreatorSaving(true);
    await dispatch(addOutfit({ name, itemIds }));
    setCreatorSaving(false);
    setShowAICreator(false);
    setActiveTab('looks');
  };

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const starFilterLabel = starFilter != null ? `${starFilter}★` : t('styles.filterStars');
  const tagFilterLabel = tagFilter ?? t('styles.filterTags');

  const renderLooksTab = () => (
    <View style={styles.tabContent}>
      {/* Filter pills */}
      <View style={styles.filterRow}>
        <Touchable
          onPress={() => setFilterSheet('stars')}
          borderRadius={24}
          style={[
            styles.filterPill,
            starFilter != null
              ? { backgroundColor: s.filterPillActiveBackground, borderColor: s.filterPillActiveBorder }
              : { backgroundColor: s.filterPillBackground, borderColor: s.filterPillBorder },
          ]}
        >
          {starFilter == null && (
            <StarIcon
              size={15}
              color={s.filterPillText}
              strokeWidth={1.5}
            />
          )}
          <Text style={[styles.filterPillText, { color: starFilter != null ? s.filterPillActiveText : s.filterPillText }]}>
            {starFilterLabel}
          </Text>
        </Touchable>

        <Touchable
          onPress={() => setFilterSheet('tags')}
          borderRadius={24}
          style={[
            styles.filterPill,
            tagFilter != null
              ? { backgroundColor: s.filterPillActiveBackground, borderColor: s.filterPillActiveBorder }
              : { backgroundColor: s.filterPillBackground, borderColor: s.filterPillBorder },
          ]}
        >
          <FilterIcon
            size={15}
            color={tagFilter != null ? s.filterPillActiveText : s.filterPillText}
            strokeWidth={1.5}
          />
          <Text style={[styles.filterPillText, { color: tagFilter != null ? s.filterPillActiveText : s.filterPillText }]}>
            {tagFilterLabel}
          </Text>
        </Touchable>
      </View>

      {/* Grid */}
      {outfitsStatus === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={s.buttonPrimary} />
        </View>
      ) : filteredOutfits.length === 0 ? (
        <View style={[styles.dashedContainer, { paddingBottom: bottomBarTotalHeight + 16 }]}>
          <View style={[styles.dashedBox, { borderColor: s.emptySubtitle }]}>
            <StarIcon size={44} color={s.emptySubtitle} strokeWidth={1.5} />
            <Text style={[styles.emptySub, { color: s.emptySubtitle }]}>
              {hasActiveFilter ? t('styles.emptyTitle') : t('styles.emptyDashed')}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredOutfits}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[styles.gridContent, { paddingBottom: bottomBarTotalHeight + 16 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <OutfitCard outfit={item} onPress={() => openAction(item)} />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );

  const renderRunwayTab = () => (
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

  const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { key: 'looks', label: t('styles.tabLooks'), Icon: ColumnsIcon },
    { key: 'essence', label: t('styles.tabEssence'), Icon: SparklesIcon },
    { key: 'runway', label: t('styles.tabRunway'), Icon: CrownIcon },
  ];

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: s.headerTitle }]}>{t('styles.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: s.headerSubtitle }]}>
          {t('styles.subtitle')}
        </Text>
      </View>

      {/* Content */}
      {activeTab === 'looks' && renderLooksTab()}
      {activeTab === 'runway' && renderRunwayTab()}
      {activeTab === 'essence' && renderEssenceTab()}

      {/* FAB */}
      <Touchable
        onPress={() => { setCreateStep(1); setShowCreate(true); }}
        borderRadius={28}
        style={[styles.fab, { backgroundColor: s.fabBackground, bottom: bottomBarTotalHeight + 16 }]}
      >
        <Text style={[styles.fabIcon, { color: s.fabIcon }]}>+</Text>
      </Touchable>

      {/* Creation sheet */}
      {showCreate && (
        <BottomSheet
          onClose={() => { setShowCreate(false); setCreateStep(1); }}
          backgroundColor={s.modalBackground}
          backdropColor={s.modalBackdrop}
        >
          {/* Sheet header */}
          <View style={[styles.sheetHeader, { borderBottomColor: s.modalBorder }]}>
            {createStep === 2 && (
              <Touchable
                onPress={() => setCreateStep(1)}
                hitSlop={8}
                borderRadius={20}
                style={styles.sheetBack}
              >
                <ArrowLeftIcon size={20} color={s.modalTitle} />
              </Touchable>
            )}
            <Text style={[styles.sheetTitle, { color: s.modalTitle, flex: 1, textAlign: createStep === 1 ? 'center' : 'left' }]}>
              {createStep === 1 ? t('styles.createTitle') : t('styles.createOutfits')}
            </Text>
          </View>

          {/* Step 1 — 4 option grid */}
          {createStep === 1 && (
            <View style={styles.createGrid}>
              {[
                { label: t('styles.createOutfits'),  Icon: ShirtIcon,    color: '#6366F1', onPress: () => setCreateStep(2) },
                { label: t('styles.createHaircuts'), Icon: ScissorsIcon, color: '#F97316', onPress: () => { setShowCreate(false); setShowHaircut(true); } },
                { label: t('styles.createMakeup'),   Icon: SparklesIcon, color: '#EC4899', onPress: () => { setShowCreate(false); setShowMakeup(true); } },
                { label: t('styles.createNails'),    Icon: HandIcon,     color: '#14B8A6', onPress: () => { setShowCreate(false); setShowNails(true); } },
              ].map(opt => (
                <Touchable
                  key={opt.label}
                  onPress={opt.onPress}
                  borderRadius={24}
                  style={[styles.createCard, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}
                >
                  <View style={[styles.createIconCircle, { backgroundColor: s.modalBackground }]}>
                    <opt.Icon size={28} color={opt.color} />
                  </View>
                  <Text style={[styles.createCardLabel, { color: s.modalTitle }]}>{opt.label}</Text>
                </Touchable>
              ))}
            </View>
          )}

          {/* Step 2 — outfit method */}
          {createStep === 2 && (
            <View style={styles.createMethods}>
              <Text style={[styles.createMethodsHint, { color: s.modalSubtitle }]}>
                {t('styles.createChooseMethod')}
              </Text>
              <Touchable
                onPress={() => { setShowCreate(false); setCreateStep(1); setShowManualCreator(true); }}
                borderRadius={16}
                style={[styles.createMethod, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}
              >
                <View style={[styles.createMethodIcon, { backgroundColor: s.modalBackground }]}>
                  <ShirtIcon size={24} color={s.modalTitle} />
                </View>
                <View style={styles.createMethodText}>
                  <Text style={[styles.createMethodTitle, { color: s.modalTitle }]}>{t('styles.createManual')}</Text>
                  <Text style={[styles.createMethodDesc, { color: s.modalSubtitle }]}>{t('styles.createManualDesc')}</Text>
                </View>
              </Touchable>
              <Touchable
                onPress={() => { setShowCreate(false); setCreateStep(1); setShowAICreator(true); }}
                borderRadius={16}
                style={[styles.createMethod, { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}
              >
                <View style={[styles.createMethodIcon, { backgroundColor: s.modalBackground }]}>
                  <SparklesIcon size={24} color="#4F46E5" />
                </View>
                <View style={styles.createMethodText}>
                  <Text style={[styles.createMethodTitle, { color: '#312E81' }]}>{t('styles.createAI')}</Text>
                  <Text style={[styles.createMethodDesc, { color: '#4338CA' }]}>{t('styles.createAIDesc')}</Text>
                </View>
              </Touchable>
            </View>
          )}
        </BottomSheet>
      )}

      {/* Bottom tab bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: s.bottomBarBackground,
            borderTopColor: s.bottomBarBorder,
            height: bottomBarTotalHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const color = isActive ? s.bottomBarActive : s.bottomBarInactive;
          return (
            <Touchable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              borderRadius={8}
              style={styles.bottomTabItem}
            >
              <tab.Icon
                size={22}
                color={color}
                strokeWidth={isActive ? 2.5 : 1.75}
              />
              <Text style={[styles.bottomTabLabel, { color }]}>
                {tab.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      {/* Filter sheets */}
      {filterSheet === 'stars' && (
        <BottomSheet
          onClose={() => setFilterSheet(null)}
          backgroundColor={s.modalBackground}
          backdropColor={s.modalBackdrop}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: s.modalBorder }]}>
            <Text style={[styles.sheetTitle, { color: s.modalTitle }]}>
              {t('styles.filterStars')}
            </Text>
          </View>
          {([null, 5, 4, 3, 2, 1] as (number | null)[]).map(star => {
            const isSelected = starFilter === star;
            return (
              <Touchable
                key={star ?? 'all'}
                onPress={() => { setStarFilter(star); setFilterSheet(null); }}
                borderRadius={0}
                style={[styles.sheetOption, { borderBottomColor: s.modalBorder }]}
              >
                <Text style={[styles.sheetOptionText, { color: s.modalTitle }]}>
                  {star != null ? `${star} ★` : t('styles.filterAll')}
                </Text>
                {isSelected && <CheckIcon size={18} color={s.buttonPrimary} />}
              </Touchable>
            );
          })}
        </BottomSheet>
      )}

      {filterSheet === 'tags' && (
        <BottomSheet
          onClose={() => setFilterSheet(null)}
          backgroundColor={s.modalBackground}
          backdropColor={s.modalBackdrop}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: s.modalBorder }]}>
            <Text style={[styles.sheetTitle, { color: s.modalTitle }]}>
              {t('styles.filterTags')}
            </Text>
          </View>
          {([null, ...allTags] as (string | null)[]).map(tag => {
            const isSelected = tagFilter === tag;
            return (
              <Touchable
                key={tag ?? 'all'}
                onPress={() => { setTagFilter(tag); setFilterSheet(null); }}
                borderRadius={0}
                style={[styles.sheetOption, { borderBottomColor: s.modalBorder }]}
              >
                <Text style={[styles.sheetOptionText, { color: s.modalTitle }]}>
                  {tag ?? t('styles.filterAll')}
                </Text>
                {isSelected && <CheckIcon size={18} color={s.buttonPrimary} />}
              </Touchable>
            );
          })}
        </BottomSheet>
      )}

      {/* Sheets */}
      {activeSheet === 'action' && selectedOutfit && (
        <OutfitActionSheet
          outfit={selectedOutfit}
          onClose={closeSheet}
          onSchedule={() => { setActiveSheet('schedule'); }}
          onShare={handleShare}
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

      <HaircutCreator
        visible={showHaircut}
        profile={profile}
        onClose={() => setShowHaircut(false)}
      />
      <MakeupCreator
        visible={showMakeup}
        profile={profile}
        outfits={outfits}
        onClose={() => setShowMakeup(false)}
      />
      <NailCreator
        visible={showNails}
        profile={profile}
        onClose={() => setShowNails(false)}
      />
      <ManualOutfitCreator
        visible={showManualCreator}
        closetItems={closetItems}
        closetLoading={closetStatus === 'loading'}
        saving={creatorSaving}
        onClose={() => setShowManualCreator(false)}
        onSave={handleManualSave}
      />
      <AIOutfitCreator
        visible={showAICreator}
        closetItems={closetItems}
        closetLoading={closetStatus === 'loading'}
        saving={creatorSaving}
        onClose={() => setShowAICreator(false)}
        onSave={handleAISave}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tab content
  tabContent: { flex: 1 },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 14, fontWeight: '600' },

  // Outfit grid
  gridContent: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 32 },
  gridRow: { gap: 12, marginBottom: 12 },

  // Card
  card: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardMedia: {
    aspectRatio: 1,
    width: '100%',
    overflow: 'hidden',
  },
  mosaic: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
    gap: 1,
  },
  mosaicRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 1,
  },
  mosaicCell: {
    flex: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mosaicLabel: {
    fontSize: 8,
    fontWeight: '600',
    textAlign: 'center',
    padding: 4,
  },
  tagsOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    gap: 3,
  },
  tagChip: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
  },
  tagChipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6366F1',
  },
  cardInfo: {
    padding: 10,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  cardNameWrap: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  cardName: { fontSize: 13, fontWeight: '700' },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardRatingText: { fontSize: 11, fontWeight: '700' },
  sourceBadge: {
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  sourceBadgeText: { fontSize: 8, fontWeight: '800', letterSpacing: 0.3 },

  // Empty / loading
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  dashedContainer: {
    flex: 1,
    padding: 16,
  },
  dashedBox: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },

  // Creation sheet
  sheetBack: {
    marginRight: 8,
  },
  createGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  createCard: {
    width: '47%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  createIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  createCardLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  createMethods: {
    padding: 16,
    gap: 12,
  },
  createMethodsHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  createMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  createMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  createMethodText: { flex: 1 },
  createMethodTitle: { fontSize: 15, fontWeight: '700' },
  createMethodDesc: { fontSize: 12, marginTop: 2, lineHeight: 17 },

  // Filter sheets
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetOptionStars: { flexDirection: 'row', gap: 3 },
  sheetOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },

  // Bottom tab bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomTabItem: {
    flex: 1,
    height: BOTTOM_TAB_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  bottomTabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default Styles;
