import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import useCollectionTheme from '@hooks/useCollectionTheme';
import { ClothingCategory, CLOTHING_CATEGORIES } from '../types';

type FilterCategory = ClothingCategory | 'All';

interface CategoryTabsProps {
  selected: FilterCategory;
  onSelect: (category: FilterCategory) => void;
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

const ALL_TABS: FilterCategory[] = ['All', ...CLOTHING_CATEGORIES];

function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: tokens.tabBackground,
          borderBottomColor: tokens.tabBorder,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_TABS.map(category => {
          const isActive = selected === category;
          return (
            <TouchableOpacity
              key={category}
              onPress={() => onSelect(category)}
              activeOpacity={0.75}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive
                    ? tokens.tabActiveBackground
                    : 'transparent',
                  borderColor: isActive
                    ? tokens.tabActiveBorder
                    : tokens.tabBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: isActive ? tokens.tabActiveText : tokens.tabText,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {t(CATEGORY_KEY_MAP[category])}
              </Text>
            </TouchableOpacity>
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
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
  },
});

export default CategoryTabs;
