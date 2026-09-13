import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Touchable from '@components/Touchable';
import useCommonTheme from '@hooks/useCommonTheme';
import { RootState, AppDispatch } from '@utilities/store';
import { markSubmoduleHintSeen, SubmoduleHintViewId } from '@utilities/onboardingSlice';

/**
 * On the web reference, a module's submodules show as tabs next to the title
 * on desktop, but on mobile they live in a bar at the foot of the screen and
 * go unnoticed. This mirrors its `SubmodulesCoachMark`: the first time a
 * module with such a bar is opened, everything but that bar is dimmed, a card
 * explains each tab in one line, and the only way out is "Got it" — a stray
 * tap on the veil or the bar itself does nothing, so the tip can't be missed
 * by accident. Once dismissed it never shows again for that module.
 */

export interface SubmoduleHintItem {
  id: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  hint: string;
}

interface SubmodulesCoachMarkProps {
  /** Identifies the module so the dismissal is remembered per-module. */
  viewId: SubmoduleHintViewId;
  items: SubmoduleHintItem[];
  /** Height of the bottom submodules bar being pointed at, safe-area inset included. */
  barHeight: number;
  /** Lets a caller postpone showing it while the module is locked or still loading. */
  enabled?: boolean;
}

function SubmodulesCoachMark({
  viewId,
  items,
  barHeight,
  enabled = true,
}: SubmodulesCoachMarkProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useCommonTheme();
  const c = theme.common;

  const seenHints = useSelector((state: RootState) => state.onboarding.seenSubmoduleHints);
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed || (seenHints ?? []).includes(viewId)) {
    return null;
  }

  const dismiss = () => {
    setDismissed(true);
    dispatch(markSubmoduleHintSeen(viewId));
  };

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* Veil over everything except the bar — swallows taps, doesn't dismiss on them */}
      <View style={[styles.veil, { bottom: barHeight, backgroundColor: c.overlayDark }]} />

      {/* Frames and highlights the bar itself without unlocking it */}
      <View
        style={[styles.frame, { height: barHeight, borderTopColor: c.onboardingAccent }]}
      />

      <View
        style={[
          styles.card,
          {
            bottom: barHeight + 16,
            backgroundColor: c.onboardingCardBackground,
            borderColor: c.onboardingCardBorder,
          },
        ]}
      >
        <Text style={[styles.title, { color: c.onboardingTitle }]}>
          {t('onboarding.submodulesTipTitle')}
        </Text>
        <Text style={[styles.intro, { color: c.onboardingStepText }]}>
          {t('onboarding.submodulesTipIntro')}
        </Text>

        <View style={styles.items}>
          {items.map(item => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemIcon}>
                <item.Icon size={18} color={c.onboardingAccent} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text
                  style={[styles.itemLabel, { color: c.onboardingTitle }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                <Text
                  style={[styles.itemHint, { color: c.onboardingStepText }]}
                  numberOfLines={1}
                >
                  {item.hint}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Touchable
          onPress={dismiss}
          borderRadius={14}
          style={[styles.button, { backgroundColor: c.onboardingAccent }]}
        >
          <Text style={[styles.buttonText, { color: c.onboardingAccentText }]}>
            {t('onboarding.submodulesTipAction')}
          </Text>
        </Touchable>
      </View>

      {/* Little arrow linking the card to the highlighted bar */}
      <View
        style={[
          styles.arrow,
          {
            bottom: barHeight + 10,
            backgroundColor: c.onboardingCardBackground,
            borderColor: c.onboardingCardBorder,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  frame: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 2,
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  intro: {
    fontSize: 12,
    marginTop: 2,
  },
  items: {
    marginTop: 14,
    gap: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  itemIcon: {
    marginTop: 1,
  },
  itemTextWrap: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  itemHint: {
    fontSize: 11.5,
    marginTop: 1,
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  arrow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -6,
    width: 12,
    height: 12,
    transform: [{ rotate: '45deg' }],
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export default SubmodulesCoachMark;
