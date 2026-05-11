import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { ArrowLeftIcon, ShirtIcon } from '@assets/icons';
import { ClothingItem } from '@features/collection/types';
import OutfitCreator from './OutfitCreator';

interface Props {
  visible: boolean;
  closetItems: ClothingItem[];
  closetLoading: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (name: string, itemIds: string[]) => void;
}

function ManualOutfitCreator({ visible, closetItems, closetLoading, saving, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable onPress={onClose} hitSlop={8} borderRadius={20} style={styles.backBtn} disabled={saving}>
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <ShirtIcon size={20} color={s.headerTitle} />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.manualCreatorTitle')}</Text>
        </View>

        <OutfitCreator
          closetItems={closetItems}
          closetLoading={closetLoading}
          saving={saving}
          onSave={onSave}
        />
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { marginRight: 2 },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
});

export default ManualOutfitCreator;
