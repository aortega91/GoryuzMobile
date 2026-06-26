import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import BottomSheet from '@components/BottomSheet';
import useSecondLifeTheme from '@hooks/useSecondLifeTheme';
import { AppDispatch, RootState } from '@utilities/store';
import { loadProfile } from '@features/home/profileSlice';
import { removeItemLocally } from '@features/collection/collectionSlice';
import { logError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import {
  ShoppingBagIcon,
  GiftIcon,
  RepeatIcon,
  CheckIcon,
  MessageIcon,
  HeartIcon,
  UsersIcon,
  StarIcon,
  ShirtIcon,
  SparklesIcon,
} from '@assets/icons';

import { updateProfile } from '@features/profile/api/profileUpdateApi';
import { removeCollectionItem } from '@features/collection/api/collectionApi';
import {
  fetchMySecondLifeItems,
  addToSecondLife,
  returnToCloset,
  fetchMarketplace,
  toggleMarketplaceFavorite,
} from '../api/secondLifeApi';
import { SecondLifeItem, MarketplaceItem, SecondLifeStatus } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'vitrina' | 'explorar' | 'impacto';
type VitrinaFilter = 'all' | 'sale' | 'gift' | 'trade' | 'completed';
type MarketplaceSubTab = 'explore' | 'favorites';
type MarketplaceFilter = 'all' | 'sale' | 'gift' | 'trade';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCompleted(status: SecondLifeStatus): boolean {
  return status === 'sold' || status === 'gifted' || status === 'traded';
}

function formatDate(ts: string | Date): string {
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

function SecondLife() {
  const theme = useSecondLifeTheme();
  const sl = theme.secondLife;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const profile = useSelector((s: RootState) => s.profile?.data);

  // ─── Main tab ──────────────────────────────────────────────────────────────

  const [mainTab, setMainTab] = useState<MainTab>('vitrina');

  // ─── Vitrina state ─────────────────────────────────────────────────────────

  const [myItems, setMyItems] = useState<SecondLifeItem[]>([]);
  const [myLoading, setMyLoading] = useState(false);
  const [myRefreshing, setMyRefreshing] = useState(false);
  const [vitrinaFilter, setVitrinaFilter] = useState<VitrinaFilter>('all');
  const [selectedItem, setSelectedItem] = useState<SecondLifeItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [editPrice, setEditPrice] = useState('');

  // ─── Marketplace state ─────────────────────────────────────────────────────

  const [marketplace, setMarketplace] = useState<MarketplaceItem[]>([]);
  const [mktLoading, setMktLoading] = useState(false);
  const [mktRefreshing, setMktRefreshing] = useState(false);
  const [mktSubTab, setMktSubTab] = useState<MarketplaceSubTab>('explore');
  const [mktFilter, setMktFilter] = useState<MarketplaceFilter>('all');
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [selectedMarketItem, setSelectedMarketItem] = useState<MarketplaceItem | null>(null);

  const impactStats = useMemo(
    () => profile?.impactStats ?? { sold: 0, gifted: 0, traded: 0 },
    [profile?.impactStats],
  );

  // ─── Load my items ─────────────────────────────────────────────────────────

  const loadMyItems = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setMyRefreshing(true);
    } else {
      setMyLoading(true);
    }
    try {
      const items = await fetchMySecondLifeItems();
      setMyItems(items);
    } catch (err) {
      logError(err, 'secondLife/loadMyItems');
    } finally {
      setMyLoading(false);
      setMyRefreshing(false);
    }
  }, []);

  const loadMarketplace = useCallback(async (refreshing = false) => {
    if (refreshing) {
      setMktRefreshing(true);
    } else {
      setMktLoading(true);
    }
    try {
      const items = await fetchMarketplace();
      setMarketplace(items);
    } catch (err) {
      logError(err, 'secondLife/loadMarketplace');
    } finally {
      setMktLoading(false);
      setMktRefreshing(false);
    }
  }, []);

  // Seed likedIds from profile.marketplaceFavorites
  useEffect(() => {
    if (profile?.marketplaceFavorites) {
      setLikedIds(new Set(profile.marketplaceFavorites));
    }
  }, [profile?.marketplaceFavorites]);

  useEffect(() => {
    loadMyItems();
  }, [loadMyItems]);

  useEffect(() => {
    if (mainTab === 'explorar' && marketplace.length === 0 && !mktLoading) {
      loadMarketplace();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTab]);

  // ─── Actions ───────────────────────────────────────────────────────────────

  const openItemModal = useCallback((item: SecondLifeItem) => {
    setSelectedItem(item);
    setEditPrice(item.price ?? '');
  }, []);

  const handleSavePrice = useCallback(async (item: SecondLifeItem, price: string) => {
    const trimmed = price.trim();
    if (trimmed === (item.price ?? '')) { return; }
    try {
      await addToSecondLife({ itemId: item.id, status: 'sale', price: trimmed });
      setMyItems(prev => prev.map(i => (i.id === item.id ? { ...i, price: trimmed } : i)));
      setSelectedItem(prev => (prev?.id === item.id ? { ...prev, price: trimmed } : prev));
    } catch (err) {
      logError(err, 'secondLife/savePrice');
      toast.error(t('secondLife.toastError'));
    }
  }, [t]);

  const handleReturnToCloset = useCallback(async (item: SecondLifeItem) => {
    setActionLoading(true);
    try {
      await returnToCloset(item.id);
      setMyItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItem(null);
      toast.success(t('secondLife.toastReturnedToCloset'));
    } catch (err) {
      logError(err, 'secondLife/returnToCloset');
      toast.error(t('secondLife.toastError'));
    } finally {
      setActionLoading(false);
    }
  }, [t]);

  const handleFinalize = useCallback(async (item: SecondLifeItem) => {
    const statKey: Record<string, 'sold' | 'gifted' | 'traded'> = {
      sale: 'sold',
      gift: 'gifted',
      trade: 'traded',
    };
    const field = statKey[item.status];
    setActionLoading(true);
    try {
      await removeCollectionItem(item.id);
      if (field) {
        const current = impactStats[field] ?? 0;
        await updateProfile({ impactStats: { ...impactStats, [field]: current + 1 } });
      }
      dispatch(removeItemLocally(item.id));
      setMyItems(prev => prev.filter(i => i.id !== item.id));
      setSelectedItem(null);
      dispatch(loadProfile());
      toast.success(t('secondLife.toastFinalized'));
    } catch (err) {
      logError(err, 'secondLife/finalizeItem');
      toast.error(t('secondLife.toastError'));
    } finally {
      setActionLoading(false);
    }
  }, [dispatch, impactStats, t]);

  const handleToggleFavorite = useCallback(async (itemId: string) => {
    const wasLiked = likedIds.has(itemId);
    setLikedIds(prev => {
      const next = new Set(prev);
      if (wasLiked) { next.delete(itemId); } else { next.add(itemId); }
      return next;
    });
    try {
      await toggleMarketplaceFavorite(itemId);
      if (!wasLiked) { toast.success(t('secondLife.toastFavorited')); }
    } catch (err) {
      setLikedIds(prev => {
        const next = new Set(prev);
        if (wasLiked) { next.add(itemId); } else { next.delete(itemId); }
        return next;
      });
      logError(err, 'secondLife/toggleFavorite');
      toast.error(t('secondLife.toastError'));
    }
  }, [likedIds, t]);

  // ─── Filtered data ─────────────────────────────────────────────────────────

  const filteredMyItems = myItems.filter(item => {
    if (vitrinaFilter === 'all') { return true; }
    if (vitrinaFilter === 'completed') { return isCompleted(item.status); }
    return item.status === vitrinaFilter;
  });

  const filteredMarketplace = marketplace.filter(item => {
    const statusMatch = mktFilter === 'all' || item.status === mktFilter;
    const favMatch = mktSubTab === 'explore' || likedIds.has(item.id);
    return statusMatch && favMatch;
  });

  const allHistory = myItems
    .flatMap(item =>
      item.activityLog.map(entry => ({
        itemName: item.name,
        description: entry.description,
        timestamp: entry.timestamp,
      })),
    )
    .sort((a, b) => {
      const ta = typeof a.timestamp === 'string' ? new Date(a.timestamp).getTime() : (a.timestamp as Date).getTime();
      const tb = typeof b.timestamp === 'string' ? new Date(b.timestamp).getTime() : (b.timestamp as Date).getTime();
      return tb - ta;
    });

  // ─── Status badge ──────────────────────────────────────────────────────────

  const getStatusBadge = (status: SecondLifeStatus) => {
    const cfg: Record<SecondLifeStatus, { bg: string; text: string; label: string }> = {
      sale: { bg: sl.badgeSaleBackground, text: sl.badgeSaleText, label: t('secondLife.statusSale') },
      gift: { bg: sl.badgeGiftBackground, text: sl.badgeGiftText, label: t('secondLife.statusGift') },
      trade: { bg: sl.badgeTradeBackground, text: sl.badgeTradeText, label: t('secondLife.statusTrade') },
      sold: { bg: sl.badgeCompletedBackground, text: sl.badgeCompletedText, label: t('secondLife.statusSold') },
      gifted: { bg: sl.badgeCompletedBackground, text: sl.badgeCompletedText, label: t('secondLife.statusGifted') },
      traded: { bg: sl.badgeCompletedBackground, text: sl.badgeCompletedText, label: t('secondLife.statusTraded') },
    };
    const { bg, text, label } = cfg[status] ?? cfg.sale;
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color: text }]}>{label}</Text>
      </View>
    );
  };

  const getFinalizeLabel = (status: SecondLifeStatus): string => {
    const map: Partial<Record<SecondLifeStatus, string>> = {
      sale: t('secondLife.markSold'),
      gift: t('secondLife.markGifted'),
      trade: t('secondLife.markTraded'),
    };
    return map[status] ?? t('secondLife.finalize');
  };

  const renderFinalizeIcon = (status: SecondLifeStatus, color: string) => {
    if (status === 'gift') { return <GiftIcon size={16} color={color} strokeWidth={2} />; }
    if (status === 'trade') { return <RepeatIcon size={16} color={color} strokeWidth={2} />; }
    if (status === 'sale') { return <ShoppingBagIcon size={16} color={color} strokeWidth={2} />; }
    return <CheckIcon size={16} color={color} />;
  };

  // ─── Vitrina tab ───────────────────────────────────────────────────────────

  const VITRINA_FILTERS: { id: VitrinaFilter; label: string }[] = [
    { id: 'all', label: t('secondLife.filterAll') },
    { id: 'sale', label: t('secondLife.statusSale') },
    { id: 'gift', label: t('secondLife.statusGift') },
    { id: 'trade', label: t('secondLife.statusTrade') },
    { id: 'completed', label: t('secondLife.filterCompleted') },
  ];

  const renderVitrinaItem = ({ item }: { item: SecondLifeItem }) => (
    <Touchable
      style={[styles.card, { backgroundColor: sl.cardBackground, borderColor: sl.cardBorder }]}
      onPress={() => openItemModal(item)}
      borderRadius={12}
    >
      <View style={[styles.cardImage, { backgroundColor: sl.emptyIcon }]}>
        {item.imageData ? (
          <AuthedImage data={item.imageData} style={styles.cardImageFull} resizeMode="cover" />
        ) : (
          <ShirtIcon size={28} color={sl.cardMeta} strokeWidth={1.5} />
        )}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: sl.cardName }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.cardMeta, { color: sl.cardMeta }]} numberOfLines={1}>{item.category}</Text>
        <View style={styles.cardFooter}>
          {getStatusBadge(item.status)}
          {item.status === 'sale' && item.price ? (
            <Text style={[styles.cardPrice, { color: sl.cardMeta }]}>${item.price}</Text>
          ) : null}
        </View>
      </View>
    </Touchable>
  );

  const renderVitrinaTab = () => (
    <View style={styles.tabContent}>
      {/* Filter pills */}
      <View style={styles.pillRow}>
        {VITRINA_FILTERS.map(f => (
          <Touchable
            key={f.id}
            style={[
              styles.pill,
              vitrinaFilter === f.id
                ? { backgroundColor: sl.filterPillActiveBackground, borderColor: sl.filterPillActiveBorder }
                : { backgroundColor: sl.filterPillBackground, borderColor: sl.filterPillBorder },
            ]}
            onPress={() => setVitrinaFilter(f.id)}
            borderRadius={20}
          >
            <Text
              style={[
                styles.pillText,
                { color: vitrinaFilter === f.id ? sl.filterPillActiveText : sl.filterPillText },
              ]}
            >
              {f.label}
            </Text>
          </Touchable>
        ))}
      </View>

      {myLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={sl.headerTitle} />
        </View>
      ) : filteredMyItems.length === 0 ? (
        <View style={styles.centered}>
          <ShirtIcon size={48} color={sl.emptyIcon} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: sl.emptyText }]}>{t('secondLife.vitrinaEmpty')}</Text>
          <Text style={[styles.emptySubtitle, { color: sl.emptySubtitle }]}>{t('secondLife.vitrinaEmptySub')}</Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredMyItems}
          keyExtractor={item => item.id}
          renderItem={renderVitrinaItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={myRefreshing}
              onRefresh={() => loadMyItems(true)}
              tintColor={sl.headerTitle}
            />
          }
        />
      )}
    </View>
  );

  // ─── Marketplace tab ───────────────────────────────────────────────────────

  const MARKET_FILTERS: { id: MarketplaceFilter; label: string }[] = [
    { id: 'all', label: t('secondLife.filterAll') },
    { id: 'sale', label: t('secondLife.statusSale') },
    { id: 'gift', label: t('secondLife.statusGift') },
    { id: 'trade', label: t('secondLife.statusTrade') },
  ];

  const renderMarketItem = ({ item }: { item: MarketplaceItem }) => {
    const isLiked = likedIds.has(item.id);
    const ownerLabel = item.owner.nickname ?? item.owner.name ?? '?';
    return (
      <Touchable
        style={[styles.card, { backgroundColor: sl.cardBackground, borderColor: sl.cardBorder }]}
        onPress={() => setSelectedMarketItem(item)}
        borderRadius={12}
      >
        <View style={[styles.cardImage, { backgroundColor: sl.emptyIcon }]}>
          {item.imageData ? (
            <AuthedImage data={item.imageData} style={styles.cardImageFull} resizeMode="cover" />
          ) : (
            <ShirtIcon size={28} color={sl.cardMeta} strokeWidth={1.5} />
          )}
          <Touchable
            style={styles.heartBtn}
            onPress={() => handleToggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            borderRadius={14}
          >
            <HeartIcon size={18} color={isLiked ? sl.heartActive : sl.heartInactive} filled={isLiked} strokeWidth={1.5} />
          </Touchable>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, { color: sl.cardName }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardMeta, { color: sl.cardMeta }]} numberOfLines={1}>{ownerLabel}</Text>
          <View style={styles.cardFooter}>
            {getStatusBadge(item.status)}
            {item.status === 'sale' && item.price ? (
              <Text style={[styles.cardPrice, { color: sl.cardMeta }]}>${item.price}</Text>
            ) : null}
          </View>
        </View>
      </Touchable>
    );
  };

  const renderMarketplaceTab = () => (
    <View style={styles.tabContent}>
      {/* Sub-tabs */}
      <View style={[styles.subTabRow, { borderBottomColor: sl.tabBorder }]}>
        {(['explore', 'favorites'] as MarketplaceSubTab[]).map(tab => {
          const isActive = mktSubTab === tab;
          const label = tab === 'explore' ? t('secondLife.mktExplore') : t('secondLife.mktFavorites');
          return (
            <Touchable key={tab} style={styles.subTab} onPress={() => setMktSubTab(tab)} borderRadius={0}>
              <Text style={[styles.subTabText, { color: isActive ? sl.tabActiveBackground : sl.tabInactiveText }]}>
                {label}
              </Text>
              {isActive && <View style={[styles.subTabUnderline, { backgroundColor: sl.tabActiveBackground }]} />}
            </Touchable>
          );
        })}
      </View>

      {/* Filter pills */}
      <View style={styles.pillRow}>
        {MARKET_FILTERS.map(f => (
          <Touchable
            key={f.id}
            style={[
              styles.pill,
              mktFilter === f.id
                ? { backgroundColor: sl.filterPillActiveBackground, borderColor: sl.filterPillActiveBorder }
                : { backgroundColor: sl.filterPillBackground, borderColor: sl.filterPillBorder },
            ]}
            onPress={() => setMktFilter(f.id)}
            borderRadius={20}
          >
            <Text
              style={[
                styles.pillText,
                { color: mktFilter === f.id ? sl.filterPillActiveText : sl.filterPillText },
              ]}
            >
              {f.label}
            </Text>
          </Touchable>
        ))}
      </View>

      {mktLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={sl.headerTitle} />
        </View>
      ) : filteredMarketplace.length === 0 ? (
        <View style={styles.centered}>
          <UsersIcon size={48} color={sl.emptyIcon} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: sl.emptyText }]}>
            {mktSubTab === 'favorites' ? t('secondLife.favoritesEmpty') : t('secondLife.exploreEmpty')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: sl.emptySubtitle }]}>
            {mktSubTab === 'favorites' ? t('secondLife.favoritesEmptySub') : t('secondLife.exploreEmptySub')}
          </Text>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filteredMarketplace}
          keyExtractor={item => item.id}
          renderItem={renderMarketItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={mktRefreshing}
              onRefresh={() => loadMarketplace(true)}
              tintColor={sl.headerTitle}
            />
          }
        />
      )}
    </View>
  );

  // ─── Impact tab ────────────────────────────────────────────────────────────

  const IMPACT_STATS = [
    { key: 'sold', value: impactStats.sold, label: t('secondLife.impactSold'), icon: <ShoppingBagIcon size={24} color={sl.badgeSaleText} strokeWidth={1.5} /> },
    { key: 'gifted', value: impactStats.gifted, label: t('secondLife.impactGifted'), icon: <GiftIcon size={24} color={sl.badgeGiftText} strokeWidth={1.5} /> },
    { key: 'traded', value: impactStats.traded, label: t('secondLife.impactTraded'), icon: <RepeatIcon size={24} color={sl.badgeTradeText} strokeWidth={1.5} /> },
  ];

  const renderImpactTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.impactContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Stat cards */}
      <View style={styles.statRow}>
        {IMPACT_STATS.map(stat => (
          <View
            key={stat.key}
            style={[styles.statCard, { backgroundColor: sl.statCardBackground, borderColor: sl.statCardBorder }]}
          >
            {stat.icon}
            <Text style={[styles.statValue, { color: sl.statCardValue }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: sl.statCardLabel }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Environmental message */}
      <View style={[styles.envCard, { backgroundColor: sl.impactEnvBackground }]}>
        <SparklesIcon size={20} color={sl.impactEnvText} strokeWidth={1.5} />
        <Text style={[styles.envText, { color: sl.impactEnvText }]}>{t('secondLife.impactEnvMsg')}</Text>
      </View>

      {/* History */}
      <Text style={[styles.sectionTitle, { color: sl.headerTitle }]}>{t('secondLife.impactHistory')}</Text>
      {allHistory.length === 0 ? (
        <View style={styles.historyEmpty}>
          <StarIcon size={32} color={sl.emptyIcon} strokeWidth={1.5} />
          <Text style={[styles.emptySubtitle, { color: sl.emptySubtitle }]}>{t('secondLife.historyEmpty')}</Text>
        </View>
      ) : (
        allHistory.map((entry, idx) => (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={idx}
            style={[styles.historyRow, { backgroundColor: sl.historyBackground, borderColor: sl.historyBorder }]}
          >
            <View style={styles.historyDot} />
            <View style={styles.historyBody}>
              <Text style={[styles.historyText, { color: sl.historyText }]}>{entry.description}</Text>
              <Text style={[styles.historyMeta, { color: sl.historyMeta }]}>
                {entry.itemName} · {formatDate(entry.timestamp)}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );

  // ─── Item detail modal (Vitrina) ───────────────────────────────────────────

  // ─── Main tabs ─────────────────────────────────────────────────────────────

  const MAIN_TABS: { id: MainTab; labelKey: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { id: 'vitrina', labelKey: 'secondLife.tabVitrina', Icon: ShirtIcon },
    { id: 'explorar', labelKey: 'secondLife.tabExplorar', Icon: UsersIcon },
    { id: 'impacto', labelKey: 'secondLife.tabImpacto', Icon: StarIcon },
  ];

  return (
    <View style={[styles.root, { backgroundColor: sl.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: sl.headerTitle }]}>{t('secondLife.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: sl.headerSubtitle }]}>{t('secondLife.subtitle')}</Text>
      </View>

      {/* Main tab bar */}
      <View style={[styles.mainTabBar, { backgroundColor: sl.tabBackground, borderBottomColor: sl.tabBorder }]}>
        {MAIN_TABS.map(({ id, labelKey, Icon }) => {
          const isActive = mainTab === id;
          return (
            <Touchable
              key={id}
              style={[
                styles.mainTab,
                isActive && [styles.mainTabActive, { borderBottomColor: sl.tabActiveBackground }],
              ]}
              onPress={() => setMainTab(id)}
              borderRadius={0}
            >
              <Icon
                size={18}
                color={isActive ? sl.tabActiveBackground : sl.tabInactiveText}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <Text
                style={[
                  styles.mainTabText,
                  { color: isActive ? sl.tabActiveBackground : sl.tabInactiveText },
                ]}
              >
                {t(labelKey)}
              </Text>
            </Touchable>
          );
        })}
      </View>

      {/* Content */}
      {mainTab === 'vitrina' && renderVitrinaTab()}
      {mainTab === 'explorar' && renderMarketplaceTab()}
      {mainTab === 'impacto' && renderImpactTab()}

      {/* Item detail sheet */}
      {selectedItem && (() => {
        const item = selectedItem;
        const done = isCompleted(item.status);
        return (
          <BottomSheet onClose={() => setSelectedItem(null)} backgroundColor={sl.modalBackground}>
            <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
              {item.imageData ? (
                <AuthedImage data={item.imageData} style={styles.sheetImage} resizeMode="cover" />
              ) : (
                <View style={[styles.sheetImagePlaceholder, { backgroundColor: sl.emptyIcon }]}>
                  <ShirtIcon size={48} color={sl.cardMeta} strokeWidth={1.5} />
                </View>
              )}
              <View style={styles.sheetContent}>
                <View style={styles.modalTitleRow}>
                  <Text style={[styles.modalTitle, { color: sl.modalTitle }]}>{item.name}</Text>
                  {getStatusBadge(item.status)}
                </View>
                <Text style={[styles.modalMeta, { color: sl.modalSubtitle }]}>{item.category}</Text>
                {item.status === 'sale' && (
                  <View style={[styles.priceRow, { borderColor: sl.modalBorder, backgroundColor: sl.modalBackground }]}>
                    <Text style={[styles.priceLabel, { color: sl.modalSubtitle }]}>{t('secondLife.price')}</Text>
                    <TextInput
                      style={[styles.priceInput, { color: sl.modalTitle }]}
                      value={editPrice}
                      onChangeText={setEditPrice}
                      onBlur={() => handleSavePrice(item, editPrice)}
                      keyboardType="decimal-pad"
                      placeholder={t('secondLife.pricePlaceholder')}
                      placeholderTextColor={sl.modalSubtitle}
                      returnKeyType="done"
                      editable={!actionLoading}
                    />
                  </View>
                )}
                {item.conditionDescription ? (
                  <Text style={[styles.modalDesc, { color: sl.modalSubtitle }]}>{item.conditionDescription}</Text>
                ) : null}
                {item.activityLog.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: sl.historyText }]}>{t('secondLife.activityLog')}</Text>
                    {item.activityLog.map((entry, idx) => (
                      // eslint-disable-next-line react/no-array-index-key
                      <Text key={idx} style={[styles.logEntry, { color: sl.historyMeta }]}>· {entry.description}</Text>
                    ))}
                  </>
                )}
                {!done && (
                  <View style={styles.modalActions}>
                    <Touchable
                      style={[styles.actionBtn, { backgroundColor: sl.buttonSecondary, borderColor: sl.buttonSecondaryBorder }]}
                      onPress={() => handleReturnToCloset(item)}
                      disabled={actionLoading}
                      borderRadius={10}
                    >
                      {actionLoading
                        ? <ActivityIndicator size="small" color={sl.buttonSecondaryText} />
                        : <Text style={[styles.actionBtnText, { color: sl.buttonSecondaryText }]}>{t('secondLife.returnToCloset')}</Text>
                      }
                    </Touchable>
                    <Touchable
                      style={[styles.actionBtn, { backgroundColor: sl.buttonPrimary }]}
                      onPress={() => handleFinalize(item)}
                      disabled={actionLoading}
                      borderRadius={10}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color={sl.buttonPrimaryText} />
                      ) : (
                        <>
                          {renderFinalizeIcon(item.status, sl.buttonPrimaryText)}
                          <Text style={[styles.actionBtnText, { color: sl.buttonPrimaryText }]}>{getFinalizeLabel(item.status)}</Text>
                        </>
                      )}
                    </Touchable>
                  </View>
                )}
              </View>
            </ScrollView>
          </BottomSheet>
        );
      })()}

      {/* Marketplace item sheet */}
      {selectedMarketItem && (() => {
        const item = selectedMarketItem;
        const ownerLabel = item.owner.nickname ?? item.owner.name ?? '?';
        const isLiked = likedIds.has(item.id);
        return (
          <BottomSheet onClose={() => setSelectedMarketItem(null)} backgroundColor={sl.modalBackground}>
            <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
              {item.imageData ? (
                <AuthedImage data={item.imageData} style={styles.sheetImage} resizeMode="cover" />
              ) : (
                <View style={[styles.sheetImagePlaceholder, { backgroundColor: sl.emptyIcon }]}>
                  <ShirtIcon size={48} color={sl.cardMeta} strokeWidth={1.5} />
                </View>
              )}
              <View style={styles.sheetContent}>
                <View style={styles.modalTitleRow}>
                  <Text style={[styles.modalTitle, { color: sl.modalTitle }]}>{item.name}</Text>
                  {getStatusBadge(item.status)}
                </View>
                <Text style={[styles.modalMeta, { color: sl.modalSubtitle }]}>{t('secondLife.by')} {ownerLabel}</Text>
                {item.price ? (
                  <Text style={[styles.modalMeta, { color: sl.modalSubtitle }]}>{t('secondLife.price')}: ${item.price}</Text>
                ) : null}
                {item.conditionDescription ? (
                  <Text style={[styles.modalDesc, { color: sl.modalSubtitle }]}>{item.conditionDescription}</Text>
                ) : null}
                <View style={styles.modalActions}>
                  <Touchable
                    style={[styles.actionBtn, { backgroundColor: sl.buttonSecondary, borderColor: sl.buttonSecondaryBorder }]}
                    onPress={() => handleToggleFavorite(item.id)}
                    borderRadius={10}
                  >
                    <HeartIcon size={16} color={isLiked ? sl.heartActive : sl.buttonSecondaryText} filled={isLiked} />
                    <Text style={[styles.actionBtnText, { color: sl.buttonSecondaryText }]}>
                      {isLiked ? t('secondLife.unfavorite') : t('secondLife.favorite')}
                    </Text>
                  </Touchable>
                  <Touchable
                    style={[styles.actionBtn, { backgroundColor: sl.buttonPrimary }]}
                    onPress={() => setSelectedMarketItem(null)}
                    borderRadius={10}
                  >
                    <MessageIcon size={16} color={sl.buttonPrimaryText} />
                    <Text style={[styles.actionBtnText, { color: sl.buttonPrimaryText }]}>{t('secondLife.contact')}</Text>
                  </Touchable>
                </View>
              </View>
            </ScrollView>
          </BottomSheet>
        );
      })()}
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const CARD_GAP = 10;
const CARD_WIDTH = '48%';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  // ─── Main tabs ──────────────────────────────────────────────────────────────
  mainTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  mainTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  mainTabActive: {
    borderBottomWidth: 2,
  },
  mainTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // ─── Tab content ────────────────────────────────────────────────────────────
  tabContent: {
    flex: 1,
  },
  // ─── Sub-tabs (marketplace) ─────────────────────────────────────────────────
  subTabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  subTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subTabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
  },
  // ─── Filter pills ────────────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  // ─── Grid ────────────────────────────────────────────────────────────────────
  list: {
    // flex:1 gives the FlatList a bounded height inside the flex:1 tabContent,
    // so it owns its own scroll viewport. Without it the list sizes to its
    // content and there's no overscroll region — the pull-to-refresh gesture
    // never engages.
    flex: 1,
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: CARD_GAP,
  },
  gridRow: {
    gap: CARD_GAP,
  },
  // ─── Card ────────────────────────────────────────────────────────────────────
  card: {
    width: CARD_WIDTH,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImageFull: {
    // Absolute-fill instead of width/height: '100%'. The parent `cardImage`
    // uses alignItems/justifyContent: 'center' (to center the ShirtIcon
    // placeholder), and a percentage-sized child collapses to 0 inside a
    // center-aligned Yoga container — which left the image invisible. Absolute
    // positioning fills the container regardless of its alignment.
    ...StyleSheet.absoluteFillObject,
  },
  cardBody: {
    padding: 10,
    gap: 3,
  },
  cardName: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardMeta: {
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 11,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ─── Empty / loading ─────────────────────────────────────────────────────────
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  // ─── Impact ──────────────────────────────────────────────────────────────────
  impactContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  envCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  envText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  historyEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9E9E9E',
    marginTop: 4,
  },
  historyBody: {
    flex: 1,
    gap: 2,
  },
  historyText: {
    fontSize: 13,
    fontWeight: '500',
  },
  historyMeta: {
    fontSize: 11,
  },
  logEntry: {
    fontSize: 12,
    lineHeight: 18,
  },
  // ─── Sheet ────────────────────────────────────────────────────────────────────
  sheetBody: {
    gap: 0,
  },
  sheetImage: {
    width: '100%',
    height: 220,
  },
  sheetImagePlaceholder: {
    width: '100%',
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    padding: 20,
    gap: 6,
    paddingBottom: 16,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  modalMeta: {
    fontSize: 13,
  },
  modalDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 4,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SecondLife;
