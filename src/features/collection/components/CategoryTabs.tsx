import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { ClothingCategory, CLOTHING_CATEGORIES, ClothingItem } from '../types';

type FilterCategory = ClothingCategory | 'All';

interface CategoryTabsProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
  items: ClothingItem[];
}

const CATEGORY_KEY_MAP: Record<FilterCategory, string> = {
  All: 'collection.categoryAll',
  Tops: 'collection.categoryTops',
  Bottoms: 'collection.categoryBottoms',
  'One-Pieces': 'collection.categoryOnePieces',
  Outerwear: 'collection.categoryOuterwear',
  Footwear: 'collection.categoryFootwear',
  Accessories: 'collection.categoryAccessories',
};

function CategoryTabs({ selected, onSelect, items }: CategoryTabsProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  const visibleTabs: FilterCategory[] = [
    'All',
    ...CLOTHING_CATEGORIES.filter(cat =>
      items.some(item => item.category === cat),
    ),
  ];

  const getCount = (cat: FilterCategory) =>
    cat === 'All' ? items.length : items.filter(i => i.category === cat).length;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: tokens.tabBackground, borderBottomColor: tokens.tabBorder },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {visibleTabs.map(category => {
          const isActive = selected === category;
          const count = getCount(category);
          return (
            <Touchable
              key={category}
              onPress={() => onSelect(category)}
              borderRadius={4}
              style={styles.tab}
            >
              <View style={styles.tabInner}>
                <Text
                  style={[
                    styles.tabText,
                    { color: isActive ? tokens.tabActiveText : tokens.tabText },
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {t(CATEGORY_KEY_MAP[category])}
                </Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: isActive
                        ? tokens.tabBadgeActiveBackground
                        : tokens.tabBadgeBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color: isActive
                          ? tokens.tabBadgeActiveText
                          : tokens.tabBadgeText,
                      },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </View>
              {isActive && (
                <View
                  style={[styles.indicator, { backgroundColor: tokens.tabIndicator }]}
                />
              )}
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  scrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  tab: {
    paddingTop: 10,
    marginRight: 20,
    position: 'relative',
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  badge: {
    minWidth: 20,
    height: 18,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 2,
  },
});

export default CategoryTabs;
