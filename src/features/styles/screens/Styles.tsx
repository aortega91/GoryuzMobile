import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import BottomSheet from '@components/BottomSheet';
import UpgradeModal from '@components/UpgradeModal';
import useStylesTheme from '@hooks/useStylesTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  SparklesIcon,
  StarIcon,
  CrownIcon,
  FilterIcon,
  CheckIcon,
  ShirtIcon,
  ScissorsIcon,
  HandIcon,
  ArrowLeftIcon,
  BrainIcon,
  TargetIcon,
  UserIcon,
  ImageIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  GemIcon,
  EyeIcon,
  TagIcon,
  Share2Icon,
  TrashIcon,
  LayoutGridIcon,
  Wand2Icon,
  NailIcon,
  PersonStandingIcon,
  DressIcon,
  PencilIcon,
  CameraIcon,
  PaletteIcon,
  PlusCircleIcon,
  CloseIcon,
  RefreshCwIcon,
} from '@assets/icons';
import { updateProfile } from '@features/profile/api/profileUpdateApi';
import { updateProfileLocally, loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch, RootState } from '@utilities/store';
import { addCalendarEvent } from '@features/schedule/api/calendarApi';
import { loadCollection } from '@features/collection/collectionSlice';
import {
  analyzeStyle,
  generateAvatarImage,
  validateBodyPhoto,
  analyzeColorimetry,
} from '../api/stylesGenerateApi';
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
import { Outfit, OutfitCategory, OUTFIT_CATEGORIES } from '../types';
import OutfitDetailSheet from '../components/OutfitDetailSheet';
import TagSheet from '../components/TagSheet';
import ScheduleOutfitSheet from '../components/ScheduleOutfitSheet';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'looks' | 'prompt' | 'body' | 'colorimetry' | 'tags';
type Sheet = 'detail' | 'tags' | 'schedule' | null;
type CategoryFilter = OutfitCategory | 'all';

const BOTTOM_TAB_HEIGHT = 56;

type CatIcon = (props: { size?: number; color?: string; strokeWidth?: number }) => React.ReactElement;

const CATEGORY_ICONS: Record<OutfitCategory, CatIcon> = {
  Outfits: ShirtIcon,
  'Corte/Barba': ScissorsIcon,
  Maquillaje: Wand2Icon,
  'Uñas': NailIcon,
};

const CATEGORY_LABEL_KEYS: Record<OutfitCategory, string> = {
  Outfits: 'styles.categoryOutfits',
  'Corte/Barba': 'styles.categoryHaircut',
  Maquillaje: 'styles.categoryMakeup',
  'Uñas': 'styles.categoryNails',
};

// ─── Outfit card (portrait, native fashion-app style) ─────────────────────────

interface OutfitCardProps {
  outfit: Outfit;
  onViewDetail: () => void;
  onTags: () => void;
  onShare: () => void;
  onDelete: () => void;
}

