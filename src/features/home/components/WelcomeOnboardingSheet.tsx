import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';
import { GemIcon, ListChecksIcon, SparklesIcon } from '@assets/icons';
import { OnboardingStatus } from '../api/onboardingApi';

interface WelcomeOnboardingSheetProps {
  onboarding: OnboardingStatus | null;
  /** Takes the user to the checklist, which lives on Inicio. */
  onStart: () => void;
  onClose: () => void;
}

/**
 * First screen for a user with an empty closet — port of zena `WelcomeModal`.
 *
 * It does not ask for a garment: it pitches the whole first-steps journey,
 * because the reward hangs off all ten tasks, not the first upload alone.
 * Dismissed by the backdrop or the "explore first" link (no close button).
 */
function WelcomeOnboardingSheet({ onboarding, onStart, onClose }: WelcomeOnboardingSheetProps) {
  const { t } = useTranslation();
  const theme = useHomeTheme();
  const h = theme.home;
  const c = theme.common;

  const total = onboarding?.totalCount ?? 10;
  const completed = onboarding?.completedCount ?? 0;
  const gems = onboarding?.rewardGems ?? 200;
  const progress = Math.round((completed / Math.max(1, total)) * 100);

  return (
    <BottomSheet onClose={onClose} backgroundColor={c.onboardingCardBackground}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View>
            <View style={[styles.iconBox, { backgroundColor: c.onboardingAccentSoft }]}>
              <SparklesIcon size={24} color={c.onboardingAccent} />
            </View>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: c.onboardingAccent, borderColor: c.onboardingCardBackground },
              ]}
            >
              <ListChecksIcon size={10} color={c.onboardingAccentText} strokeWidth={2.5} />
            </View>
          </View>
          <Text style={[styles.title, { color: c.onboardingTitle }]}>
            {t('home.welcomeOnboardingTitle', { total })}
          </Text>
        </View>

        <Text style={[styles.body, { color: c.onboardingStepText }]}>
          {t('home.welcomeOnboardingBody', { total })}
        </Text>

        {/* The reward, in plain sight: it is the reason to complete all ten. */}
        <View
          style={[
            styles.rewardBox,
            { backgroundColor: h.rewardBadgeBackground, borderColor: h.rewardBoxBorder },
          ]}
        >
          <View style={styles.rewardRow}>
            <GemIcon size={16} color={h.rewardBadgeText} />
            <Text style={[styles.rewardTitle, { color: h.rewardBadgeText }]}>
              {t('home.onboardingReward', { gems })}
            </Text>
          </View>
          <Text style={[styles.rewardSubtitle, { color: h.rewardBadgeText }]}>
            {t('home.onboardingSubtitle', { total })}
          </Text>
          <View style={styles.progressRow}>
            <View style={[styles.progressTrack, { backgroundColor: h.checklistBackground }]}>
              <View
                style={[styles.progressFill, { backgroundColor: h.progressFill, width: `${progress}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: h.rewardBadgeText }]}>
              {completed}/{total}
            </Text>
          </View>
        </View>

        <Touchable
          onPress={onStart}
          borderRadius={12}
          style={[styles.primaryButton, { backgroundColor: c.onboardingAccent }]}
        >
          <ListChecksIcon size={20} color={c.onboardingAccentText} />
          <Text style={[styles.primaryButtonText, { color: c.onboardingAccentText }]}>
            {t('home.welcomeOnboardingAction')}
          </Text>
        </Touchable>

        <Touchable onPress={onClose} borderRadius={8} style={styles.secondaryButton}>
          <Text style={[styles.secondaryButtonText, { color: h.checklistChevron }]}>
            {t('home.welcomeExploreFirst')}
          </Text>
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },
  rewardBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 24,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  rewardSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default WelcomeOnboardingSheet;
