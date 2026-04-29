import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import useCollectionTheme from '@hooks/useCollectionTheme';
import { RootState, AppDispatch } from '@utilities/store';
import { ArrowLeftIcon, SearchIcon, ShirtIcon } from '@assets/icons';
import {
  loadCollection,
  addItems,
  renameItem,
  deleteItem,
} from '../collectionSlice';
import { ClothingCategory, ClothingItem, ScannedItem } from '../types';
import CategoryTabs from '../components/CategoryTabs';
import ItemCard from '../components/ItemCard';
import AddItemSheet from '../components/AddItemSheet';
import RenameItemModal from '../components/RenameItemModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SecondLifeSheet from '../components/SecondLifeSheet';

type FilterCategory = ClothingCategory | 'All';

function Collection() {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const items = useSelector((state: RootState) => state.collection.items);
  const status = useSelector((state: RootState) => state.collection.status);
  const profile = useSelector((state: RootState) => state.profile.data);
  const gemCount = profile?.tokens ?? 0;

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [renaming, setRenaming] = useState<ClothingItem | null>(null);
  const [deleting, setDeleting] = useState<ClothingItem | null>(null);
  const [secondLife, setSecondLife] = useState<ClothingItem | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(loadCollection());
    }
  }, [dispatch, status]);

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
    (scannedItems: ScannedItem[]) => {
      dispatch(addItems(scannedItems));
    },
    [dispatch],
  );

  const handleRename = useCallback(
    (item: ClothingItem, name: string) => {
      dispatch(renameItem({ id: item.id, name }));
      setRenaming(null);
    },
    [dispatch],
  );

  const handleDelete = useCallback(
    (item: ClothingItem) => {
      dispatch(deleteItem(item.id));
      setDeleting(null);
    },
    [dispatch],
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
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={tokens.headerBackground}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeftIcon size={22} color={tokens.headerTitle} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: tokens.headerTitle }]}>
            {t('collection.title')}
          </Text>
          <View style={styles.headerSpacer} />
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
        />

        {/* Items grid */}
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={[
            styles.grid,
            { paddingBottom: insets.bottom + 80 },
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />

        {/* FAB */}
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          activeOpacity={0.85}
          style={[
            styles.fab,
            {
              backgroundColor: tokens.fabBackground,
              bottom: insets.bottom + 16,
            },
          ]}
        >
          <Text style={[styles.fabIcon, { color: tokens.fabIcon }]}>+</Text>
        </TouchableOpacity>
      </SafeAreaView>

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
      {secondLife && (
        <SecondLifeSheet
          item={secondLife}
          onClose={() => setSecondLife(null)}
          onContinue={_mode => {
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
  safeArea: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  headerSpacer: {
    width: 22,
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
});

export default Collection;
