import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  PlusCircleIcon,
  ShirtIcon,
  StarIcon,
  UsersIcon,
} from '@assets/icons';
import { UserProfile } from '../api/profileApi';
import { OnboardingStatus, OnboardingTaskKey } from '../api/onboardingApi';
import ActionCard from './ActionCard';
import OnboardingChecklist from './OnboardingChecklist';

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface HomePanelProps {
  profile: UserProfile | null;
  /** Firebase display name, used until the profile has loaded. */
  fallbackName?: string | null;
  /** `null` while the closet has not loaded yet — no nudge is shown then. */
  hasItems: boolean | null;
  onboarding: OnboardingStatus | null;
  onClaimReward: () => void;
  isClaimingReward: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenStyles: () => void;
  onOpenAvatar: () => void;
  onAddItems: () => void;
  onOpenCommunity: () => void;
  onTaskPress: (task: OnboardingTaskKey) => void;
}

/** zena `getDisplayName`: the optional alias wins over the Google name. */
function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return '';
  return profile.alias?.trim() || profile.name?.trim() || '';
}

function welcomeKey(gender: string | null | undefined): string {
  if (gender === 'male' || gender === 'female') return `home.stylistWelcome_${gender}`;
  return 'home.stylistWelcome_neutral';
}

// ─── Nudge banner ─────────────────────────────────────────────────────────────

interface NudgeProps {
  Icon: IconComponent;
  title: string;
  description: React.ReactNode;
  onPress: () => void;
}

function Nudge({ Icon, title, description, onPress }: NudgeProps) {
  const h = useHomeTheme().home;
  return (
    <Touchable
      onPress={onPress}
      borderRadius={8}
      style={[styles.nudge, { backgroundColor: h.nudgeBackground, borderLeftColor: h.nudgeBorder }]}
    >
      <View style={styles.nudgeIcon}>
        <Icon size={24} color={h.nudgeIcon} />
      </View>
      <View style={styles.nudgeBody}>
        <View style={styles.nudgeTitleRow}>
          <Text style={[styles.nudgeTitle, { color: h.nudgeTitle }]}>{title}</Text>
          <ArrowRightIcon size={18} color={h.nudgeIcon} />
        </View>
        <Text style={[styles.nudgeText, { color: h.nudgeText }]}>{description}</Text>
      </View>
    </Touchable>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

/**
 * Inicio — port of zena `HomeView.tsx`: greeting, setup nudges, a row of
 * shortcuts and the "first steps" checklist with its gem reward.
 */
function HomePanel({
  profile,
  fallbackName,
  hasItems,
  onboarding,
  onClaimReward,
  isClaimingReward,
  isRefreshing,
  onRefresh,
  onOpenStyles,
  onOpenAvatar,
  onAddItems,
  onOpenCommunity,
  onTaskPress,
}: HomePanelProps) {
  const { t } = useTranslation();
  const h = useHomeTheme().home;

  const name = getDisplayName(profile) || fallbackName || t('home.defaultName');

  // While the checklist is on screen it already asks for the avatar and the
  // first garment: repeating that in a banner would say the same thing twice.
  const showOnboarding = !!onboarding && !onboarding.rewardClaimed;
  const showAvatarNudge = !showOnboarding && !!profile && !profile.avatarDescription;
  const showFirstItemNudge = !showOnboarding && hasItems === false;

  // "GORYUZ" is set in bold brand colour inside the first-item description.
  const firstItemDescription = t('home.loadFirstItemDesc')
    .split('GORYUZ')
    .map((part, i, arr) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={i}>
        {part}
        {i < arr.length - 1 && (
          <Text style={[styles.brand, { color: h.nudgeBrand }]}>GORYUZ</Text>
        )}
      </React.Fragment>
    ));

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: h.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={h.headlineText} />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: h.headlineText }]}>
          {t('home.greeting', { name })}
        </Text>
        <Text style={[styles.subtitle, { color: h.subtitleText }]}>
          {t(welcomeKey(profile?.gender))}
        </Text>
      </View>

      {showAvatarNudge && (
        <Nudge
          Icon={AlertTriangleIcon}
          title={t('home.setupAvatarTitle')}
          description={t('home.setupAvatarDescription')}
          onPress={onOpenAvatar}
        />
      )}

      {showFirstItemNudge && (
        <Nudge
          Icon={ShirtIcon}
          title={t('home.loadFirstItem')}
          description={firstItemDescription}
          onPress={onAddItems}
        />
      )}

      <View style={styles.shortcuts}>
        <ActionCard Icon={StarIcon} title={t('menu.styles')} onPress={onOpenStyles} />
        <ActionCard Icon={PlusCircleIcon} title={t('home.addItems')} onPress={onAddItems} />
        <ActionCard Icon={UsersIcon} title={t('menu.community')} onPress={onOpenCommunity} />
      </View>

      <OnboardingChecklist
        status={onboarding}
        onTaskPress={onTaskPress}
        onClaimReward={onClaimReward}
        isClaiming={isClaimingReward}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 23,
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  nudgeIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  nudgeBody: {
    flex: 1,
  },
  nudgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nudgeTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  nudgeText: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  brand: {
    fontWeight: '700',
  },
  shortcuts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
});

export default HomePanel;
