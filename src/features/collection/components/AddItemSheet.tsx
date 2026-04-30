import React, { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import PermissionModal from '@components/PermissionModal';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import { logError } from '@utilities/crashlytics';
import { CameraIcon, ImageIcon, GemIcon, CheckIcon } from '@assets/icons';
import { identifyItems, extractItem } from '../api/aiApi';
import { ClothingCategory, ScannedItem } from '../types';

const SCAN_COST = 3;   // charged by /gemini/identify regardless of how many items are saved
const COST_PER_ITEM = 3; // charged by POST /closet per saved item

// Identify + extract during scan → show previews → save selected
type Stage = 'pick' | 'scanning' | 'confirm' | 'saving' | 'error';

interface IdentifiedItem {
  name: string;
  category: string;
  imageData: string | null; // null if extraction failed
}

const CATEGORY_COLORS: Record<string, string> = {
  Tops: '#6366F1',
  Bottoms: '#7C3AED',
  'One-Pieces': '#A855F7',
  Outerwear: '#3B82F6',
  Footwear: '#EC4899',
  Accessories: '#F59E0B',
};

interface AddItemSheetProps {
  gemCount: number;
  onClose: () => void;
  onAdd: (items: ScannedItem[]) => void;
}

function AddItemSheet({ gemCount, onClose, onAdd }: AddItemSheetProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();

  const {
    openCamera,
    openGallery,
    blockedPermission,
    dismissPermissionModal,
    handleOpenSettings,
  } = useCameraPermission();

  const [stage, setStage] = useState<Stage>('pick');
  const [identifiedItems, setIdentifiedItems] = useState<IdentifiedItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [scanProgress, setScanProgress] = useState({ current: 0, total: 0 });
  const [saveProgress, setSaveProgress] = useState({ current: 0, total: 0 });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // ─── Scan: identify then extract all items (extract is free) ─────────────────

  const handleScan = useCallback(
    async (base64Image: string, mimeType: string) => {
      setStage('scanning');
      setScanProgress({ current: 0, total: 0 });

      try {
        const rawItems = await identifyItems(base64Image, mimeType);
        if (rawItems.length === 0) {
          setErrorMsg(t('collection.noItemsFound'));
          setStage('error');
          return;
        }

        setScanProgress({ current: 0, total: rawItems.length });

        let completed = 0;
        const withImages = await Promise.all(
          rawItems.map(async item => {
            try {
              const imageData = await extractItem(base64Image, mimeType, item.name);
              completed += 1;
              setScanProgress({ current: completed, total: rawItems.length });
              return { ...item, imageData };
            } catch (err: unknown) {
              completed += 1;
              setScanProgress({ current: completed, total: rawItems.length });
              logError(
                err instanceof Error ? err : new Error(String(err)),
                `extractItem:${item.name}`,
              );
              return { ...item, imageData: null };
            }
          }),
        );

        setIdentifiedItems(withImages);
        setSelected(new Set(withImages.map((_, i) => i)));
        setStage('confirm');
      } catch (err: unknown) {
        console.error('[AddItemSheet] scan error:', err);
        logError(
          err instanceof Error ? err : new Error(String(err)),
          'handleScan',
        );
        setErrorMsg(t('collection.errorScan'));
        setStage('error');
      }
    },
    [t],
  );

  const handlePickCamera = useCallback(async () => {
    const result = await openCamera();
    console.log('[AddItemSheet] camera result status:', result.status);
    if (result.status !== 'success') return;
    const asset = result.response.assets?.[0];
    if (!asset?.base64) {
      console.warn('[AddItemSheet] camera: no base64 in asset');
      return;
    }
    await handleScan(asset.base64, asset.type ?? 'image/jpeg');
  }, [openCamera, handleScan]);

  const handlePickGallery = useCallback(async () => {
    const result = await openGallery();
    console.log('[AddItemSheet] gallery result status:', result.status);
    if (result.status !== 'success') return;
    const asset = result.response.assets?.[0];
    if (!asset?.base64) {
      console.warn('[AddItemSheet] gallery: no base64 in asset');
      return;
    }
    await handleScan(asset.base64, asset.type ?? 'image/jpeg');
  }, [openGallery, handleScan]);

  const toggleItem = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // ─── Confirm: images already extracted — just save selected ──────────────────

  const handleConfirm = useCallback(async () => {
    const toSave = identifiedItems.filter((_, i) => selected.has(i));
    const validItems: ScannedItem[] = toSave
      .filter(item => item.imageData !== null)
      .map(item => ({
        name: item.name,
        category: (item.category as ClothingCategory) ?? 'Accessories',
        imageData: item.imageData as string,
      }));

    if (validItems.length === 0) return;

    setStage('saving');
    setSaveProgress({ current: 0, total: validItems.length });

    try {
      onAdd(validItems);
      onClose();
    } catch (err: unknown) {
      logError(
        err instanceof Error ? err : new Error(String(err)),
        'handleConfirm',
      );
      setErrorMsg(t('collection.errorScan'));
      setStage('error');
    }
  }, [identifiedItems, selected, onAdd, onClose, t]);

  const totalCost = selected.size * COST_PER_ITEM;
  const canAfford = gemCount >= totalCost;

  // ─── Renderers ────────────────────────────────────────────────────────────────

  const renderPick = () => (
    <>
      <Text style={[styles.title, { color: tokens.modalTitle }]}>
        {t('collection.scanningTitle')}
      </Text>
      <Text style={[styles.subtitle, { color: tokens.modalSubtitle }]}>
        {t('collection.scanningSubtitle')}
      </Text>

      <View style={styles.pickOptions}>
        <Touchable
          onPress={handlePickCamera}
          borderRadius={14}
          style={[
            styles.pickOption,
            {
              backgroundColor: tokens.secondLifeOptionBackground,
              borderColor: tokens.secondLifeOptionBorder,
            },
          ]}
        >
          <CameraIcon size={36} color="#6366F1" />
          <Text style={[styles.pickLabel, { color: tokens.modalTitle }]}>
            {t('collection.addFromCamera')}
          </Text>
          <Text style={[styles.pickDesc, { color: tokens.modalSubtitle }]}>
            {t('collection.addFromCameraDesc')}
          </Text>
        </Touchable>

        <Touchable
          onPress={handlePickGallery}
          borderRadius={14}
          style={[
            styles.pickOption,
            {
              backgroundColor: tokens.secondLifeOptionBackground,
              borderColor: tokens.secondLifeOptionBorder,
            },
          ]}
        >
          <ImageIcon size={36} color="#7C3AED" />
          <Text style={[styles.pickLabel, { color: tokens.modalTitle }]}>
            {t('collection.addFromGallery')}
          </Text>
          <Text style={[styles.pickDesc, { color: tokens.modalSubtitle }]}>
            {t('collection.addFromGalleryDesc')}
          </Text>
        </Touchable>
      </View>

      <View style={styles.notices}>
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
            {t('collection.gemScanCostNotice', { cost: SCAN_COST })}
          </Text>
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
            {t('collection.gemCostNotice', { cost: COST_PER_ITEM })}
          </Text>
        </View>
      </View>
    </>
  );

  const renderScanning = () => (
    <View style={styles.centerBlock}>
      <ActivityIndicator size="large" color={tokens.buttonPrimary} />
      <Text style={[styles.scanningLabel, { color: tokens.modalTitle }]}>
        {scanProgress.total === 0
          ? t('collection.scanningIdentifying')
          : t('collection.scanningProcessing', {
              current: scanProgress.current,
              total: scanProgress.total,
            })}
      </Text>
      <Text style={[styles.scanningHint, { color: tokens.modalSubtitle }]}>
        {t('collection.scanningOptimizing')}
      </Text>
    </View>
  );

  const renderSaving = () => (
    <View style={styles.centerBlock}>
      <ActivityIndicator size="large" color={tokens.buttonPrimary} />
      <Text style={[styles.scanningLabel, { color: tokens.modalTitle }]}>
        {t('collection.scanningProcessing', {
          current: saveProgress.current,
          total: saveProgress.total,
        })}
      </Text>
      <Text style={[styles.scanningHint, { color: tokens.modalSubtitle }]}>
        {t('collection.scanningOptimizing')}
      </Text>
    </View>
  );

  const renderConfirm = () => (
    <>
      <Text style={[styles.title, { color: tokens.modalTitle }]}>
        {t('collection.scanConfirmTitle')}
      </Text>
      <Text style={[styles.successText, { color: theme.common.successGreen }]}>
        {t('collection.scanningSuccess')}
      </Text>

      <View style={styles.itemsList}>
        {identifiedItems.map((item, index) => {
          const isSelected = selected.has(index);
          const dotColor = CATEGORY_COLORS[item.category] ?? '#9CA3AF';
          return (
            <Touchable
              key={`${item.name}-${item.category}`}
              onPress={() => toggleItem(index)}
              borderRadius={12}
              style={[
                styles.itemRow,
                {
                  backgroundColor: isSelected
                    ? tokens.secondLifeOptionBackground
                    : tokens.cardBackground,
                  borderColor: isSelected ? '#6366F1' : tokens.cardBorder,
                },
              ]}
            >
              {item.imageData ? (
                <Image
                  source={{ uri: item.imageData }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.itemThumbPlaceholder, { backgroundColor: dotColor }]} />
              )}
              <View style={styles.itemRowText}>
                <Text
                  style={[styles.itemRowName, { color: tokens.cardName }]}
                  numberOfLines={1}
                >
                  {item.name}
                </Text>
                <Text style={[styles.itemRowCategory, { color: tokens.modalSubtitle }]}>
                  {item.category}
                </Text>
              </View>
              {isSelected && (
                <View style={[styles.checkCircle, { backgroundColor: '#6366F1' }]}>
                  <CheckIcon size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </Touchable>
          );
        })}
      </View>
    </>
  );

  const renderError = () => (
    <View style={styles.centerBlock}>
      <Text style={[styles.errorText, { color: theme.common.errorRed }]}>
        {errorMsg}
      </Text>
      <Touchable
        onPress={() => setStage('pick')}
        borderRadius={8}
        style={[styles.retryBtn, { backgroundColor: tokens.buttonPrimary }]}
      >
        <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
          {t('common.retry')}
        </Text>
      </Touchable>
    </View>
  );

  const showFooter = stage === 'pick' || stage === 'confirm' || stage === 'error';

  return (
    <>
      <BottomSheet onClose={onClose} backgroundColor={tokens.modalBackground}>
        <View style={styles.content}>
          {stage === 'pick' && renderPick()}
          {stage === 'scanning' && renderScanning()}
          {stage === 'confirm' && renderConfirm()}
          {stage === 'saving' && renderSaving()}
          {stage === 'error' && renderError()}

          {showFooter && (
            <View style={styles.footer}>
              <Touchable
                onPress={onClose}
                borderRadius={10}
                style={[
                  styles.footerBtn,
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

              {stage === 'confirm' && (
                <Touchable
                  onPress={handleConfirm}
                  disabled={selected.size === 0 || !canAfford}
                  borderRadius={10}
                  style={[
                    styles.footerBtn,
                    styles.footerBtnPrimary,
                    { backgroundColor: tokens.buttonPrimary },
                    (selected.size === 0 || !canAfford) && styles.btnDisabled,
                  ]}
                >
                  {selected.size > 0 && (
                    <View style={styles.gemCost}>
                      <GemIcon size={12} color={tokens.buttonPrimaryText} />
                      <Text style={[styles.gemCostText, { color: tokens.buttonPrimaryText }]}>
                        -{totalCost}G
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[styles.btnText, { color: tokens.buttonPrimaryText }]}
                    numberOfLines={1}
                  >
                    {t('collection.confirmAndAdd')}
                  </Text>
                </Touchable>
              )}
            </View>
          )}
        </View>
      </BottomSheet>

      {blockedPermission && (
        <PermissionModal
          type={blockedPermission}
          onOpenSettings={handleOpenSettings}
          onDismiss={dismissPermissionModal}
        />
      )}
    </>
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
  subtitle: {
    fontSize: 13,
    marginTop: -8,
  },
  successText: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -8,
  },
  pickOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  pickOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  pickLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  pickDesc: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  notices: {
    gap: 8,
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
  scanningLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  scanningHint: {
    fontSize: 13,
    textAlign: 'center',
  },
  itemsList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  itemThumb: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemThumbPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 8,
  },
  itemRowText: {
    flex: 1,
    gap: 2,
  },
  itemRowName: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemRowCategory: {
    fontSize: 11,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    flexDirection: 'row',
    gap: 10,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  footerBtnPrimary: {
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

export default AddItemSheet;
