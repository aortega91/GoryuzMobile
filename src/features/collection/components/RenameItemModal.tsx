import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { ClothingItem } from '../types';

interface RenameItemModalProps {
  item: ClothingItem;
  onClose: () => void;
  onSave: (name: string) => void;
}

function RenameItemModal({ item, onClose, onSave }: RenameItemModalProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const [name, setName] = useState(item.name);

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed) {
      onSave(trimmed);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              {t('collection.renameTitle')}
            </Text>

            <Text style={[styles.label, { color: tokens.inputLabel }]}>
              {t('collection.renameLabel')}
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: tokens.inputBackground,
                  borderColor: tokens.inputBorder,
                  color: tokens.inputText,
                },
              ]}
              value={name}
              onChangeText={setName}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            <View style={styles.buttons}>
              <Touchable
                onPress={onClose}
                borderRadius={8}
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
              </Touchable>
              <Touchable
                onPress={handleSave}
                disabled={!name.trim()}
                borderRadius={8}
                style={[
                  styles.btn,
                  styles.btnPrimary,
                  { backgroundColor: tokens.buttonPrimary },
                  !name.trim() && styles.btnDisabled,
                ]}
              >
                <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
                  {t('collection.renameSave')}
                </Text>
              </Touchable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
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
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
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
  btnPrimary: {
    borderWidth: 0,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RenameItemModal;
