import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { RootState, AppDispatch } from '@utilities/store';
import { AlertCircleIcon, PlusIcon, SearchIcon, ShirtIcon } from '@assets/icons';
import { loadProfile } from '@features/home/profileSlice';
import { requestCreateChoice } from '@features/styles/stylesSlice';
import { addToSecondLife } from '@features/secondLife/api/secondLifeApi';
import { logError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import FeatureWelcomeModal from '@components/FeatureWelcomeModal';
import {
  loadCollection,
  addItems,
  renameItem,
  deleteItem,
  persistItemImage,
  removeItemLocally,
} from '../collectionSlice';
import { ClothingCategory, ClothingItem, ScannedItem } from '../types';
import CategoryTabs from '../components/CategoryTabs';
import ItemCard from '../components/ItemCard';
import AddItemSheet from '../components/AddItemSheet';
import RenameItemModal from '../components/RenameItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SecondLifeSheet from '../components/SecondLifeSheet';
import RegenerateItemModal from '../components/RegenerateItemModal';

type FilterCategory = ClothingCategory | 'All';

interface CollectionProps {
  /** Switches the app to the Styles module (owned by Home's module state). */
  onOpenStyles?: () => void;
  /** Opens the add-items sheet as soon as the closet mounts (Home's "Add items"). */
  openAddOnMount?: boolean;
}

function Collection({ onOpenStyles, openAddOnMount = false }: CollectionProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const items = useSelector((state: RootState) => state.collection.items);
  const status = useSelector((state: RootState) => state.collection.status);
  const profile = useSelector((state: RootState) => state.profile.data);
  const gemCount = profile?.tokens ?? 0;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
  const [showAdd, setShowAdd] = useState(openAddOnMount);
  const [renaming, setRenaming] = useState<ClothingItem | null>(null);
  const [deleting, setDeleting] = useState<ClothingItem | null>(null);
  const [secondLife, setSecondLife] = useState<ClothingItem | null>(null);
  const [regenerating, setRegenerating] = useState<ClothingItem | null>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadCollection());
    }
  }, [dispatch, status]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(loadCollection());
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    let result = items;
    if (activeCategory !== 'All') {
      result = result.filter(i => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(i => i.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, activeCategory, search]);

  const handleAdd = useCallback(
    async (scannedItems: ScannedItem[]) => {
      await dispatch(addItems(scannedItems)).unwrap();
      dispatch(loadProfile());
      toast.success(t('collection.toastAdded'));
    },
    [dispatch, t],
  );

  // With garments loaded, the next thing is combining them: jump straight to
  // Styles' outfit creator instead of making the user go back there (zena).
  const handleCreateOutfit = useCallback(() => {
    dispatch(requestCreateChoice());
    onOpenStyles?.();
  }, [dispatch, onOpenStyles]);

  const handleRename = useCallback(
    (item: ClothingItem, name: string) => {
      dispatch(renameItem({ id: item.id, name }));
      setRenaming(null);
      toast.success(t('collection.toastRenamed'));
    },
    [dispatch, t],
  );

  const handleDelete = useCallback(
    (item: ClothingItem) => {
      dispatch(deleteItem(item.id));
      setDeleting(null);
      toast.info(t('collection.toastDeleted'));
    },
    [dispatch, t],
  );

  const handleKeepRegeneratedImage = useCallback(
    (item: ClothingItem, imageData: string) => {
      dispatch(persistItemImage({ id: item.id, imageData }));
      toast.success(t('collection.toastRegenerated'));
    },
    [dispatch, t],
  );

  const handleMoveToSecondLife = useCallback(
    async (item: ClothingItem, mode: import('../types').SecondLifeMode) => {
      const statusMap: Record<import('../types').SecondLifeMode, 'sale' | 'gift' | 'trade'> = {
        sell: 'sale',
        gift: 'gift',
        exchange: 'trade',
      };
      dispatch(removeItemLocally(item.id));
      try {
        await addToSecondLife({ itemId: item.id, status: statusMap[mode] });
        toast.success(t('collection.toastSecondLife'));
      } catch (err) {
        dispatch(loadCollection());
        logError(err, 'collection/moveToSecondLife');
        toast.error(t('collection.toastSecondLifeError'));
      }
    },
    [dispatch, t],
  );

  // ─── Render item ─────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<ClothingItem>) => (
      <View
        style={[
          styles.cardWrapper,
          index % 2 === 0 ? styles.cardLeft : styles.cardRight,
        ]}
      >
        <ItemCard
          item={item}
          onRename={() => setRenaming(item)}
          onSecondLife={() => setSecondLife(item)}
          onDelete={() => setDeleting(item)}
          onRegenerate={() => setRegenerating(item)}
        />
      </View>
    ),
    [],
  );

  // ─── Empty state ──────────────────────────────────────────────────────────────

  const renderEmpty = () => {
    if (status === 'loading') {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={tokens.buttonPrimary} />
        </View>
      );
    }
    return (
      <View style={styles.center}>
        <ShirtIcon size={56} color={tokens.emptyIcon} strokeWidth={1.5} />
        <Text style={[styles.emptyTitle, { color: tokens.emptyTitle }]}>
          {t('collection.emptyTitle')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: tokens.emptySubtitle }]}>
          {t('collection.emptySubtitle')}
        </Text>
      </View>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: tokens.background }]}>
      <FeatureWelcomeModal
        tour="closet-tour"
        titleKey="menu.collection"
        stepKeys={[
          'onboarding.collectionStep1',
        ]}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tokens.headerBackground,
            borderBottomColor: tokens.headerBorder,
          },
        ]}
      >
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, { color: tokens.headerTitle }]}>
            {t('collection.title')}
          </Text>
          <View style={styles.headerActions}>
          {/* Without a closet there'd be nothing to combine, so it hides */}
          {onOpenStyles && items.length > 0 && (
            <Touchable
              onPress={handleCreateOutfit}
              borderRadius={20}
              accessibilityLabel={t('collection.createOutfit')}
              style={[
                styles.stylesShortcut,
                {
                  backgroundColor: tokens.stylesShortcutBackground,
                  borderColor: tokens.stylesShortcutBorder,
                },
              ]}
            >
              <ShirtIcon size={20} color={tokens.stylesShortcutIcon} />
            </Touchable>
          )}
          {/* zena: the add action sits next to the title, icon-only on mobile */}
          <Touchable
            onPress={() => setShowAdd(true)}
            borderRadius={20}
            accessibilityLabel={t('collection.addItem')}
            style={[styles.addButton, { backgroundColor: tokens.fabBackground }]}
          >
            <PlusIcon size={20} color={tokens.fabIcon} />
          </Touchable>
          </View>
        </View>
        <Text style={[styles.headerSubtitle, { color: tokens.emptySubtitle }]}>
          {t('collection.subtitle')}{' '}
          <Text style={[styles.headerSubtitleLink, { color: tokens.buttonPrimary }]}>
            {t('collection.subtitleSecondLife')}
          </Text>
        </Text>
        <View
          style={[
            styles.aiNotice,
            {
              backgroundColor: tokens.noticeBackground,
              borderColor: tokens.noticeBorder,
            },
          ]}
        >
          <AlertCircleIcon size={14} color={tokens.noticeText} strokeWidth={2} />
          <Text style={[styles.aiNoticeText, { color: tokens.noticeText }]}>
            {t('collection.aiDisclaimer')}{' '}
            <Text style={styles.aiNoticeWarning}>
              {t('collection.aiDisclaimerWarning')}
            </Text>
          </Text>
        </View>
      </View>

        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: tokens.headerBackground,
              borderBottomColor: tokens.headerBorder,
            },
          ]}
        >
          <View
            style={[
              styles.searchInput,
              { backgroundColor: tokens.searchBackground },
            ]}
          >
            <SearchIcon size={16} color={tokens.searchIcon} />
            <TextInput
              style={[styles.searchText, { color: tokens.searchText }]}
              placeholder={t('collection.searchPlaceholder')}
              placeholderTextColor={tokens.searchPlaceholder}
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>
        </View>

        {/* Category tabs */}
        <CategoryTabs
          selected={activeCategory}
          onSelect={setActiveCategory}
          items={items}
        />

        {/* Items grid */}
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 24 },
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={tokens.headerTitle}
            />
          }
        />


      {/* Modals */}
      {showAdd && (
        <AddItemSheet
          gemCount={gemCount}
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}
      {renaming && (
        <RenameItemModal
          item={renaming}
          onClose={() => setRenaming(null)}
          onSave={name => handleRename(renaming, name)}
        />
      )}
      {deleting && (
        <DeleteConfirmModal
          item={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting)}
        />
      )}
      {regenerating && (
        <RegenerateItemModal
          item={regenerating}
          gemCount={gemCount}
          onClose={() => setRegenerating(null)}
          onKeep={imageData => handleKeepRegeneratedImage(regenerating, imageData)}
        />
      )}
      {secondLife && (
        <SecondLifeSheet
          item={secondLife}
          onClose={() => setSecondLife(null)}
          onContinue={mode => {
            handleMoveToSecondLife(secondLife, mode);
            setSecondLife(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stylesShortcut: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 2,
  },
  headerSubtitleLink: {
    fontWeight: '700',
  },
  aiNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  aiNoticeText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  aiNoticeWarning: {
    fontWeight: '700',
  },
  // Search
  searchBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchText: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  // Grid
  grid: {
    padding: 12,
    gap: 12,
  },
  cardWrapper: {
    width: '50%',
    padding: 4,
  },
  cardLeft: {
    paddingLeft: 8,
    paddingRight: 4,
  },
  cardRight: {
    paddingLeft: 4,
    paddingRight: 8,
  },
  // Empty state
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  // FAB
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Collection;
