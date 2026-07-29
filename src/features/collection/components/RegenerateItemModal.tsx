import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import AuthedImage from '@components/AuthedImage';
import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { GemIcon } from '@assets/icons';
import { AppDispatch } from '@utilities/store';
import { loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import { regenerateItem } from '../api/aiApi';
import { ClothingItem } from '../types';

const REGENERATE_COST = 3;

type Stage = 'confirm' | 'generating' | 'preview' | 'error';

interface RegenerateItemModalProps {
  item: ClothingItem;
  gemCount: number;
  onClose: () => void;
  onKeep: (imageData: string) => void;
}

function RegenerateItemModal({
  item, gemCount, onClose, onKeep,
}: RegenerateItemModalProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [stage, setStage] = useState<Stage>('confirm');
  const [newImage, setNewImage] = useState<string | null>(null);

  const canAfford = gemCount >= REGENERATE_COST;

  const handleRegenerate = useCallback(async () => {
    setStage('generating');
    try {
      const imageData = await regenerateItem(item.id);
      dispatch(loadProfile());
      setNewImage(imageData);
      setStage('preview');
    } catch (err: unknown) {
      logError(
        err instanceof Error ? err : new Error(String(err)),
        `regenerateItem:${item.id}`,
      );
      toast.error(t('collection.regenerateError'));
      setStage('error');
    }
  }, [dispatch, item.id, t]);

  const handleKeep = useCallback(() => {
    if (newImage) {
      onKeep(newImage);
    }
    onClose();
  }, [newImage, onKeep, onClose]);

  const renderConfirm = () => (
    <>
      <Text style={[styles.title, { color: tokens.modalTitle }]}>
        {t('collection.regenerateConfirmTitle')}
      </Text>
      <Text style={[styles.message, { color: tokens.modalSubtitle }]}>
        {t('collection.regenerateConfirmMessage', { name: item.name })}
      </Text>

      <View style={styles.imageWrapper}>
        <AuthedImage data={item.imageData} style={styles.image} resizeMode="cover" />
      </View>

      <View
        style={[
          styles.notice,
          {
            backgroundColor: tokens.noticeBackground,
            borderColor: tokens.noticeBorder,
          },
        ]}
      >
        <GemIcon size={14} color={tokens.noticeText} />
        <Text style={[styles.noticeText, { color: tokens.noticeText }]}>
          {t('collection.regenerateCostNotice', { cost: REGENERATE_COST })}
        </Text>
      </View>

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
          onPress={handleRegenerate}
          disabled={!canAfford}
          borderRadius={8}
          style={[
            styles.btn,
            styles.btnPrimary,
            { backgroundColor: tokens.buttonPrimary },
            !canAfford && styles.btnDisabled,
          ]}
        >
          <View style={styles.gemCost}>
            <GemIcon size={12} color={tokens.buttonPrimaryText} />
            <Text style={[styles.gemCostText, { color: tokens.buttonPrimaryText }]}>
              -{REGENERATE_COST}G
            </Text>
          </View>
          <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
            {t('collection.regenerateAction')}
          </Text>
        </Touchable>
      </View>
    </>
  );

  const renderGenerating = () => (
    <View style={styles.centerBlock}>
      <ActivityIndicator size="large" color={tokens.buttonPrimary} />
      <Text style={[styles.generatingLabel, { color: tokens.modalTitle }]}>
        {t('collection.regeneratingLabel')}
      </Text>
    </View>
  );

  const renderPreview = () => (
    <>
      <Text style={[styles.title, { color: tokens.modalTitle }]}>
        {t('collection.regeneratePreviewTitle')}
      </Text>

      <View style={styles.imageWrapper}>
        {newImage && (
          <AuthedImage data={newImage} style={styles.image} resizeMode="cover" />
        )}
      </View>

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
            {t('collection.regenerateDiscardAction')}
          </Text>
        </Touchable>
        <Touchable
          onPress={handleKeep}
          borderRadius={8}
          style={[styles.btn, styles.btnPrimary, { backgroundColor: tokens.buttonPrimary }]}
        >
          <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
            {t('collection.regenerateKeepAction')}
          </Text>
        </Touchable>
      </View>
    </>
  );

  const renderError = () => (
    <View style={styles.centerBlock}>
      <Text style={[styles.errorText, { color: theme.common.errorRed }]}>
        {t('collection.regenerateError')}
      </Text>
      <Touchable
        onPress={() => setStage('confirm')}
        borderRadius={8}
        style={[styles.retryBtn, { backgroundColor: tokens.buttonPrimary }]}
      >
        <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
          {t('common.retry')}
        </Text>
      </Touchable>
    </View>
  );

  return (
    <BottomSheet onClose={onClose} backgroundColor={tokens.modalBackground}>
      <View style={styles.content}>
        {stage === 'confirm' && renderConfirm()}
        {stage === 'generating' && renderGenerating()}
        {stage === 'preview' && renderPreview()}
        {stage === 'error' && renderError()}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 24,
    paddingTop: 8,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  generatingLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  btnPrimary: {
    borderWidth: 0,
    flexDirection: 'column',
    gap: 2,
    paddingVertical: 8,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gemCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  gemCostText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

export default RegenerateItemModal;
