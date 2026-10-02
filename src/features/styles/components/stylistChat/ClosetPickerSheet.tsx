import React, { useMemo, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import AuthedImage from '@components/AuthedImage';
import { CheckIcon } from '@assets/icons';
import useStylesTheme from '@hooks/useStylesTheme';
import { ClothingItem, CLOTHING_CATEGORIES } from '@features/collection/types';

interface Props {
  closet: ClothingItem[];
  onClose: () => void;
  onConfirm: (items: ClothingItem[]) => void;
}

const COLUMNS = 3;
const GAP = 8;
const SIDE = 20;
const TILE = (Dimensions.get('window').width - SIDE * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

/** zena `ClosetPickerModal`: pick key pieces from the closet to ask the stylist about. */
function ClosetPickerSheet({ closet, onClose, onConfirm }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const groups = useMemo(
    () =>
      CLOTHING_CATEGORIES.map(cat => ({ cat, items: closet.filter(i => i.category === cat) })).filter(
        g => g.items.length > 0,
      ),
    [closet],
  );

  const toggle = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));

  const confirm = () => onConfirm(closet.filter(i => selectedIds.includes(i.id)));

  return (
    <BottomSheet onClose={onClose} backgroundColor={s.chatBackground}>
      <Text style={[styles.title, { color: s.chatTitle }]}>{t('styles.stylistChat.pickerTitle')}</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {groups.map(({ cat, items }) => (
          <View key={cat} style={styles.group}>
            <Text style={[styles.groupLabel, { color: s.chatSuggestionLabel }]}>
              {t(`collection.category${cat.replace(/[- ]/g, '')}`)}
            </Text>
            <View style={styles.grid}>
              {items.map(item => {
                const selected = selectedIds.includes(item.id);
                return (
                  <Touchable
                    key={item.id}
                    onPress={() => toggle(item.id)}
                    borderRadius={12}
                    accessibilityLabel={item.name}
                    style={[
                      styles.tile,
                      { borderColor: selected ? s.closetItemSelectedBorder : s.chatHistoryCardBorder },
                    ]}
                  >
                    <AuthedImage data={item.imageData} style={styles.tileImage} resizeMode="cover" />
                    {selected && (
                      <View style={[styles.badge, { backgroundColor: s.closetItemSelectedBadge }]}>
                        <CheckIcon size={12} color={s.chatSendIcon} strokeWidth={3} />
                      </View>
                    )}
                  </Touchable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
      <Touchable
        onPress={confirm}
        disabled={selectedIds.length === 0}
        borderRadius={16}
        style={[
          styles.confirm,
          { backgroundColor: s.chatSendBackground },
          selectedIds.length === 0 && styles.disabled,
        ]}
      >
        <Text style={[styles.confirmText, { color: s.chatSendIcon }]}>
          {t('styles.stylistChat.pickerConfirm', { count: selectedIds.length })}
        </Text>
      </Touchable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', paddingHorizontal: SIDE, paddingBottom: 12 },
  scroll: { paddingHorizontal: SIDE, paddingBottom: 12, gap: 16 },
  group: { gap: 8 },
  groupLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  tile: { width: TILE, height: TILE, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  tileImage: { width: '100%', height: '100%' },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirm: {
    marginHorizontal: SIDE,
    marginTop: 4,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default ClosetPickerSheet;
