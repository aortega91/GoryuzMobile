import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { CameraIcon, ImageIcon } from '@assets/icons';
import useCollectionTheme from '@hooks/useCollectionTheme';

export type PermissionType = 'camera' | 'photo';

interface PermissionModalProps {
  type: PermissionType;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

function PermissionModal({ type, onOpenSettings, onDismiss }: PermissionModalProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  const isCamera = type === 'camera';

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
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
          <View style={[styles.iconWrapper, { backgroundColor: tokens.noticeBackground }]}>
            {isCamera ? (
              <CameraIcon size={28} color={tokens.noticeText} />
            ) : (
              <ImageIcon size={28} color={tokens.noticeText} />
            )}
          </View>

          <Text style={[styles.title, { color: tokens.modalTitle }]}>
            {t(isCamera ? 'permissions.cameraTitle' : 'permissions.photoTitle')}
          </Text>
          <Text style={[styles.message, { color: tokens.modalSubtitle }]}>
            {t(isCamera ? 'permissions.cameraMessage' : 'permissions.photoMessage')}
          </Text>

          <TouchableOpacity
            onPress={onOpenSettings}
            style={[styles.primaryBtn, { backgroundColor: tokens.buttonPrimary }]}
          >
            <Text style={[styles.primaryBtnText, { color: tokens.buttonPrimaryText }]}>
              {t('permissions.openSettings')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onDismiss} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryBtnText, { color: tokens.modalSubtitle }]}>
              {t('permissions.notNow')}
            </Text>
          </TouchableOpacity>
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
    padding: 32,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 28,
    alignItems: 'center',
    gap: 12,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingVertical: 8,
  },
  secondaryBtnText: {
    fontSize: 14,
  },
});

export default PermissionModal;
