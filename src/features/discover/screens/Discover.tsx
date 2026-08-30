import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  // TextInput, -- dormant: restore when /outfits/suggest backend endpoint is live
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import UpgradeModal from '@components/UpgradeModal';
import FeatureWelcomeModal from '@components/FeatureWelcomeModal';
import useDiscoverTheme from '@hooks/useDiscoverTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  SearchIcon,
  UploadCloudIcon,
  ExternalLinkIcon,
  ZapIcon,
  SparklesIcon,
  RefreshCwIcon,
  GemIcon,
  CheckIcon,
  UserIcon,
  AlertCircleIcon,
} from '@assets/icons';
import { loadProfile } from '@features/home/profileSlice';
import { loadCollection } from '@features/collection/collectionSlice';
import { addOutfit } from '@features/styles/stylesSlice';
import { suggestOutfit } from '@features/styles/api/stylesApi';
import { imageUrlToBase64 } from '@api/client';
import { logError } from '@utilities/crashlytics';
import { AppDispatch, RootState } from '@utilities/store';
import {
  identifyImage,
  findSimilar,
  combineOutfit,
} from '../api/discoverApi';
import { loadRecommendations } from '../discoverSlice';
import { RecommendedItem, IdentifiedItem, SourceChunk } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

type Tab = 'catalog' | 'visual' | 'combinator';
type CombinatorMode = 'flash' | 'pro';
const BOTTOM_TAB_HEIGHT = 56;

// ─── Sub-components ───────────────────────────────────────────────────────────

interface RecommendedCardProps {
  item: RecommendedItem;
  cardBackground: string;
  cardBorder: string;
  cardName: string;
  cardBrand: string;
  linkText: string;
}

