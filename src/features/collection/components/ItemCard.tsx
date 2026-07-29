import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import {
  PencilIcon, GiftIcon, TrashIcon, RefreshCwIcon,
} from '@assets/icons';
import { ClothingItem } from '../types';

interface ItemCardProps {
  item: ClothingItem;
  onRename: () => void;
  onSecondLife: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
}

function ItemCard({
  item, onRename, onSecondLife, onDelete, onRegenerate,
}: ItemCardProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: tokens.cardBackground,
          borderColor: tokens.cardBorder,
        },
      ]}
    >
      <View style={styles.imageContainer}>
        <AuthedImage
          data={item.imageData}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      <View style={styles.info}>
        <Text
          style={[styles.name, { color: tokens.cardName }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </View>

      {/* Always-visible action row */}
      <View style={[styles.actions, { borderTopColor: tokens.cardBorder }]}>
        <Touchable
          onPress={onRename}
          style={styles.actionBtn}
          borderRadius={8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={t('collection.renameTitle')}
        >
          <PencilIcon size={17} color="#6366F1" />
        </Touchable>

        <View style={[styles.actionDivider, { backgroundColor: tokens.cardBorder }]} />

        <Touchable
          onPress={onRegenerate}
          style={styles.actionBtn}
          borderRadius={8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={t('collection.regenerateAction')}
        >
          <RefreshCwIcon size={17} color="#F59E0B" />
        </Touchable>

        <View style={[styles.actionDivider, { backgroundColor: tokens.cardBorder }]} />

        <Touchable
          onPress={onSecondLife}
          style={styles.actionBtn}
          borderRadius={8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={t('collection.secondLifeTitle')}
        >
          <GiftIcon size={17} color="#10B981" />
        </Touchable>

        <View style={[styles.actionDivider, { backgroundColor: tokens.cardBorder }]} />

        <Touchable
          onPress={onDelete}
          style={styles.actionBtn}
          borderRadius={8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          accessibilityLabel={t('collection.deleteConfirm')}
        >
          <TrashIcon size={17} color={theme.common.errorRed} />
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 3 / 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  info: {
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 6,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  actionDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
});

export default ItemCard;
