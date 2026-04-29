import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import useCollectionTheme from '@hooks/useCollectionTheme';
import { ClothingItem } from '../types';

interface DeleteConfirmModalProps {
  item: ClothingItem;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteConfirmModal({ item, onClose, onConfirm }: DeleteConfirmModalProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.backdrop, { backgroundColor: tokens.modalBackdrop }]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: tokens.modalBackground,
              borderColor: tokens.modalBorder,
            },
          ]}
        >
          <Text style={[styles.title, { color: tokens.modalTitle }]}>
            {t('collection.deleteTitle')}
          </Text>
          <Text style={[styles.message, { color: tokens.modalSubtitle }]}>
            {t('collection.deleteMessage', { name: item.name })}
          </Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.btn,
                {
                  backgroundColor: tokens.buttonSecondary,
                  borderColor: tokens.buttonSecondaryBorder,
                },
              ]}
            >
              <Text style={[styles.btnText, { color: tokens.buttonSecondaryText }]}>
                {t('common.cancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.btn,
                styles.btnDanger,
                { backgroundColor: tokens.buttonDanger },
              ]}
            >
              <Text style={[styles.btnText, { color: tokens.buttonDangerText }]}>
                {t('collection.deleteConfirm')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  btnDanger: {
    borderWidth: 0,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DeleteConfirmModal;