function RecommendedCard({
  item,
  cardBackground,
  cardBorder,
  cardName,
  cardBrand,
  linkText,
}: RecommendedCardProps) {
  const handlePress = useCallback(() => {
    if (item.purchaseUrl) {
      Linking.openURL(item.purchaseUrl).catch(() => {});
    }
  }, [item.purchaseUrl]);

  return (
    <View style={[cardStyles.card, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
      <View style={cardStyles.imageWrap}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={cardStyles.image} resizeMode="cover" />
        ) : (
          <View style={[cardStyles.imagePlaceholder, { backgroundColor: cardBorder }]} />
        )}
      </View>
      <View style={cardStyles.info}>
        {item.brand ? (
          <Text style={[cardStyles.brand, { color: cardBrand }]} numberOfLines={1}>
            {item.brand}
          </Text>
        ) : null}
        <Text style={[cardStyles.name, { color: cardName }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.purchaseUrl ? (
          <Touchable onPress={handlePress} borderRadius={4} style={cardStyles.linkBtn}>
            <ExternalLinkIcon size={12} color={linkText} strokeWidth={2} />
            <Text style={[cardStyles.linkText, { color: linkText }]}>Ver</Text>
          </Touchable>
        ) : null}
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  imageWrap: {
    aspectRatio: 1,
    width: '100%',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  brand: {
    fontSize: 11,
    fontWeight: '500',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  linkText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

function Discover() {
  const { t } = useTranslation();
  const theme = useDiscoverTheme();
  const d = theme.discover;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const closetItems = useSelector((state: RootState) => state.collection.items);
  const closetStatus = useSelector((state: RootState) => state.collection.status);
  const profile = useSelector((state: RootState) => state.profile.data);

  const [activeTab, setActiveTab] = useState<Tab>('catalog');
  const bottomBarTotalHeight = BOTTOM_TAB_HEIGHT + insets.bottom;

  // ─── Catalog tab state ────────────────────────────────────────────────────────

  // Catalog lives in Redux so it survives this screen unmounting on drawer
  // navigation — otherwise each remount would re-trigger the gem-charged fetch.
  const catalogItems = useSelector((state: RootState) => state.discover.catalog);
  const catalogStatus = useSelector((state: RootState) => state.discover.status);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showBrandSheet, setShowBrandSheet] = useState(false);
  const [showCategorySheet, setShowCategorySheet] = useState(false);
  const [catalogRefreshing, setCatalogRefreshing] = useState(false);

  // Generating recommendations costs gems, so this only runs on an explicit
  // user action (Generate button / pull-to-refresh / refresh FAB) — never on
  // mount. Results are cached in Redux, so revisiting Discover never re-charges.
  const fetchCatalog = useCallback(async (isRefresh = false) => {
    if (closetItems.length === 0) return;
    if (isRefresh) {
      setCatalogRefreshing(true);
    }
    try {
      await dispatch(
        loadRecommendations({
          closet: closetItems,
          profile: {
            stylePrompt: profile?.stylePrompt ?? null,
            gender: profile?.gender ?? null,
            styleSummary: profile?.styleSummary ?? null,
          },
        }),
      ).unwrap();
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/fetchCatalog');
    } finally {
      if (isRefresh) {
        setCatalogRefreshing(false);
      }
    }
  }, [closetItems, profile, dispatch]);

  // Discover can be opened directly (e.g. from the drawer) before the
  // Collection screen has loaded the closet into Redux. Load it here when idle
  // so the catalog has the closet to work from regardless of entry point.
  useEffect(() => {
    if (closetStatus === 'idle') {
      dispatch(loadCollection());
    }
  }, [closetStatus, dispatch]);

  const allBrands = Array.from(new Set(catalogItems.map(i => i.brand).filter(Boolean))).sort();
  const allCategories = Array.from(new Set(catalogItems.map(i => i.category).filter(Boolean))).sort();

  const filteredCatalogItems = catalogItems.filter(item => {
    if (brandFilter && item.brand !== brandFilter) return false;
    if (categoryFilter && item.category !== categoryFilter) return false;
    return true;
  });

  // ─── Visual search tab state ──────────────────────────────────────────────────

  const { openGallery } = useCameraPermission();
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedMimeType, setSelectedMimeType] = useState<string>('image/jpeg');
  const [identifiedItems, setIdentifiedItems] = useState<IdentifiedItem[]>([]);
  const [activeItem, setActiveItem] = useState<IdentifiedItem | null>(null);
  const [similarSources, setSimilarSources] = useState<SourceChunk[]>([]);
  const [visualStatus, setVisualStatus] = useState<'idle' | 'identifying' | 'searching' | 'error'>('idle');
  const [visualError, setVisualError] = useState<string | null>(null);

  const handlePickImage = useCallback(async () => {
    const result = await openGallery();
    if (result.status !== 'success') return;
    const asset = result.response.assets?.[0];
    if (!asset?.base64 || !asset?.type) return;

    setSelectedImageBase64(asset.base64);
    setSelectedMimeType(asset.type);
    setIdentifiedItems([]);
    setActiveItem(null);
    setSimilarSources([]);
    setVisualError(null);
    setVisualStatus('identifying');

    try {
      const items = await identifyImage({ imageBase64: asset.base64, mimeType: asset.type });
      setIdentifiedItems(items);
      setVisualStatus('idle');
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/identifyImage');
      setVisualError(t('discover.visualError'));
      setVisualStatus('error');
    }
  }, [openGallery, t]);

  const handleSelectItem = useCallback(async (item: IdentifiedItem) => {
    if (!selectedImageBase64 || !selectedMimeType) return;
    setActiveItem(item);
    setSimilarSources([]);
    setVisualStatus('searching');
    setVisualError(null);
    try {
      const result = await findSimilar({
        imageBase64: selectedImageBase64,
        mimeType: selectedMimeType,
        itemDescription: `${item.name} ${item.category}`,
      });
      const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      setSimilarSources(chunks);
      setVisualStatus('idle');
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/findSimilar');
      setVisualError(t('discover.visualError'));
      setVisualStatus('error');
    }
  }, [selectedImageBase64, selectedMimeType, dispatch, t]);

  // ─── Combinador tab state ─────────────────────────────────────────────────────

  const [combinatorMode, setCombinatorMode] = useState<CombinatorMode>('flash');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dormant: restore when /outfits/suggest backend endpoint is live
  const [flashPrompt, setFlashPrompt] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dormant
  const [flashStatus, setFlashStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dormant
  const [flashError, setFlashError] = useState<string | null>(null);
  const [flashResultItemIds, setFlashResultItemIds] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dormant
  const [flashResultName, setFlashResultName] = useState<string>('');

  const [proSelectedIds, setProSelectedIds] = useState<Set<string>>(new Set());
  const [proStatus, setProStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [proError, setProError] = useState<string | null>(null);
  const [proCombinedImage, setProCombinedImage] = useState<string | null>(null);
  const [proSaving, setProSaving] = useState(false);
  const [proSaved, setProSaved] = useState(false);
  const [showProUpgrade, setShowProUpgrade] = useState(false);
  const [closetRefreshing, setClosetRefreshing] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- dormant: restore when /outfits/suggest backend endpoint is live
  const handleFlashGenerate = useCallback(async () => {
    if (!flashPrompt.trim()) return;
    setFlashStatus('loading');
    setFlashError(null);
    setFlashResultItemIds([]);
    setFlashResultName('');
    try {
      const result = await suggestOutfit({
        prompt: flashPrompt,
        closetItemIds: closetItems.map(i => i.id),
      });
      setFlashResultItemIds(result.itemIds);
      setFlashResultName(result.name);
      setFlashStatus('idle');
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/flashGenerate');
      setFlashError(t('discover.combinatorFlashError'));
      setFlashStatus('error');
    }
  }, [flashPrompt, closetItems, dispatch, t]);

  const handleProCombine = useCallback(async () => {
    const avatarImageRaw = profile?.avatarImage;
    if (!avatarImageRaw) return;
    const selectedItems = closetItems
      .filter(i => proSelectedIds.has(i.id) && !!i.imageData)
      .map(i => ({ id: i.id, name: i.name, imageData: i.imageData! }));
    if (selectedItems.length === 0) return;

    setProStatus('loading');
    setProError(null);
    // Don't clear proCombinedImage here — keep the previous result visible
    // until a new one arrives; clearing it upfront means a failure leaves the
    // user with nothing to show.
    try {
      // Convert all URLs to base64 data URLs before sending — the backend
      // expects base64, not relative paths or CDN URLs.
      const [avatarImage, ...convertedItems] = await Promise.all([
        imageUrlToBase64(avatarImageRaw),
        ...selectedItems.map(async item => ({
          ...item,
          imageData: await imageUrlToBase64(item.imageData),
        })),
      ]);
      const result = await combineOutfit({ items: convertedItems, avatarImage });
      // Backend returns raw base64 (no data URL prefix) — add it before rendering
      const raw = result.combinedImage;
      const dataUrl = raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`;
      setProCombinedImage(dataUrl);
      setProStatus('idle');
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/proCombine');
      setProError(t('discover.combinatorProError'));
      setProStatus('error');
    }
  }, [profile?.avatarImage, closetItems, proSelectedIds, dispatch, t]);

  const handleProSaveOutfit = useCallback(async () => {
    if (!proCombinedImage) return;
    setProSaving(true);
    try {
      const itemIds = Array.from(proSelectedIds);
      await dispatch(addOutfit({ name: t('discover.combinatorProSavedName'), itemIds }));
      setProSaved(true);
      setTimeout(() => setProSaved(false), 3000);
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'discover/proSaveOutfit');
    } finally {
      setProSaving(false);
    }
  }, [proCombinedImage, proSelectedIds, dispatch, t]);

  const toggleProItem = useCallback((id: string) => {
    setProSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // ─── Render helpers ───────────────────────────────────────────────────────────

  const renderGemBadge = (count: number) => (
    <View style={[styles.gemBadge, { backgroundColor: d.gemBadgeBackground, borderColor: d.gemBadgeBorder }]}>
      <GemIcon size={12} color={d.gemBadgeText} />
      <Text style={[styles.gemBadgeText, { color: d.gemBadgeText }]}>{count}</Text>
    </View>
  );

  const renderCatalogTab = () => {
    const closetResolving = closetStatus === 'idle' || closetStatus === 'loading';
    const hasEmptyCloset = closetStatus === 'succeeded' && closetItems.length === 0;

    // Closet still loading (e.g. Discover opened before Collection) or catalog
    // being generated — show a spinner rather than a misleading empty state.
    if (closetResolving || (catalogStatus === 'loading' && !catalogRefreshing)) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={d.bottomBarActive} />
        </View>
      );
    }

    if (hasEmptyCloset) {
      return (
        <View style={[styles.dashedContainer, { paddingBottom: bottomBarTotalHeight + 16 }]}>
          <View style={[styles.dashedBox, { borderColor: d.dashedBorder, backgroundColor: d.dashedBackground }]}>
            <SearchIcon size={44} color={d.emptyIcon} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: d.emptyText }]}>{t('discover.catalogEmptyTitle')}</Text>
            <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.catalogEmptyDesc')}</Text>
          </View>
        </View>
      );
    }

    // Recommendations cost gems, so they are only generated on explicit request.
    if (catalogStatus === 'idle') {
      return (
        <View style={[styles.dashedContainer, { paddingBottom: bottomBarTotalHeight + 16 }]}>
          <View style={[styles.dashedBox, { borderColor: d.dashedBorder, backgroundColor: d.dashedBackground }]}>
            <SparklesIcon size={44} color={d.emptyIcon} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: d.emptyText }]}>{t('discover.catalogGenerateTitle')}</Text>
            <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.catalogGenerateDesc')}</Text>
            <Touchable
              onPress={() => fetchCatalog()}
              borderRadius={24}
              style={[styles.retryBtn, { backgroundColor: d.buttonPrimary }]}
            >
              <Text style={[styles.retryBtnText, { color: d.buttonPrimaryText }]}>{t('discover.catalogGenerateButton')}</Text>
            </Touchable>
          </View>
        </View>
      );
    }

    if (catalogStatus === 'failed') {
      return (
        <View style={styles.center}>
          <AlertCircleIcon size={36} color={d.buttonDangerText} />
          <Text style={[styles.errorText, { color: d.buttonDangerText }]}>{t('discover.catalogError')}</Text>
          <Touchable
            onPress={() => fetchCatalog()}
            borderRadius={24}
            style={[styles.retryBtn, { backgroundColor: d.buttonPrimary }]}
          >
            <Text style={[styles.retryBtnText, { color: d.buttonPrimaryText }]}>{t('discover.retry')}</Text>
          </Touchable>
        </View>
      );
    }

    return (
      <View style={styles.tabFlex}>
        {/* Filter row */}
        <View style={styles.filterRow}>
          <Touchable
            onPress={() => setShowBrandSheet(true)}
            borderRadius={24}
            style={[
              styles.filterPill,
              brandFilter
                ? { backgroundColor: d.filterPillActiveBackground, borderColor: d.filterPillActiveBorder }
                : { backgroundColor: d.filterPillBackground, borderColor: d.filterPillBorder },
            ]}
          >
            <Text style={[styles.filterPillText, { color: brandFilter ? d.filterPillActiveText : d.filterPillText }]}>
              {brandFilter ?? t('discover.filterBrand')}
            </Text>
          </Touchable>

          <Touchable
            onPress={() => setShowCategorySheet(true)}
            borderRadius={24}
            style={[
              styles.filterPill,
              categoryFilter
                ? { backgroundColor: d.filterPillActiveBackground, borderColor: d.filterPillActiveBorder }
                : { backgroundColor: d.filterPillBackground, borderColor: d.filterPillBorder },
            ]}
          >
            <Text style={[styles.filterPillText, { color: categoryFilter ? d.filterPillActiveText : d.filterPillText }]}>
              {categoryFilter ?? t('discover.filterCategory')}
            </Text>
          </Touchable>
        </View>

        {catalogItems.length === 0 ? (
          <View style={[styles.dashedContainer, { paddingBottom: bottomBarTotalHeight + 16 }]}>
            <View style={[styles.dashedBox, { borderColor: d.dashedBorder, backgroundColor: d.dashedBackground }]}>
              <SearchIcon size={44} color={d.emptyIcon} strokeWidth={1.5} />
              <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.catalogEmptyResult')}</Text>
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredCatalogItems}
            keyExtractor={(item, idx) => `${item.name}-${idx}`}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            contentContainerStyle={[styles.gridContent, { paddingBottom: bottomBarTotalHeight + 80 }]}
            showsVerticalScrollIndicator={false}
            refreshing={catalogRefreshing}
            onRefresh={() => fetchCatalog(true)}
            renderItem={({ item }) => (
              <RecommendedCard
                item={item}
                cardBackground={d.cardBackground}
                cardBorder={d.cardBorder}
                cardName={d.cardName}
                cardBrand={d.cardBrand}
                linkText={d.linkText}
              />
            )}
          />
        )}

        {/* Refresh FAB */}
        <View style={[styles.fabContainer, { bottom: bottomBarTotalHeight + 16 }]}>
          {renderGemBadge(2)}
          <Touchable
            onPress={() => fetchCatalog(true)}
            disabled={catalogRefreshing}
            borderRadius={28}
            style={[styles.fab, { backgroundColor: d.fabBackground, opacity: catalogRefreshing ? 0.6 : 1 }]}
          >
            {catalogRefreshing ? (
              <ActivityIndicator size="small" color={d.fabIcon} />
            ) : (
              <RefreshCwIcon size={22} color={d.fabIcon} />
            )}
          </Touchable>
        </View>
      </View>
    );
  };

  const renderVisualTab = () => (
    <ScrollView
      style={styles.tabFlex}
      contentContainerStyle={[styles.visualScroll, { paddingBottom: bottomBarTotalHeight + 32 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Upload zone */}
      <Touchable
        onPress={handlePickImage}
        borderRadius={20}
        disabled={visualStatus === 'identifying'}
        style={[styles.uploadZone, { borderColor: d.dashedBorder, backgroundColor: d.dashedBackground }]}
      >
        {selectedImageBase64 ? (
          <Image
            source={{ uri: `data:${selectedMimeType};base64,${selectedImageBase64}` }}
            style={styles.uploadedImage}
            resizeMode="cover"
          />
        ) : (
          <>
            <UploadCloudIcon size={40} color={d.emptyIcon} strokeWidth={1.5} />
            <Text style={[styles.uploadZoneText, { color: d.emptyText }]}>{t('discover.visualUploadTitle')}</Text>
            <Text style={[styles.uploadZoneSub, { color: d.emptySubtitle }]}>{t('discover.visualUploadDesc')}</Text>
          </>
        )}
      </Touchable>

      {/* Gem cost note */}
      {selectedImageBase64 && (
        <View style={styles.gemCostRow}>
          {renderGemBadge(2)}
          <Text style={[styles.gemCostText, { color: d.emptySubtitle }]}>{t('discover.visualGemCost')}</Text>
        </View>
      )}

      {/* Status */}
      {visualStatus === 'identifying' && (
        <View style={styles.statusRow}>
          <ActivityIndicator color={d.bottomBarActive} />
          <Text style={[styles.statusText, { color: d.emptySubtitle }]}>{t('discover.visualIdentifying')}</Text>
        </View>
      )}

      {visualStatus === 'error' && (
        <View style={styles.errorRow}>
          <AlertCircleIcon size={20} color={d.buttonDangerText} />
          <Text style={[styles.errorText, { color: d.buttonDangerText }]}>{visualError}</Text>
        </View>
      )}

      {/* Identified chips */}
      {identifiedItems.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: d.headerSubtitle }]}>{t('discover.visualIdentifiedLabel')}</Text>
          <View style={styles.chipsRow}>
            {identifiedItems.map((item, idx) => {
              const isActive = activeItem?.name === item.name;
              return (
                <Touchable
                  // eslint-disable-next-line react/no-array-index-key
                  key={idx}
                  onPress={() => handleSelectItem(item)}
                  borderRadius={20}
                  disabled={visualStatus === 'searching'}
                  style={[
                    styles.chip,
                    isActive
                      ? { backgroundColor: d.chipActiveBackground, borderColor: d.chipActiveBorder }
                      : { backgroundColor: d.chipBackground, borderColor: d.chipBorder },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isActive ? d.chipActiveText : d.chipText }]}>
                    {item.name}
                  </Text>
                </Touchable>
              );
            })}
          </View>
        </>
      )}

      {/* Searching indicator */}
      {visualStatus === 'searching' && (
        <View style={styles.statusRow}>
          <ActivityIndicator color={d.bottomBarActive} />
          <Text style={[styles.statusText, { color: d.emptySubtitle }]}>{t('discover.visualSearching')}</Text>
        </View>
      )}

      {/* Source links */}
      {similarSources.length > 0 && (
        <>
          <Text style={[styles.sectionLabel, { color: d.headerSubtitle }]}>{t('discover.visualSourcesLabel')}</Text>
          <View style={styles.sourcesContainer}>
            {similarSources.map((chunk, idx) => (
              <Touchable
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                onPress={() => Linking.openURL(chunk.web.uri).catch(() => {})}
                borderRadius={12}
                style={[styles.sourceRow, { backgroundColor: d.sourceLinkBackground, borderColor: d.sourceLinkBorder }]}
              >
                <Text style={[styles.sourceTitle, { color: d.sourceLinkTitle }]} numberOfLines={1}>
                  {chunk.web.title || chunk.web.uri}
                </Text>
                <ExternalLinkIcon size={16} color={d.sourceLinkIcon} strokeWidth={1.5} />
              </Touchable>
            ))}
          </View>
        </>
      )}

      {similarSources.length === 0 && visualStatus === 'idle' && activeItem && (
        <View style={styles.center}>
          <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.visualNoSources')}</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderCombinatorTab = () => {
    const avatarImage = profile?.avatarImage ?? null;

    return (
      <View style={styles.tabFlex}>
        {/* Segmented control */}
        <View style={[styles.segmentControl, { backgroundColor: d.segmentBackground, borderColor: d.segmentBorder }]}>
          {(['flash', 'pro'] as CombinatorMode[]).map(mode => {
            const isActive = combinatorMode === mode;
            return (
              <Touchable
                key={mode}
                onPress={() => {
                  if (mode === 'pro' && profile?.plan !== 'premium' && profile?.plan !== 'vip') {
                    setShowProUpgrade(true);
                  } else {
                    setCombinatorMode(mode);
                  }
                }}
                borderRadius={10}
                style={[
                  styles.segmentItem,
                  isActive && { backgroundColor: d.segmentActiveBackground },
                ]}
              >
                {mode === 'flash' ? (
                  <ZapIcon size={14} color={isActive ? d.segmentActiveText : d.segmentInactiveText} strokeWidth={2} />
                ) : (
                  <SparklesIcon size={14} color={isActive ? d.segmentActiveText : d.segmentInactiveText} strokeWidth={2} />
                )}
                <Text style={[
                  styles.segmentText,
                  { color: isActive ? d.segmentActiveText : d.segmentInactiveText },
                ]}>
                  {mode === 'flash' ? t('discover.combinatorFlashLabel') : t('discover.combinatorProLabel')}
                </Text>
              </Touchable>
            );
          })}
        </View>

        {combinatorMode === 'flash' ? renderFlashMode() : renderProMode(avatarImage)}
      </View>
    );
  };

  const renderFlashMode = () => {
    // TODO: unhide when /outfits/suggest backend endpoint is live
    // Full implementation preserved below — only the return is swapped out
    const flashItems = closetItems.filter(i => flashResultItemIds.includes(i.id)); // eslint-disable-line @typescript-eslint/no-unused-vars

    return (
      <View style={[styles.comingSoonContainer, { paddingBottom: bottomBarTotalHeight + 32 }]}>
        <ZapIcon size={48} color={d.emptyIcon} strokeWidth={1.5} />
        <Text style={[styles.emptyTitle, { color: d.emptyText }]}>{t('common.comingSoon')}</Text>
        <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.combinatorFlashComingSoon')}</Text>
      </View>
    );

    /* --- unhide block start ---
    return (
      <ScrollView
        contentContainerStyle={[styles.flashScroll, { paddingBottom: bottomBarTotalHeight + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gemCostRow}>
          {renderGemBadge(3)}
          <Text style={[styles.gemCostText, { color: d.emptySubtitle }]}>{t('discover.combinatorFlashCost')}</Text>
        </View>
        <TextInput
          value={flashPrompt}
          onChangeText={setFlashPrompt}
          placeholder={t('discover.combinatorFlashPlaceholder')}
          placeholderTextColor={d.modalInputPlaceholder}
          style={[styles.promptInput, { backgroundColor: d.modalInputBackground, borderColor: d.modalInputBorder, color: d.modalInputText }]}
          editable={flashStatus !== 'loading'}
          multiline
        />
        <Touchable
          onPress={handleFlashGenerate}
          disabled={flashStatus === 'loading' || !flashPrompt.trim()}
          borderRadius={24}
          style={[styles.generateBtn, { backgroundColor: d.buttonPrimary, opacity: flashStatus === 'loading' || !flashPrompt.trim() ? 0.6 : 1 }]}
        >
          {flashStatus === 'loading'
            ? <ActivityIndicator size="small" color={d.buttonPrimaryText} />
            : <ZapIcon size={16} color={d.buttonPrimaryText} />}
          <Text style={[styles.generateBtnText, { color: d.buttonPrimaryText }]}>
            {flashStatus === 'loading' ? t('discover.combinatorGenerating') : t('discover.combinatorFlashGenerate')}
          </Text>
        </Touchable>
        {flashStatus === 'error' && (
          <Text style={[styles.errorText, { color: d.buttonDangerText }]}>{flashError}</Text>
        )}
        {flashResultItemIds.length > 0 && (
          <View style={styles.flashResult}>
            <Text style={[styles.sectionLabel, { color: d.headerSubtitle }]}>{t('discover.combinatorFlashResultLabel')}</Text>
            <Text style={[styles.flashResultName, { color: d.headerTitle }]}>{flashResultName}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashItemsRow}>
              {flashItems.map(item => (
                <View key={item.id} style={[styles.flashItem, { backgroundColor: d.cardBackground, borderColor: d.cardBorder }]}>
                  {item.imageData ? (
                    <AuthedImage data={item.imageData} style={styles.flashItemImage} resizeMode="cover" />
                  ) : null}
                  <Text style={[styles.flashItemName, { color: d.cardName }]} numberOfLines={2}>{item.name}</Text>
                </View>
              ))}
              {flashResultItemIds.filter(id => !closetItems.find(i => i.id === id)).length > 0 && (
                <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.combinatorFlashSomeNotInCloset')}</Text>
              )}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    );
    --- unhide block end --- */
  };

  const renderProMode = (avatarImage: string | null) => (
    <ScrollView
      contentContainerStyle={[styles.proScroll, { paddingBottom: bottomBarTotalHeight + 32 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={closetRefreshing}
          onRefresh={async () => {
            setClosetRefreshing(true);
            await dispatch(loadCollection());
            setClosetRefreshing(false);
          }}
          tintColor={d.bottomBarActive}
        />
      }
    >
      {/* Gem cost */}
      <View style={styles.gemCostRow}>
        {renderGemBadge(10)}
        <Text style={[styles.gemCostText, { color: d.emptySubtitle }]}>{t('discover.combinatorProCost')}</Text>
      </View>

      {!avatarImage ? (
        <View style={[styles.dashedBox, { borderColor: d.dashedBorder, backgroundColor: d.dashedBackground }]}>
          <UserIcon size={36} color={d.emptyIcon} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: d.emptyText }]}>{t('discover.combinatorProNoAvatar')}</Text>
          <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.combinatorProNoAvatarDesc')}</Text>
        </View>
      ) : (
        <>
          {/* Avatar preview */}
          <View style={styles.proAvatarRow}>
            <AuthedImage
              data={avatarImage}
              style={[styles.proAvatar, { borderColor: d.cardBorder }]}
              resizeMode="contain"
            />
            <Text style={[styles.sectionLabel, { color: d.headerSubtitle }]}>{t('discover.combinatorProSelectItems')}</Text>
          </View>

          {/* Closet grid */}
          {closetItems.length === 0 ? (
            <Text style={[styles.emptySub, { color: d.emptySubtitle }]}>{t('discover.combinatorProEmptyCloset')}</Text>
          ) : (
            <View style={styles.proGrid}>
              {closetItems.map(item => {
                const isSelected = proSelectedIds.has(item.id);
                return (
                  <Touchable
                    key={item.id}
                    onPress={() => toggleProItem(item.id)}
                    disabled={proStatus === 'loading'}
                    borderRadius={12}
                    style={[
                      styles.proClosetItem,
                      {
                        backgroundColor: d.closetItemBackground,
                        borderColor: isSelected ? d.closetItemSelectedBorder : d.closetItemBorder,
                        borderWidth: isSelected ? 2 : 1,
                        opacity: proStatus === 'loading' ? 0.5 : 1,
                      },
                    ]}
                  >
                    {item.imageData ? (
                      <AuthedImage data={item.imageData} style={styles.proClosetImage} resizeMode="cover" />
                    ) : null}
                    {isSelected && (
                      <View style={[styles.proSelectedBadge, { backgroundColor: d.closetItemSelectedBadge }]}>
                        <CheckIcon size={12} color={d.closetItemSelectedCheck} />
                      </View>
                    )}
                    <Text style={[styles.proClosetName, { color: d.cardName }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </Touchable>
                );
              })}
            </View>
          )}

          {/* Combine button */}
          <Touchable
            onPress={handleProCombine}
            disabled={proStatus === 'loading' || proSelectedIds.size === 0}
            borderRadius={24}
            style={[
              styles.generateBtn,
              {
                backgroundColor: d.buttonPrimary,
                opacity: proStatus === 'loading' || proSelectedIds.size === 0 ? 0.6 : 1,
              },
            ]}
          >
            {proStatus === 'loading' ? (
              <ActivityIndicator size="small" color={d.buttonPrimaryText} />
            ) : (
              <SparklesIcon size={16} color={d.buttonPrimaryText} />
            )}
            <Text style={[styles.generateBtnText, { color: d.buttonPrimaryText }]}>
              {proStatus === 'loading' ? t('discover.combinatorGenerating') : t('discover.combinatorProCombine')}
            </Text>
          </Touchable>

          {proStatus === 'error' && (
            <Text style={[styles.errorText, { color: d.buttonDangerText }]}>{proError}</Text>
          )}

          {/* Combined result */}
          {proCombinedImage && (
            <View style={styles.proResultContainer}>
              <Text style={[styles.sectionLabel, { color: d.headerSubtitle }]}>{t('discover.combinatorProResultLabel')}</Text>
              <View style={[styles.proResultImageWrap, { borderColor: d.resultImageBorder, backgroundColor: d.resultImageBackground }]}>
                <Image
                  source={{ uri: proCombinedImage }}
                  style={styles.proResultImage}
                  resizeMode="contain"
                />
              </View>
              <Touchable
                onPress={handleProSaveOutfit}
                disabled={proSaving || proSaved}
                borderRadius={24}
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: proSaved ? d.successBackground : d.fabBackground,
                    opacity: proSaving ? 0.6 : 1,
                  },
                ]}
              >
                {proSaving ? (
                  <ActivityIndicator size="small" color={d.fabIcon} />
                ) : proSaved ? (
                  <CheckIcon size={18} color={d.successText} />
                ) : null}
                <Text style={[styles.saveBtnText, { color: proSaved ? d.successText : d.fabIcon }]}>
                  {proSaved ? t('discover.combinatorProSaved') : t('discover.combinatorProSave')}
                </Text>
              </Touchable>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  // ─── Filter sheets ────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { key: 'catalog', label: t('discover.tabCatalog'), Icon: SearchIcon },
    { key: 'visual', label: t('discover.tabVisual'), Icon: UploadCloudIcon },
    { key: 'combinator', label: t('discover.tabCombinator'), Icon: SparklesIcon },
  ];

  return (
    <View style={[styles.root, { backgroundColor: d.background }]}>
      <FeatureWelcomeModal
        tour="discover-tour"
        titleKey="menu.discover"
        stepKeys={[
          'onboarding.discoverStep1',
          'onboarding.discoverStep2',
          'onboarding.discoverStep3',
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: d.headerTitle }]}>{t('discover.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: d.headerSubtitle }]}>{t('discover.subtitle')}</Text>
      </View>

      {/* Content */}
      {activeTab === 'catalog' && renderCatalogTab()}
      {activeTab === 'visual' && renderVisualTab()}
      {activeTab === 'combinator' && renderCombinatorTab()}

      {/* Bottom tab bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: d.bottomBarBackground,
            borderTopColor: d.bottomBarBorder,
            height: bottomBarTotalHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const color = isActive ? d.bottomBarActive : d.bottomBarInactive;
          return (
            <Touchable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              borderRadius={8}
              style={styles.bottomTabItem}
            >
              <tab.Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 1.75} />
              <Text style={[styles.bottomTabLabel, { color }]}>{tab.label}</Text>
            </Touchable>
          );
        })}
      </View>

      {/* Brand filter sheet */}
      {showBrandSheet && (
        <TouchableWithoutFeedback onPress={() => setShowBrandSheet(false)}>
          <View style={[styles.backdrop, { backgroundColor: d.modalBackdrop }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: d.modalBackground }]}>
                <View style={[styles.sheetHeader, { borderBottomColor: d.modalBorder }]}>
                  <Text style={[styles.sheetTitle, { color: d.modalTitle }]}>{t('discover.filterBrand')}</Text>
                </View>
                {([null, ...allBrands] as (string | null)[]).map(brand => (
                  <Touchable
                    key={brand ?? 'all'}
                    onPress={() => { setBrandFilter(brand); setShowBrandSheet(false); }}
                    borderRadius={0}
                    style={[styles.sheetOption, { borderBottomColor: d.modalBorder }]}
                  >
                    <Text style={[styles.sheetOptionText, { color: d.modalTitle }]}>
                      {brand ?? t('discover.filterAll')}
                    </Text>
                    {brandFilter === brand && <CheckIcon size={18} color={d.bottomBarActive} />}
                  </Touchable>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      {/* Category filter sheet */}
      {showCategorySheet && (
        <TouchableWithoutFeedback onPress={() => setShowCategorySheet(false)}>
          <View style={[styles.backdrop, { backgroundColor: d.modalBackdrop }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { backgroundColor: d.modalBackground }]}>
                <View style={[styles.sheetHeader, { borderBottomColor: d.modalBorder }]}>
                  <Text style={[styles.sheetTitle, { color: d.modalTitle }]}>{t('discover.filterCategory')}</Text>
                </View>
                {([null, ...allCategories] as (string | null)[]).map(cat => (
                  <Touchable
                    key={cat ?? 'all'}
                    onPress={() => { setCategoryFilter(cat); setShowCategorySheet(false); }}
                    borderRadius={0}
                    style={[styles.sheetOption, { borderBottomColor: d.modalBorder }]}
                  >
                    <Text style={[styles.sheetOptionText, { color: d.modalTitle }]}>
                      {cat ?? t('discover.filterAll')}
                    </Text>
                    {categoryFilter === cat && <CheckIcon size={18} color={d.bottomBarActive} />}
                  </Touchable>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      )}

      <UpgradeModal
        visible={showProUpgrade}
        requiredPlan="premium"
        onUpgrade={() => setShowProUpgrade(false)}
        onClose={() => setShowProUpgrade(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 4,
  },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },

  tabFlex: { flex: 1 },

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 24,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 13, fontWeight: '600' },

  // Grid
  gridContent: { paddingHorizontal: 12, paddingTop: 8 },
  gridRow: { gap: 12, marginBottom: 12 },

  // Empty / error
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  dashedContainer: { flex: 1, padding: 16 },
  dashedBox: {
    flex: 1,
    minHeight: 200,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  comingSoonContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  errorText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  retryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 8,
  },
  retryBtnText: { fontSize: 14, fontWeight: '700' },

  // FAB (catalog)
  fabContainer: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
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

  // Gem badge
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  gemBadgeText: { fontSize: 12, fontWeight: '700' },
  gemCostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  gemCostText: { fontSize: 13 },

  // Visual search
  visualScroll: { padding: 16, gap: 16 },
  uploadZone: {
    minHeight: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
    overflow: 'hidden',
  },
  uploadedImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  uploadZoneText: { fontSize: 16, fontWeight: '700' },
  uploadZoneSub: { fontSize: 13, textAlign: 'center' },

  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusText: { fontSize: 14 },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  sectionLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  sourcesContainer: { gap: 8 },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  sourceTitle: { flex: 1, fontSize: 14, fontWeight: '500' },

  // Combinador
  segmentControl: {
    flexDirection: 'row',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentText: { fontSize: 13, fontWeight: '700' },

  flashScroll: { paddingHorizontal: 16, paddingTop: 0, gap: 14 },
  promptInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
  },
  generateBtnText: { fontSize: 15, fontWeight: '700' },

  flashResult: { gap: 8 },
  flashResultName: { fontSize: 16, fontWeight: '700' },
  flashItemsRow: { gap: 10, paddingVertical: 4 },
  flashItem: {
    width: 100,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
  },
  flashItemImage: { width: 100, height: 100 },
  flashItemName: { fontSize: 11, fontWeight: '600', padding: 6, textAlign: 'center' },

  // PRO mode
  proScroll: { paddingHorizontal: 16, paddingTop: 0, gap: 14 },
  proAvatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  proAvatar: {
    width: 80,
    height: 110,
    borderRadius: 12,
    borderWidth: 2,
  },
  proGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  proClosetItem: {
    width: '30%',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingBottom: 6,
  },
  proClosetImage: { width: '100%', aspectRatio: 1 },
  proSelectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proClosetName: { fontSize: 11, fontWeight: '600', marginTop: 4, paddingHorizontal: 4, textAlign: 'center' },

  proResultContainer: { gap: 10 },
  proResultImageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proResultImage: { width: '100%', height: '100%' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700' },

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
  bottomTabLabel: { fontSize: 10, fontWeight: '600' },

  // Filter sheets (manual overlay — sheets use TouchableWithoutFeedback for dismiss)
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    overflow: 'hidden',
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700' },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },
});

export default Discover;
