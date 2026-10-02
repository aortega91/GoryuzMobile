import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { CrownIcon, SparklesIcon, ArrowRightIcon } from '@assets/icons';
import useCommonTheme from '@hooks/useCommonTheme';
import useActiveThemePalette from '@hooks/useActiveThemePalette';
import { withAlpha } from '@theme/palettes';
import { ApiError } from '@api/client';

/** Same ids as zena's `SubscriptionPlan` and the server's `requiredPlan`. */
export type RequiredPlan = 'standard' | 'vip';

/**
 * The plan to invite to when a request was refused for the user's plan (403),
 * or null for any other error. zena's middleware answers
 * `{ code: 'plan_restricted', requiredPlan }`; a 403 that names no plan
 * falls back to VIP.
 */
export function requiredPlanFromError(err: unknown): RequiredPlan | null {
  if (!(err instanceof ApiError) || err.status !== 403) return null;
  const body = err.body as { code?: string; requiredPlan?: string | null } | undefined;
  if (body?.code === 'plan_restricted' && body.requiredPlan && body.requiredPlan !== 'vip') {
    return 'standard';
  }
  return 'vip';
}

interface Props {
  visible: boolean;
  requiredPlan: RequiredPlan;
  onUpgrade: () => void;
  onClose: () => void;
}

// zena's UpgradeModal `planConfig`.
const PLAN_NAMES: Record<RequiredPlan, string> = {
  standard: 'GORYUZ Glow',
  vip: 'GORYUZ Cenit',
};

function UpgradeModal({ visible, requiredPlan, onUpgrade, onClose }: Props) {
  const { t } = useTranslation();
  const theme = useCommonTheme();
  const palette = useActiveThemePalette();
  const c = theme.common;

  // The reference fixes these to a semantic emerald/rose per tier — not
  // brand-accent-tied, so they stay put no matter which of the 4 themes is
  // active. Only the small icon-chip background (below) tracks the theme.
  const isVip = requiredPlan === 'vip';
  const accentColor = isVip ? '#FB7185' : '#34D399'; // rose-400 / emerald-400
  const planNameColor = isVip ? '#F43F5E' : '#10B981'; // rose-500 / emerald-500
  const headerBgTop = isVip ? '#111827' : '#064E3B'; // gray-900 / emerald-900
  const headerBgBot = isVip ? '#1F2937' : '#065F46'; // gray-800 / emerald-800
  const ctaBgTop = isVip ? '#111827' : '#059669'; // gray-900 / emerald-600
  const ctaBgBot = isVip ? '#1F2937' : '#0D9488'; // gray-800 / teal-600
  const chipBackground = theme.dark ? withAlpha(palette.accentDefault, 0.3) : palette.accent[50];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Touchable
        onPress={onClose}
        borderRadius={0}
        style={[styles.backdrop, { backgroundColor: c.overlayDark }]}
      >
        <Touchable
          onPress={() => {}}
          borderRadius={24}
          activeOpacity={1}
          style={[styles.card, { backgroundColor: theme.dark ? '#1F2937' : '#FFFFFF' }]}
        >
          {/* Visual header */}
          <View style={[styles.header, { backgroundColor: headerBgTop }]}>
            <View style={[styles.header, StyleSheet.absoluteFillObject, {
              backgroundColor: headerBgBot,
              opacity: 0.6,
            }]} />
            <View style={[styles.iconCircle, { borderColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              {isVip
                ? <CrownIcon size={40} color={accentColor} />
                : <SparklesIcon size={40} color={accentColor} />
              }
            </View>
          </View>

          {/* Content */}
          <View style={styles.body}>
            <View style={styles.titleRow}>
              <View style={[styles.titleIconBg, { backgroundColor: chipBackground }]}>
                {isVip
                  ? <CrownIcon size={18} color={accentColor} />
                  : <SparklesIcon size={18} color={accentColor} />
                }
              </View>
              <Text style={[styles.title, { color: theme.dark ? '#FFFFFF' : '#111827' }]}>
                {t('upgrade.lockedTitle')}
              </Text>
            </View>

            <Text style={[styles.desc, { color: theme.dark ? '#9CA3AF' : '#6B7280' }]}>
              {t('upgrade.lockedDesc')}
            </Text>

            <Text style={[styles.planLine, { color: theme.dark ? '#D1D5DB' : '#374151' }]}>
              {t('upgrade.availableOn')}{' '}
              <Text style={[styles.planName, { color: planNameColor }]}>
                {PLAN_NAMES[requiredPlan]}
              </Text>
            </Text>

            {/* Upgrade CTA */}
            <Touchable
              onPress={onUpgrade}
              borderRadius={16}
              style={[styles.upgradeBtn, { backgroundColor: ctaBgTop }]}
            >
              <View
                style={[
                  styles.upgradeBtn,
                  StyleSheet.absoluteFillObject,
                  { backgroundColor: ctaBgBot, opacity: 0.6, marginTop: 0 },
                ]}
              />
              <Text style={styles.upgradeBtnText}>{t('upgrade.cta')}</Text>
              <ArrowRightIcon size={18} color="#fff" />
            </Touchable>

            {/* Dismiss */}
            <Touchable onPress={onClose} borderRadius={8} style={styles.dismissBtn}>
              <Text style={[styles.dismissText, { color: theme.dark ? '#6B7280' : '#9CA3AF' }]}>
                {t('upgrade.noThanks')}
              </Text>
            </Touchable>
          </View>
        </Touchable>
      </Touchable>
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
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    height: 128,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    padding: 28,
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  desc: {
    fontSize: 13,
    lineHeight: 20,
  },
  planLine: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 2,
  },
  planName: {
    fontWeight: '700',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  upgradeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

export default UpgradeModal;