function OutfitCard({ outfit, onViewDetail, onTags, onShare, onDelete }: OutfitCardProps) {
  const { styles: s } = useStylesTheme();
  const { t } = useTranslation();
  const items = outfit.items.slice(0, 4);
  const isAI = outfit.source === 'ai';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: s.outfitCardBackground, borderColor: s.outfitCardBorder },
      ]}
    >
      {/* Square image area — tap opens detail (the "eye") */}
      <Touchable
        onPress={onViewDetail}
        borderRadius={0}
        style={[styles.cardMedia, { backgroundColor: s.outfitCardMosaicBackground }]}
      >
        {outfit.imageData ? (
          <AuthedImage
            data={outfit.imageData}
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
                      <AuthedImage
                        data={items[i].imageData!}
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
      </Touchable>

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

        {/* Action row — always visible at the bottom of the card */}
        <View style={[styles.cardActions, { borderTopColor: s.outfitCardBorder }]}>
          <Touchable
            onPress={onViewDetail}
            borderRadius={8}
            accessibilityLabel={t('styles.detailView')}
            style={styles.cardActionBtn}
          >
            <EyeIcon size={16} color={s.actionIcon} />
          </Touchable>
          <Touchable
            onPress={onTags}
            borderRadius={8}
            accessibilityLabel={t('styles.actionTags')}
            style={styles.cardActionBtn}
          >
            <TagIcon size={16} color={s.actionIcon} />
          </Touchable>
          <Touchable
            onPress={onShare}
            borderRadius={8}
            accessibilityLabel={t('styles.actionShare')}
            style={styles.cardActionBtn}
          >
            <Share2Icon size={16} color={s.actionIcon} />
          </Touchable>
          <Touchable
            onPress={onDelete}
            borderRadius={8}
            accessibilityLabel={t('styles.actionDelete')}
            style={styles.cardActionBtn}
          >
            <TrashIcon size={16} color={s.actionDangerText} />
          </Touchable>
        </View>
      </View>
    </View>
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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
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
    () => profile?.availableTags ?? [],
    [profile?.availableTags],
  );

  const hasItemsInCategory = useCallback(
    (cat: OutfitCategory) =>
      cat === 'Outfits'
        ? outfits.some(o => !o.category || o.category === 'Outfits')
        : outfits.some(o => o.category === cat),
    [outfits],
  );

  const visibleCategories = useMemo(
    () => OUTFIT_CATEGORIES.filter(hasItemsInCategory),
    [hasItemsInCategory],
  );

  const filteredOutfits = useMemo(() => {
    let result = outfits;
    if (categoryFilter !== 'all') {
      result = result.filter(o => (o.category ?? 'Outfits') === categoryFilter);
    }
    if (tagFilter) result = result.filter(o => o.tags.includes(tagFilter));
    if (starFilter) result = result.filter(o => o.rating === starFilter);
    return result;
  }, [outfits, categoryFilter, tagFilter, starFilter]);

  const hasActiveFilter = tagFilter != null || starFilter != null || categoryFilter !== 'all';

  // Bottom bar height including safe area
  const bottomBarTotalHeight = BOTTOM_TAB_HEIGHT + insets.bottom;

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const openDetail = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setActiveSheet('detail');
  }, []);

  const openTags = useCallback((outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setActiveSheet('tags');
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setSelectedOutfit(null);
    setSheetLoading(false);
  }, []);

  const handleDetailSave = async ({ name, rating }: { name: string; rating: number | null }) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    await dispatch(editOutfit({ id: selectedOutfit.id, name, rating }));
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

  const handleDelete = useCallback(
    (outfit: Outfit) => {
      dispatch(removeOutfit(outfit.id));
    },
    [dispatch],
  );

  const handleShare = useCallback(async (outfit: Outfit) => {
    const pieces = outfit.items.map(i => i.name).join(', ');
    await Share.share({
      title: outfit.name,
      message: pieces ? `${outfit.name} — ${pieces}` : outfit.name,
    });
  }, []);

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
      {/* Category filter — rounded icon buttons at the top */}
      {visibleCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          <Touchable
            onPress={() => setCategoryFilter('all')}
            borderRadius={22}
            accessibilityLabel={t('styles.categoryAll')}
            style={[
              styles.categoryBtn,
              categoryFilter === 'all'
                ? { backgroundColor: s.buttonPrimary, borderColor: s.buttonPrimary }
                : { backgroundColor: s.filterPillBackground, borderColor: s.filterPillBorder },
            ]}
          >
            <LayoutGridIcon
              size={18}
              color={categoryFilter === 'all' ? s.buttonPrimaryText : s.filterPillText}
            />
          </Touchable>
          {visibleCategories.map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            const isActive = categoryFilter === cat;
            return (
              <Touchable
                key={cat}
                onPress={() => setCategoryFilter(cat)}
                borderRadius={22}
                accessibilityLabel={t(CATEGORY_LABEL_KEYS[cat])}
                style={[
                  styles.categoryBtn,
                  isActive
                    ? { backgroundColor: s.buttonPrimary, borderColor: s.buttonPrimary }
                    : { backgroundColor: s.filterPillBackground, borderColor: s.filterPillBorder },
                ]}
              >
                <Icon size={18} color={isActive ? s.buttonPrimaryText : s.filterPillText} />
              </Touchable>
            );
          })}
        </ScrollView>
      )}

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
            <OutfitCard
              outfit={item}
              onViewDetail={() => openDetail(item)}
              onTags={() => openTags(item)}
              onShare={() => handleShare(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </View>
  );

  // ─── Essence sections state (prompt / body / colorimetry / tags) ──────────────

  const [stylePrompt, setStylePrompt] = useState(profile?.stylePrompt ?? '');
  const [stylePromptImage, setStylePromptImage] = useState(profile?.stylePromptImage ?? '');
  const [avatarPrompt, setAvatarPrompt] = useState(profile?.avatarPrompt ?? '');
  const [avatarRefImage, setAvatarRefImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isValidatingBodyPhoto, setIsValidatingBodyPhoto] = useState(false);
  const [bodyPhotoError, setBodyPhotoError] = useState<string | null>(null);
  const [isTestingColorimetry, setIsTestingColorimetry] = useState(false);
  const [colorimetryError, setColorimetryError] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [showVipUpgrade, setShowVipUpgrade] = useState(false);
  const isFirstRender = useRef(true);

  const { openGallery } = useCameraPermission();

  // Sync local state if profile loads/changes after mount
  useEffect(() => {
    if (profile && isFirstRender.current) {
      setStylePrompt(profile.stylePrompt ?? '');
      setStylePromptImage(profile.stylePromptImage ?? '');
      setAvatarPrompt(profile.avatarPrompt ?? '');
    }
  }, [profile]);

  // Auto-save style fields with 1.5s debounce
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const updated = await updateProfile({
          stylePrompt,
          stylePromptImage: stylePromptImage || undefined,
          avatarPrompt,
        });
        dispatch(updateProfileLocally(updated));
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), 'essence/autoSave');
      }
    }, 1500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stylePrompt, stylePromptImage, avatarPrompt]);

  const handlePickStyleImage = async () => {
    const result = await openGallery();
    if (result.status === 'success') {
      const asset = result.response.assets?.[0];
      if (asset?.base64 && asset?.type) {
        setStylePromptImage(`data:${asset.type};base64,${asset.base64}`);
      }
    }
  };

  const handlePickAvatarRefImage = async () => {
    const result = await openGallery();
    if (result.status === 'success') {
      const asset = result.response.assets?.[0];
      if (asset?.base64 && asset?.type) {
        setAvatarRefImage(`data:${asset.type};base64,${asset.base64}`);
      }
    }
  };

  const handlePickBodyImage = async () => {
    const result = await openGallery();
    if (result.status !== 'success') return;
    const asset = result.response.assets?.[0];
    if (!asset?.base64 || !asset?.type) return;

    setIsValidatingBodyPhoto(true);
    setBodyPhotoError(null);
    try {
      const validation = await validateBodyPhoto({ imageBase64: asset.base64, mimeType: asset.type });
      if (!validation.isValid) {
        setBodyPhotoError(validation.reason || t('styles.bodyPhotoInvalid'));
        return;
      }
      const dataUri = `data:${asset.type};base64,${asset.base64}`;
      const updated = await updateProfile({ bodyImage: dataUri });
      dispatch(updateProfileLocally(updated));
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'essence/bodyPhoto');
      setBodyPhotoError(t('styles.bodyPhotoError'));
    } finally {
      setIsValidatingBodyPhoto(false);
    }
  };

  const handleRemoveBodyImage = async () => {
    const updated = await updateProfile({ bodyImage: '' });
    dispatch(updateProfileLocally(updated));
  };

  const handleColorimetryTest = async () => {
    const preferred = profile?.bodyImage || profile?.avatarImage;
    if (!preferred) return;
    setIsTestingColorimetry(true);
    setColorimetryError(null);
    try {
      const mimeType = preferred.match(/data:(.*);base64,/)?.[1] ?? 'image/jpeg';
      const base64 = preferred.includes('base64,') ? preferred.split('base64,')[1] : preferred;
      const result = await analyzeColorimetry({ imageBase64: base64, mimeType });
      const updated = await updateProfile({
        colorSeason: result.colorSeason,
        colorimetryResult: result.description,
        colorPalette: result.palette,
      });
      dispatch(updateProfileLocally(updated));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'essence/colorimetry');
      setColorimetryError(t('styles.colorimetryError'));
    } finally {
      setIsTestingColorimetry(false);
    }
  };

  const handleAddAvailableTag = async () => {
    const tag = newTagInput.trim();
    if (!tag || (profile?.availableTags ?? []).includes(tag)) {
      setNewTagInput('');
      return;
    }
    setNewTagInput('');
    const updated = await updateProfile({ availableTags: [...(profile?.availableTags ?? []), tag] });
    dispatch(updateProfileLocally(updated));
  };

  const handleDeleteAvailableTag = async (tag: string) => {
    const updated = await updateProfile({
      availableTags: (profile?.availableTags ?? []).filter(existing => existing !== tag),
    });
    dispatch(updateProfileLocally(updated));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const { summary } = await analyzeStyle({
        closet: closetItems,
        savedOutfits: outfits,
        stylePrompt,
        gender: profile?.gender ?? null,
      });
      dispatch(updateProfileLocally({ styleSummary: summary }));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'essence/analyze');
      setAnalysisError(t('styles.essenceAnalysisError'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateAvatar = async () => {
    setIsGeneratingAvatar(true);
    setAvatarError(null);
    try {
      const mimeType = avatarRefImage?.match(/data:(.*);base64,/)?.[1] ?? undefined;
      const base64Ref = avatarRefImage ? avatarRefImage.split(',')[1] : undefined;
      const result = await generateAvatarImage({
        description: avatarPrompt,
        referenceImageBase64: base64Ref,
        mimeType,
      });
      const newAvatarUrl = result.avatarUrl || result.avatarImage;
      dispatch(updateProfileLocally({ avatarImage: newAvatarUrl, avatarDescription: avatarPrompt }));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'essence/generateAvatar');
      setAvatarError(t('styles.essenceAvatarError'));
    } finally {
      setIsGeneratingAvatar(false);
    }
  };

  const renderAnalysisResult = (summary: string) => {
    const cleanText = summary.replace(/#/g, '').replace(/\*\*/g, '');
    const sections = cleanText.split(/\d+\.\s/).filter(sec => sec.trim().length > 0);

    const parseSection = (section: string) => {
      const firstColon = section.indexOf(':');
      if (firstColon !== -1) {
        return {
          title: section.substring(0, firstColon).trim(),
          content: section.substring(firstColon + 1).trim(),
        };
      }
      return { title: '', content: section.trim() };
    };

    let styleName = '';
    let styleDescription = sections[0] ?? '';
    const section1 = sections[0] ?? '';
    if (section1.includes(':')) {
      const parts = section1.split(':');
      const content = parts.slice(1).join(':').trim();
      const firstDot = content.indexOf('.');
      if (firstDot !== -1 && firstDot < 50) {
        styleName = content.substring(0, firstDot).trim();
        styleDescription = content.substring(firstDot + 1).trim();
      } else {
        styleName = content;
        styleDescription = '';
      }
    }

    const actionKws = ['vacía', 'no tienes', 'falta', 'ningún', 'carga', 'guarda', 'empty', "don't have", 'missing', 'upload', 'save'];
    const cards = [
      { ...parseSection(sections[1] ?? ''), bgKey: 'Sky' as const },
      { ...parseSection(sections[2] ?? ''), bgKey: 'Purple' as const },
      { ...parseSection(sections[3] ?? ''), bgKey: 'Emerald' as const },
    ].map(card => {
      const isAlert = actionKws.some(kw => card.content.toLowerCase().includes(kw));
      return { ...card, isAlert };
    });

    return (
      <View style={essenceStyles.analysisResult}>
        {/* Hero */}
        <View style={[essenceStyles.heroCard, { backgroundColor: s.essenceHeroBg, borderColor: s.essenceHeroBorder }]}>
          <CrownIcon size={48} color={s.essenceIconIndigo} strokeWidth={1.5} />
          <Text style={[essenceStyles.heroTitle, { color: s.essenceHeroTitle }]}>
            {styleName || t('styles.essenceTitle')}
          </Text>
          {styleDescription ? (
            <Text style={[essenceStyles.heroSubtitle, { color: s.essenceHeroSubtitle }]}>
              {styleDescription}
            </Text>
          ) : null}
        </View>

        {/* Cards */}
        {cards.map((card, idx) => {
          const bgColor = card.isAlert
            ? s.essenceCardAlertBg
            : idx === 0 ? s.essenceCardSkyBg
            : idx === 1 ? s.essenceCardPurpleBg
            : s.essenceCardEmeraldBg;
          const borderColor = card.isAlert
            ? s.essenceCardAlertBorder
            : idx === 0 ? s.essenceCardSkyBorder
            : idx === 1 ? s.essenceCardPurpleBorder
            : s.essenceCardEmeraldBorder;
          const titleColor = card.isAlert
            ? s.essenceCardAlertTitle
            : idx === 0 ? s.essenceCardSkyTitle
            : idx === 1 ? s.essenceCardPurpleTitle
            : s.essenceCardEmeraldTitle;

          return (
            // eslint-disable-next-line react/no-array-index-key
            <View key={idx} style={[essenceStyles.analysisCard, { backgroundColor: bgColor, borderColor }]}>
              {card.isAlert ? (
                <AlertCircleIcon size={20} color={s.essenceCardAlertTitle} />
              ) : (
                <SparklesIcon size={20} color={titleColor} strokeWidth={1.5} />
              )}
              <View style={essenceStyles.analysisCardText}>
                {card.title ? (
                  <Text style={[essenceStyles.analysisCardTitle, { color: titleColor }]}>
                    {card.title}
                  </Text>
                ) : null}
                <Text style={[essenceStyles.analysisCardBody, { color: s.essenceCardBody }]}>
                  {card.content}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderPromptTab = () => (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={[essenceStyles.scrollContent, { paddingBottom: bottomBarTotalHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Personal Vision ───────────────────────────────────── */}
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeader}>
            <View style={[essenceStyles.sectionIconBg, { backgroundColor: s.essenceInputBackground }]}>
              <TargetIcon size={20} color={s.essenceIconIndigo} />
            </View>
            <View style={essenceStyles.sectionHeaderText}>
              <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                {t('styles.essencePersonalVision')}
              </Text>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.essencePersonalVisionDesc')}
              </Text>
            </View>
          </View>

          <TextInput
            value={stylePrompt}
            onChangeText={setStylePrompt}
            multiline
            numberOfLines={5}
            placeholder={t('styles.essenceStylePlaceholder')}
            placeholderTextColor={s.essenceInputPlaceholder}
            style={[
              essenceStyles.textarea,
              {
                backgroundColor: s.essenceInputBackground,
                borderColor: s.essenceInputBorder,
                color: s.essenceInputText,
              },
            ]}
          />

          {/* Reference image */}
          {stylePromptImage ? (
            <View style={essenceStyles.refImageContainer}>
              <Image
                source={{ uri: stylePromptImage }}
                style={essenceStyles.refImage}
                resizeMode="cover"
              />
              <Touchable
                onPress={() => setStylePromptImage('')}
                borderRadius={20}
                style={[essenceStyles.removeImageBtn, { backgroundColor: s.modalBackground }]}
              >
                <Text style={[essenceStyles.removeImageText, { color: s.actionDangerText }]}>
                  {t('styles.essenceRemoveImage')}
                </Text>
              </Touchable>
            </View>
          ) : (
            <Touchable
              onPress={handlePickStyleImage}
              borderRadius={12}
              style={[essenceStyles.uploadBtn, { borderColor: s.essenceInputBorder, backgroundColor: s.essenceInputBackground }]}
            >
              <ImageIcon size={18} color={s.modalSubtitle} />
              <Text style={[essenceStyles.uploadBtnText, { color: s.modalSubtitle }]}>
                {t('styles.essenceUploadReference')}
              </Text>
            </Touchable>
          )}
        </View>

        {/* ── 2. AI Analysis ───────────────────────────────────────── */}
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeaderRow}>
            <View style={essenceStyles.sectionHeaderLeft}>
              <View style={[essenceStyles.sectionIconBg, { backgroundColor: s.essenceInputBackground }]}>
                <BrainIcon size={20} color={s.essenceIconPurple} />
              </View>
              <View style={essenceStyles.sectionHeaderText}>
                <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                  {t('styles.essenceAnalysis')}
                </Text>
                <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                  {t('styles.essenceAnalysisDesc')}
                </Text>
              </View>
            </View>

            <View style={essenceStyles.analyzeRow}>
              <View style={[essenceStyles.gemsBadge, { backgroundColor: s.essenceGemsBadgeBackground, borderColor: s.essenceGemsBadgeBorder }]}>
                <GemIcon size={13} color={s.essenceGemsBadgeText} />
                <Text style={[essenceStyles.gemsBadgeText, { color: s.essenceGemsBadgeText }]}>4</Text>
              </View>
              <Touchable
                onPress={handleAnalyze}
                disabled={isAnalyzing}
                borderRadius={24}
                style={[
                  essenceStyles.analyzeBtn,
                  { backgroundColor: isAnalyzing ? '#6EE7B7' : '#10B981' },
                  isAnalyzing && essenceStyles.analyzeBtnDisabled,
                ]}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <SparklesIcon size={16} color="#fff" />
                )}
                <Text style={essenceStyles.analyzeBtnText}>
                  {isAnalyzing ? t('styles.essenceAnalyzing') : t('styles.essenceAnalyze')}
                </Text>
              </Touchable>
            </View>
          </View>

          {/* Analysis result or empty state */}
          {analysisError ? (
            <View style={[essenceStyles.emptyAnalysis, { backgroundColor: s.essenceAnalysisBackground, borderColor: s.essenceAnalysisBorder }]}>
              <AlertCircleIcon size={28} color={s.actionDangerText} />
              <Text style={[essenceStyles.emptyAnalysisText, { color: s.actionDangerText }]}>
                {analysisError}
              </Text>
            </View>
          ) : profile?.styleSummary ? (
            renderAnalysisResult(profile.styleSummary)
          ) : (
            <View style={[essenceStyles.emptyAnalysis, { backgroundColor: s.essenceAnalysisBackground, borderColor: s.essenceAnalysisBorder }]}>
              <SparklesIcon size={28} color={s.emptyIcon} strokeWidth={1.5} />
              <Text style={[essenceStyles.emptyAnalysisTitle, { color: s.emptyText }]}>
                {t('styles.essenceWaiting')}
              </Text>
              <Text style={[essenceStyles.emptyAnalysisText, { color: s.emptySubtitle }]}>
                {t('styles.essenceWaitingDesc')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
  );

  const renderBodyTab = () => {
    const isVip = profile?.plan === 'vip';
    const avatarPreview = profile?.avatarImage ?? null;
    const bodyPreview = profile?.bodyImage || profile?.avatarImage || null;

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={[essenceStyles.scrollContent, { paddingBottom: bottomBarTotalHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Real body photo ──────────────────────────────────────── */}
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeader}>
            <View style={[essenceStyles.sectionIconBg, { backgroundColor: '#ECFDF5' }]}>
              <PersonStandingIcon size={20} color={s.essenceIconEmerald} />
            </View>
            <View style={essenceStyles.sectionHeaderText}>
              <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                {t('styles.bodyPhotoTitle')}
              </Text>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.bodyPhotoDesc')}
              </Text>
            </View>
          </View>

          <View style={essenceStyles.avatarLayout}>
            <Touchable
              onPress={handlePickBodyImage}
              disabled={isValidatingBodyPhoto}
              borderRadius={16}
              style={[essenceStyles.avatarPreview, { borderColor: s.essenceInputBorder, backgroundColor: s.essenceInputBackground }]}
            >
              {bodyPreview ? (
                <AuthedImage data={bodyPreview} style={essenceStyles.avatarImg} resizeMode="contain" />
              ) : (
                <View style={essenceStyles.avatarEmpty}>
                  {isValidatingBodyPhoto ? (
                    <ActivityIndicator color={s.essenceIconEmerald} />
                  ) : (
                    <UserIcon size={40} color={s.emptyIcon} strokeWidth={1.5} />
                  )}
                  <Text style={[essenceStyles.avatarEmptyText, { color: s.emptySubtitle }]}>
                    {isValidatingBodyPhoto ? t('styles.bodyPhotoValidating') : t('styles.bodyPhotoUpload')}
                  </Text>
                </View>
              )}
            </Touchable>

            <View style={essenceStyles.avatarInputs}>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.bodyPhotoHint')}
              </Text>
              {profile?.bodyImage ? (
                <Touchable
                  onPress={handleRemoveBodyImage}
                  borderRadius={12}
                  style={[essenceStyles.uploadBtn, { borderColor: s.buttonDangerBorder, backgroundColor: s.buttonDanger, marginTop: 10 }]}
                >
                  <TrashIcon size={16} color={s.actionDangerText} />
                  <Text style={[essenceStyles.uploadBtnText, { color: s.actionDangerText }]}>
                    {t('styles.bodyPhotoRemove')}
                  </Text>
                </Touchable>
              ) : null}
              {bodyPhotoError && (
                <Text style={[essenceStyles.errorText, { color: s.actionDangerText }]}>
                  {bodyPhotoError}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Avatar generation (VIP) ──────────────────────────────── */}
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeader}>
            <View style={[essenceStyles.sectionIconBg, { backgroundColor: s.essenceInputBackground }]}>
              <UserIcon size={20} color={s.essenceIconIndigo} />
            </View>
            <View style={essenceStyles.sectionHeaderText}>
              <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                {t('styles.essenceAvatar')}
              </Text>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.essenceAvatarDesc')}
              </Text>
            </View>
          </View>

          <View style={essenceStyles.avatarLayout}>
            {/* Avatar preview */}
            <View style={[essenceStyles.avatarPreview, { borderColor: s.essenceInputBorder, backgroundColor: s.essenceInputBackground }]}>
              {avatarPreview ? (
                <>
                  <AuthedImage data={avatarPreview} style={essenceStyles.avatarImg} resizeMode="contain" />
                  <View style={essenceStyles.avatarActiveBadge}>
                    <Text style={essenceStyles.avatarActiveBadgeText}>{t('styles.essenceAvatarActive')}</Text>
                  </View>
                </>
              ) : (
                <View style={essenceStyles.avatarEmpty}>
                  <UserIcon size={40} color={s.emptyIcon} strokeWidth={1.5} />
                  <Text style={[essenceStyles.avatarEmptyText, { color: s.emptySubtitle }]}>
                    {t('styles.essenceAvatarNone')}
                  </Text>
                </View>
              )}
            </View>

            {/* Inputs */}
            <View style={essenceStyles.avatarInputs}>
              <Text style={[essenceStyles.inputLabel, { color: s.modalLabel }]}>
                {t('styles.essenceAvatarDescLabel').toUpperCase()}
              </Text>
              <TextInput
                value={avatarPrompt}
                onChangeText={setAvatarPrompt}
                multiline
                numberOfLines={4}
                placeholder={t('styles.essenceAvatarDescPlaceholder')}
                placeholderTextColor={s.essenceInputPlaceholder}
                editable={isVip}
                style={[
                  essenceStyles.textarea,
                  {
                    backgroundColor: s.essenceInputBackground,
                    borderColor: s.essenceInputBorder,
                    color: s.essenceInputText,
                    opacity: isVip ? 1 : 0.5,
                  },
                ]}
              />

              <Text style={[essenceStyles.inputLabel, { color: s.modalLabel, marginTop: 12 }]}>
                {t('styles.essenceAvatarRefLabel').toUpperCase()}
              </Text>
              {avatarRefImage ? (
                <View style={essenceStyles.refImageContainer}>
                  <Image source={{ uri: avatarRefImage }} style={essenceStyles.refImageSmall} resizeMode="cover" />
                  <Touchable
                    onPress={() => setAvatarRefImage(null)}
                    borderRadius={20}
                    style={[essenceStyles.removeImageBtn, { backgroundColor: s.modalBackground }]}
                  >
                    <Text style={[essenceStyles.removeImageText, { color: s.actionDangerText }]}>
                      {t('styles.essenceRemoveImage')}
                    </Text>
                  </Touchable>
                </View>
              ) : (
                <Touchable
                  onPress={handlePickAvatarRefImage}
                  disabled={!isVip}
                  borderRadius={12}
                  style={[
                    essenceStyles.uploadBtn,
                    { borderColor: s.essenceInputBorder, backgroundColor: s.essenceInputBackground, opacity: isVip ? 1 : 0.5 },
                  ]}
                >
                  <ImageIcon size={16} color={s.modalSubtitle} />
                  <Text style={[essenceStyles.uploadBtnText, { color: s.modalSubtitle }]}>
                    {t('styles.essenceAvatarRefUpload')}
                  </Text>
                </Touchable>
              )}

              {/* Footer: gems + generate button */}
              <View style={essenceStyles.avatarFooter}>
                <View style={[essenceStyles.gemsBadge, { backgroundColor: s.essenceGemsBadgeBackground, borderColor: s.essenceGemsBadgeBorder }]}>
                  <GemIcon size={13} color={s.essenceGemsBadgeText} />
                  <Text style={[essenceStyles.gemsBadgeText, { color: s.essenceGemsBadgeText }]}>10</Text>
                </View>
                <Touchable
                  onPress={handleGenerateAvatar}
                  disabled={!isVip || isGeneratingAvatar}
                  borderRadius={24}
                  style={[
                    essenceStyles.generateBtn,
                    { opacity: !isVip || isGeneratingAvatar ? 0.5 : 1 },
                  ]}
                >
                  {isGeneratingAvatar ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <SparklesIcon size={16} color="#fff" />
                  )}
                  <Text style={essenceStyles.generateBtnText}>
                    {isGeneratingAvatar ? t('styles.essenceAvatarGenerating') : t('styles.essenceAvatarGenerate')}
                  </Text>
                </Touchable>
              </View>

              {!isVip && (
                <Touchable
                  onPress={() => setShowVipUpgrade(true)}
                  borderRadius={12}
                  style={[essenceStyles.vipOverlay, { backgroundColor: 'rgba(0,0,0,0.04)' }]}
                >
                  <View style={[essenceStyles.vipBadge, { backgroundColor: s.essenceGemsBadgeBackground, borderColor: s.essenceGemsBadgeBorder }]}>
                    <CrownIcon size={14} color={s.essenceGemsBadgeText} />
                    <Text style={[essenceStyles.vipBadgeText, { color: s.essenceGemsBadgeText }]}>
                      {t('styles.essenceVipOnly')}
                    </Text>
                  </View>
                </Touchable>
              )}

              {avatarError && (
                <Text style={[essenceStyles.errorText, { color: s.actionDangerText }]}>
                  {avatarError}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderColorimetryTab = () => {
    const preferred = profile?.bodyImage || profile?.avatarImage || null;
    const hasResult = Boolean(profile?.colorSeason && profile?.colorimetryResult);

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={[essenceStyles.scrollContent, { paddingBottom: bottomBarTotalHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeader}>
            <View style={[essenceStyles.sectionIconBg, { backgroundColor: s.essenceInputBackground }]}>
              <PaletteIcon size={20} color="#B45309" />
            </View>
            <View style={essenceStyles.sectionHeaderText}>
              <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                {t('styles.colorimetryTitle')}
              </Text>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.colorimetryDesc')}
              </Text>
            </View>
          </View>

          {!preferred ? (
            <View style={[essenceStyles.emptyAnalysis, { backgroundColor: s.essenceCardAlertBg, borderColor: s.essenceCardAlertBorder }]}>
              <AlertTriangleIcon size={28} color={s.essenceCardAlertTitle} />
              <Text style={[essenceStyles.emptyAnalysisText, { color: s.essenceCardAlertTitle }]}>
                {t('styles.colorimetryLocked')}
              </Text>
            </View>
          ) : hasResult ? (
            <View style={[essenceStyles.heroCard, { backgroundColor: s.essenceCardEmeraldBg, borderColor: s.essenceCardEmeraldBorder }]}>
              <Text style={[essenceStyles.heroTitle, { color: s.essenceCardEmeraldTitle }]}>
                {profile?.colorSeason}
              </Text>
              {profile?.colorPalette && profile.colorPalette.length > 0 && (
                <View style={essenceStyles.paletteRow}>
                  {profile.colorPalette.map(hex => (
                    <View key={hex} style={[essenceStyles.paletteSwatch, { backgroundColor: hex }]} />
                  ))}
                </View>
              )}
              <Text style={[essenceStyles.heroSubtitle, { color: s.essenceCardBody }]}>
                {profile?.colorimetryResult}
              </Text>
              <Touchable
                onPress={handleColorimetryTest}
                disabled={isTestingColorimetry}
                borderRadius={24}
                style={[essenceStyles.analyzeBtn, { backgroundColor: '#10B981' }, isTestingColorimetry && essenceStyles.analyzeBtnDisabled]}
              >
                {isTestingColorimetry ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <RefreshCwIcon size={16} color="#fff" />
                )}
                <Text style={essenceStyles.analyzeBtnText}>
                  {isTestingColorimetry ? t('styles.colorimetryTesting') : t('styles.colorimetryRetest')}
                </Text>
              </Touchable>
            </View>
          ) : (
            <View style={[essenceStyles.emptyAnalysis, { backgroundColor: s.essenceAnalysisBackground, borderColor: s.essenceAnalysisBorder }]}>
              <PaletteIcon size={32} color={s.emptyIcon} strokeWidth={1.5} />
              <Text style={[essenceStyles.emptyAnalysisTitle, { color: s.emptyText }]}>
                {t('styles.colorimetryEmpty')}
              </Text>
              <Touchable
                onPress={handleColorimetryTest}
                disabled={isTestingColorimetry}
                borderRadius={24}
                style={[essenceStyles.analyzeBtn, { backgroundColor: '#10B981' }, isTestingColorimetry && essenceStyles.analyzeBtnDisabled]}
              >
                {isTestingColorimetry ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <SparklesIcon size={16} color="#fff" />
                )}
                <Text style={essenceStyles.analyzeBtnText}>
                  {isTestingColorimetry ? t('styles.colorimetryTesting') : t('styles.colorimetryTest')}
                </Text>
              </Touchable>
            </View>
          )}

          {colorimetryError && (
            <Text style={[essenceStyles.errorText, { color: s.actionDangerText }]}>
              {colorimetryError}
            </Text>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderTagsTab = () => {
    const availableTags = profile?.availableTags ?? [];

    return (
      <ScrollView
        style={styles.tabContent}
        contentContainerStyle={[essenceStyles.scrollContent, { paddingBottom: bottomBarTotalHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[essenceStyles.section, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={essenceStyles.sectionHeader}>
            <View style={[essenceStyles.sectionIconBg, { backgroundColor: s.essenceInputBackground }]}>
              <TagIcon size={20} color={s.essenceIconIndigo} />
            </View>
            <View style={essenceStyles.sectionHeaderText}>
              <Text style={[essenceStyles.sectionTitle, { color: s.modalTitle }]}>
                {t('styles.tagsManageTitle')}
              </Text>
              <Text style={[essenceStyles.sectionDesc, { color: s.modalSubtitle }]}>
                {t('styles.tagsManageDesc')}
              </Text>
            </View>
          </View>

          <View style={essenceStyles.tagInputRow}>
            <TextInput
              value={newTagInput}
              onChangeText={setNewTagInput}
              placeholder={t('styles.tagsPlaceholder')}
              placeholderTextColor={s.essenceInputPlaceholder}
              returnKeyType="done"
              onSubmitEditing={handleAddAvailableTag}
              style={[
                essenceStyles.tagInput,
                { backgroundColor: s.essenceInputBackground, borderColor: s.essenceInputBorder, color: s.essenceInputText },
              ]}
            />
            <Touchable
              onPress={handleAddAvailableTag}
              disabled={!newTagInput.trim()}
              borderRadius={12}
              style={[essenceStyles.tagAddBtn, { backgroundColor: s.buttonPrimary, opacity: newTagInput.trim() ? 1 : 0.5 }]}
            >
              <PlusCircleIcon size={18} color={s.buttonPrimaryText} />
            </Touchable>
          </View>

          {availableTags.length === 0 ? (
            <View style={[essenceStyles.emptyAnalysis, { backgroundColor: s.essenceAnalysisBackground, borderColor: s.essenceAnalysisBorder }]}>
              <TagIcon size={28} color={s.emptyIcon} strokeWidth={1.5} />
              <Text style={[essenceStyles.emptyAnalysisText, { color: s.emptySubtitle }]}>
                {t('styles.tagsManageEmpty')}
              </Text>
            </View>
          ) : (
            <View style={essenceStyles.tagsWrapLarge}>
              {availableTags.map(tag => (
                <View key={tag} style={[essenceStyles.tagChipLarge, { backgroundColor: s.tagBackground }]}>
                  <Text style={[essenceStyles.tagChipLargeText, { color: s.tagText }]}>{tag}</Text>
                  <Touchable onPress={() => handleDeleteAvailableTag(tag)} hitSlop={8} borderRadius={10}>
                    <CloseIcon size={13} color={s.tagText} />
                  </Touchable>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    // Each icon names what the tab actually holds: saved looks, a style
    // description the user writes, a photo of themselves. The previous set
    // described the wrong things — two layout columns, a chatbot, and a stick
    // figure that read as "profile". Note `looks` is deliberately NOT
    // LayoutGridIcon despite that being zena's choice for the same tab: it is
    // already the "all categories" pill inside this very tab, and the same
    // glyph twice on one screen is its own kind of misdirection.
    { key: 'looks', label: t('styles.tabLooks'), Icon: DressIcon },
    { key: 'prompt', label: t('styles.tabPrompt'), Icon: PencilIcon },
    { key: 'body', label: t('styles.tabBody'), Icon: CameraIcon },
    { key: 'colorimetry', label: t('styles.tabColorimetry'), Icon: PaletteIcon },
    { key: 'tags', label: t('styles.tabTags'), Icon: TagIcon },
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
      {activeTab === 'prompt' && renderPromptTab()}
      {activeTab === 'body' && renderBodyTab()}
      {activeTab === 'colorimetry' && renderColorimetryTab()}
      {activeTab === 'tags' && renderTagsTab()}

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
                { label: t('styles.createOutfits'),  Icon: ShirtIcon,    color: '#6366F1', onPress: () => setCreateStep(2),                                               soon: false },
                { label: t('styles.createHaircuts'), Icon: ScissorsIcon, color: '#F97316', onPress: () => { setShowCreate(false); setShowHaircut(true); },                 soon: true },
                { label: t('styles.createMakeup'),   Icon: SparklesIcon, color: '#EC4899', onPress: () => { setShowCreate(false); setShowMakeup(true); },                  soon: true },
                { label: t('styles.createNails'),    Icon: HandIcon,     color: '#14B8A6', onPress: () => { setShowCreate(false); setShowNails(true); },                   soon: true },
              ].map(opt => (
                <Touchable
                  key={opt.label}
                  onPress={opt.soon ? undefined : opt.onPress}
                  disabled={opt.soon}
                  borderRadius={24}
                  style={[styles.createCard, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}
                >
                  <View style={[styles.createIconCircle, opt.soon && styles.createIconCircleFlat, { backgroundColor: opt.soon ? `${opt.color}22` : s.modalBackground }]}>
                    <opt.Icon size={28} color={opt.color} />
                  </View>
                  <Text style={[styles.createCardLabel, { color: s.modalTitle }]}>{opt.label}</Text>
                  {opt.soon && (
                    <View style={styles.createCardSoonBadge}>
                      <Text style={styles.createCardSoonText}>{t('common.comingSoon')}</Text>
                    </View>
                  )}
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
      {activeSheet === 'detail' && selectedOutfit && (
        <OutfitDetailSheet
          outfit={selectedOutfit}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleDetailSave}
          onSchedule={() => setActiveSheet('schedule')}
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
      <UpgradeModal
        visible={showVipUpgrade}
        requiredPlan="vip"
        onUpgrade={() => setShowVipUpgrade(false)}
        onClose={() => setShowVipUpgrade(false)}
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
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  categoryBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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

  // Card action row
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cardActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },

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
  createIconCircleFlat: {
    elevation: 0,
    shadowOpacity: 0,
  },
  createCardSoonBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
  },
  createCardSoonText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#92400E',
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

// ─── Essence styles ───────────────────────────────────────────────────────────

const essenceStyles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  sectionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionHeaderText: {
    flex: 1,
    gap: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  refImageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refImage: {
    width: 64,
    height: 64,
    borderRadius: 10,
  },
  refImageSmall: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  removeImageBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },
  removeImageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Analysis row (header + button inline)
  analyzeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  gemsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  gemsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  analyzeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 24,
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  analyzeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  // Empty analysis placeholder
  emptyAnalysis: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    gap: 8,
  },
  emptyAnalysisTitle: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyAnalysisText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Analysis result
  analysisResult: {
    gap: 10,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  analysisCardText: {
    flex: 1,
    gap: 4,
  },
  analysisCardTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  analysisCardBody: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Avatar section
  avatarLayout: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  avatarPreview: {
    width: 100,
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 8,
  },
  avatarEmptyText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  avatarActiveBadge: {
    position: 'absolute',
    bottom: 6,
    left: 4,
    right: 4,
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  avatarActiveBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  avatarInputs: {
    flex: 1,
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  avatarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#6D28D9',
  },
  generateBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  vipOverlay: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  vipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },

  // Colorimetry palette
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  paletteSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },

  // Tags management
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  tagAddBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsWrapLarge: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChipLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagChipLargeText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default Styles;
