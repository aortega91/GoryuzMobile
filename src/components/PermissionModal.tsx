import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { CameraIcon, ImageIcon, MapPinOffIcon } from '@assets/icons';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';

export type PermissionType = 'camera' | 'photo' | 'location';

interface PermissionModalProps {
  type: PermissionType;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

function PermissionModal({ type, onOpenSettings, onDismiss }: PermissionModalProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  const titleKey =
    type === 'camera' ? 'permissions.cameraTitle' :
    type === 'photo'  ? 'permissions.photoTitle' :
                        'permissions.locationTitle';

  const messageKey =
    type === 'camera' ? 'permissions.cameraMessage' :
    type === 'photo'  ? 'permissions.photoMessage' :
                        'permissions.locationMessage';

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
            {type === 'camera'   && <CameraIcon size={28} color={tokens.noticeText} />}
            {type === 'photo'    && <ImageIcon size={28} color={tokens.noticeText} />}
            {type === 'location' && <MapPinOffIcon size={28} color={tokens.noticeText} strokeWidth={1.75} />}
          </View>

          <Text style={[styles.title, { color: tokens.modalTitle }]}>
            {t(titleKey)}
          </Text>
          <Text style={[styles.message, { color: tokens.modalSubtitle }]}>
            {t(messageKey)}
          </Text>

          <Touchable
            onPress={onOpenSettings}
            borderRadius={12}
            style={[styles.primaryBtn, { backgroundColor: tokens.buttonPrimary }]}
          >
            <Text style={[styles.primaryBtnText, { color: tokens.buttonPrimaryText }]}>
              {t('permissions.openSettings')}
            </Text>
          </Touchable>

          <Touchable onPress={onDismiss} style={styles.secondaryBtn}>
            <Text style={[styles.secondaryBtnText, { color: tokens.modalSubtitle }]}>
              {t('permissions.notNow')}
            </Text>
          </Touchable>
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
