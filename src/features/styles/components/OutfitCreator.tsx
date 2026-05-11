import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { getImageSource } from '@api/client';
import { ShirtIcon, SparklesIcon } from '@assets/icons';
import {
  ClothingItem,
  ClothingCategory,
  CLOTHING_CATEGORIES,
} from '@features/collection/types';

type TabKey = 'all' | ClothingCategory;

interface OutfitCreatorProps {
  closetItems: ClothingItem[];
  closetLoading: boolean;
  saving: boolean;
  onSave: (name: string, itemIds: string[]) => void;
}

function OutfitCreator({ closetItems, closetLoading, saving, onSave }: OutfitCreatorProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const defaultName = `Look ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [outfitName, setOutfitName] = useState(defaultName);

  const categoriesWithItems = useMemo(
    () => CLOTHING_CATEGORIES.filter(cat => closetItems.some(i => i.category === cat)),
    [closetItems],
  );

  const visibleItems = useMemo(
    () => (activeTab === 'all' ? closetItems : closetItems.filter(i => i.category === activeTab)),
    [closetItems, activeTab],
  );

  const toggleItem = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const name = outfitName.trim();
    if (name.length === 0 || selectedIds.length === 0) return;
    onSave(name, selectedIds);
  };

  const categoryLabel = (cat: ClothingCategory) =>
    t(`collection.category${cat.replace(/[- ]/g, '')}`);

  if (closetLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={s.buttonPrimary} />
      </View>
    );
  }

  if (closetItems.length === 0) {
    return (
      <View style={styles.center}>
        <ShirtIcon size={52} color={s.emptyIcon} />
        <Text style={[styles.emptyTitle, { color: s.emptyText }]}>
          {t('styles.creatorEmptyTitle')}
        </Text>
        <Text style={[styles.emptySubtitle, { color: s.emptySubtitle }]}>
          {t('styles.creatorEmptySubtitle')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsScroll, { borderBottomColor: s.tabBorder }]}
        contentContainerStyle={styles.tabsRow}
      >
        <Touchable
          onPress={() => setActiveTab('all')}
          borderRadius={20}
          style={[
            styles.tabChip,
            {
              backgroundColor: activeTab === 'all' ? s.tabActive : s.tagBackground,
            },
          ]}
        >
          <Text
            style={[
              styles.tabChipText,
              { color: activeTab === 'all' ? s.tabActiveText : s.tabInactiveText },
            ]}
          >
            {t('collection.categoryAll')}
          </Text>
        </Touchable>
        {categoriesWithItems.map(cat => (
          <Touchable
            key={cat}
            onPress={() => setActiveTab(cat)}
            borderRadius={20}
            style={[
              styles.tabChip,
              {
                backgroundColor: activeTab === cat ? s.tabActive : s.tagBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.tabChipText,
                { color: activeTab === cat ? s.tabActiveText : s.tabInactiveText },
              ]}
            >
              {categoryLabel(cat)}
            </Text>
          </Touchable>
        ))}
      </ScrollView>

      {/* 3-column item grid */}
      <FlatList
        data={visibleItems}
        keyExtractor={item => item.id}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          const itemBorderStyle = { borderColor: isSelected ? s.closetItemSelectedBorder : 'transparent' };
          return (
            <Touchable
              onPress={() => toggleItem(item.id)}
              borderRadius={10}
              style={[styles.gridItem, itemBorderStyle]}
            >
              {item.imageData ? (
                <Image
                  source={getImageSource(item.imageData)}
                  style={styles.gridImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.gridImage, styles.gridImagePlaceholder, { backgroundColor: s.closetItemBackground }]}>
                  <ShirtIcon size={18} color={s.emptyIcon} />
                </View>
              )}
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: s.closetItemSelectedBadge }]}>
                  <Text style={[styles.checkText, { color: s.closetItemSelectedCheck }]}>✓</Text>
                </View>
              )}
            </Touchable>
          );
        }}
      />

      {/* Bottom bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: s.creatorPreviewBackground, borderTopColor: s.creatorPreviewBorder },
        ]}
      >
        <View style={styles.bottomRow}>
          {/* Count badge */}
          <View style={[styles.countBadge, { backgroundColor: selectedIds.length > 0 ? s.tabActive : s.tagBackground }]}>
            <Text style={[styles.countText, { color: selectedIds.length > 0 ? s.tabActiveText : s.tabInactiveText }]}>
              {selectedIds.length}
            </Text>
          </View>

          {/* Name input */}
          <TextInput
            style={[
              styles.nameInput,
              {
                backgroundColor: s.creatorInputBackground,
                borderColor: s.creatorInputBorder,
                color: s.creatorInputText,
              },
            ]}
            value={outfitName}
            onChangeText={setOutfitName}
            placeholder={t('styles.creatorNamePlaceholder')}
            placeholderTextColor={s.creatorInputPlaceholder}
            editable={!saving}
            maxLength={80}
            returnKeyType="done"
          />

          {/* Create button */}
          <Touchable
            onPress={handleSave}
            borderRadius={12}
            disabled={saving || selectedIds.length === 0 || outfitName.trim().length === 0}
            style={[
              styles.createBtn,
              { backgroundColor: s.buttonPrimary },
              (saving || selectedIds.length === 0) && styles.createBtnDisabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator color={s.buttonPrimaryText} size="small" />
            ) : (
              <SparklesIcon size={16} color={s.buttonPrimaryText} />
            )}
            <Text style={[styles.createBtnText, { color: s.buttonPrimaryText }]}>
              {saving ? t('styles.creatorSaving') : t('styles.creatorSave')}
            </Text>
          </Touchable>
        </View>
      </View>
    </View>
  );
}

const ITEM_MARGIN = 3;

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 12 },
  emptyTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center' },
  tabsScroll: { borderBottomWidth: StyleSheet.hairlineWidth, flexGrow: 0 },
  tabsRow: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  tabChipText: { fontSize: 12, fontWeight: '700' },
  gridContent: { padding: ITEM_MARGIN },
  gridItem: {
    flex: 1 / 3,
    margin: ITEM_MARGIN,
    aspectRatio: 1,
    borderRadius: 10,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: '100%' },
  gridImagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  checkBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontSize: 12, fontWeight: '900' },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  countBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  countText: { fontSize: 13, fontWeight: '800' },
  nameInput: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    flexShrink: 0,
  },
  createBtnDisabled: { opacity: 0.45 },
  createBtnText: { fontSize: 13, fontWeight: '700' },
});

export default OutfitCreator;
