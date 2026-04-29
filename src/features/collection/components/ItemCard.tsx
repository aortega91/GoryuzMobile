import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { getImageSource } from '@api/client';
import BottomSheet from '@components/BottomSheet';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { MoreVerticalIcon, PencilIcon, GiftIcon, TrashIcon } from '@assets/icons';
import { ClothingItem } from '../types';

interface ItemCardProps {
  item: ClothingItem;
  onRename: () => void;
  onSecondLife: () => void;
  onDelete: () => void;
}

function ItemCard({ item, onRename, onSecondLife, onDelete }: ItemCardProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRename = () => {
    setMenuOpen(false);
    onRename();
  };

  const handleSecondLife = () => {
    setMenuOpen(false);
    onSecondLife();
  };

  const handleDelete = () => {
    setMenuOpen(false);
    onDelete();
  };

  return (
    <>
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
          <Image
            source={getImageSource(item.imageData)}
            style={styles.image}
            resizeMode="cover"
          />
          <TouchableOpacity
            onPress={() => setMenuOpen(true)}
            style={styles.menuBtn}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <MoreVerticalIcon size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.info}>
          <Text
            style={[styles.name, { color: tokens.cardName }]}
            numberOfLines={2}
          >
            {item.name}
          </Text>
        </View>
      </View>

      {menuOpen && (
        <BottomSheet
          onClose={() => setMenuOpen(false)}
          backgroundColor={tokens.modalBackground}
        >
          <View style={styles.sheetContent}>
            <Text style={[styles.sheetTitle, { color: tokens.modalTitle }]} numberOfLines={1}>
              {item.name}
            </Text>

            <TouchableOpacity
              onPress={handleRename}
              style={[styles.actionRow, { borderBottomColor: tokens.cardBorder }]}
            >
              <View style={[styles.actionIcon, styles.actionIconBlue]}>
                <PencilIcon size={16} color="#6366F1" />
              </View>
              <Text style={[styles.actionLabel, { color: tokens.cardName }]}>
                {t('collection.renameTitle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSecondLife}
              style={[styles.actionRow, { borderBottomColor: tokens.cardBorder }]}
            >
              <View style={[styles.actionIcon, styles.actionIconGreen]}>
                <GiftIcon size={16} color="#10B981" />
              </View>
              <Text style={[styles.actionLabel, { color: tokens.cardName }]}>
                {t('collection.secondLifeTitle')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDelete} style={styles.actionRow}>
              <View style={[styles.actionIcon, styles.actionIconRed]}>
                <TrashIcon size={16} color={theme.common.errorRed} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.common.errorRed }]}>
                {t('collection.deleteConfirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      )}
    </>
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
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  menuBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 8,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 4,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBlue: {
    backgroundColor: '#EEF2FF',
  },
  actionIconGreen: {
    backgroundColor: '#ECFDF5',
  },
  actionIconRed: {
    backgroundColor: '#FEF2F2',
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default ItemCard;
