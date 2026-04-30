import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useCollectionTheme from '@hooks/useCollectionTheme';
import { ShoppingBagIcon, GiftIcon, RefreshCwIcon } from '@assets/icons';
import { ClothingItem, SecondLifeMode } from '../types';

interface SecondLifeSheetProps {
  item: ClothingItem;
  onClose: () => void;
  onContinue: (mode: SecondLifeMode) => void;
}

interface ModeOption {
  mode: SecondLifeMode;
  labelKey: string;
  descKey: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const OPTIONS: ModeOption[] = [
  {
    mode: 'sell',
    labelKey: 'collection.secondLifeSell',
    descKey: 'collection.secondLifeSellDesc',
    Icon: ShoppingBagIcon,
  },
  {
    mode: 'gift',
    labelKey: 'collection.secondLifeGift',
    descKey: 'collection.secondLifeGiftDesc',
    Icon: GiftIcon,
  },
  {
    mode: 'exchange',
    labelKey: 'collection.secondLifeExchange',
    descKey: 'collection.secondLifeExchangeDesc',
    Icon: RefreshCwIcon,
  },
];

function SecondLifeSheet({ item, onClose, onContinue }: SecondLifeSheetProps) {
  const theme = useCollectionTheme();
  const tokens = theme.collection;
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SecondLifeMode | null>(null);

  const iconColor = (mode: SecondLifeMode) => {
    if (mode === 'sell') {
      return tokens.secondLifeSell;
    }
    if (mode === 'gift') {
      return tokens.secondLifeGift;
    }
    return tokens.secondLifeExchange;
  };

  return (
    <BottomSheet onClose={onClose} backgroundColor={tokens.modalBackground}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: tokens.modalTitle }]}>
          {t('collection.secondLifeTitle')}
        </Text>
        <Text style={[styles.subtitle, { color: tokens.modalSubtitle }]}>
          {t('collection.secondLifeSubtitle')} — {item.name}
        </Text>

        <View style={styles.options}>
          {OPTIONS.map(({ mode, labelKey, descKey, Icon }) => {
            const isActive = selected === mode;
            return (
              <Touchable
                key={mode}
                onPress={() => setSelected(mode)}
                borderRadius={12}
                style={[
                  styles.option,
                  {
                    backgroundColor: isActive
                      ? tokens.secondLifeActiveBackground
                      : tokens.secondLifeOptionBackground,
                    borderColor: isActive
                      ? tokens.secondLifeActiveBorder
                      : tokens.secondLifeOptionBorder,
                  },
                ]}
              >
                <Icon
                  size={24}
                  color={isActive ? tokens.secondLifeActiveIcon : iconColor(mode)}
                />
                <View style={styles.optionText}>
                  <Text
                    style={[styles.optionLabel, { color: tokens.secondLifeOptionText }]}
                  >
                    {t(labelKey)}
                  </Text>
                  <Text
                    style={[styles.optionDesc, { color: tokens.secondLifeOptionSubtext }]}
                  >
                    {t(descKey)}
                  </Text>
                </View>
              </Touchable>
            );
          })}
        </View>

        <View style={styles.buttons}>
          <Touchable
            onPress={onClose}
            borderRadius={10}
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
            onPress={() => selected && onContinue(selected)}
            disabled={!selected}
            borderRadius={10}
            style={[
              styles.btn,
              styles.btnPrimary,
              { backgroundColor: tokens.buttonPrimary },
              !selected && styles.btnDisabled,
            ]}
          >
            <Text style={[styles.btnText, { color: tokens.buttonPrimaryText }]}>
              {t('collection.secondLifeContinue')}
            </Text>
          </Touchable>
        </View>
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
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -8,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 12,
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

export default SecondLifeSheet;
