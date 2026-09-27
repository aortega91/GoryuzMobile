import React, { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';
import { AppDispatch, RootState } from '@utilities/store';
import { setHomeChecklistCollapsed } from '@utilities/onboardingSlice';
import {
  ArrowRightIcon,
  CalendarPlusIcon,
  CheckIcon,
  ChevronDownIcon,
  GemIcon,
  MessageIcon,
  PaletteIcon,
  PenLineIcon,
  PlaneIcon,
  RecycleIcon,
  ShirtIcon,
  SparklesIcon,
  StarIcon,
  UserPlusIcon,
} from '@assets/icons';
import {
  ONBOARDING_TASK_KEYS,
  OnboardingStatus,
  OnboardingTaskKey,
} from '../api/onboardingApi';

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

/** Icon per task — same Lucide glyphs as zena's `TASK_META`. */
const TASK_ICONS: Record<OnboardingTaskKey, IconComponent> = {
  firstItem: ShirtIcon,
  firstOutfit: StarIcon,
  avatar: SparklesIcon,
  stylePrompt: PenLineIcon,
  colorimetry: PaletteIcon,
  firstTrip: PlaneIcon,
  scheduleOutfit: CalendarPlusIcon,
  secondLife: RecycleIcon,
  friend: UserPlusIcon,
  message: MessageIcon,
};

interface OnboardingChecklistProps {
  status: OnboardingStatus | null;
  onTaskPress: (task: OnboardingTaskKey) => void;
  onClaimReward: () => void;
  isClaiming: boolean;
}

/**
 * "First steps" checklist on Inicio — port of zena `OnboardingChecklist.tsx`.
 *
 * Disappears once the reward is claimed. Until then it can be collapsed down
 * to its progress bar; the preference is persisted (zena keeps it in
 * localStorage) so it stays collapsed when the user comes back to Inicio.
 */
function OnboardingChecklist({
  status,
  onTaskPress,
  onClaimReward,
  isClaiming,
}: OnboardingChecklistProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const h = useHomeTheme().home;
  const isCollapsed = useSelector(
    (state: RootState) => state.onboarding.homeChecklistCollapsed ?? false,
  );

  const toggleCollapsed = useCallback(() => {
    dispatch(setHomeChecklistCollapsed(!isCollapsed));
  }, [dispatch, isCollapsed]);

  if (!status || status.rewardClaimed) {
    return null;
  }

  const total = Math.max(1, status.totalCount);
  const progress = Math.round((status.completedCount / total) * 100);
  const canClaim = status.allCompleted;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: h.checklistBackground, borderColor: h.checklistBorder },
      ]}
    >
      <Touchable
        onPress={toggleCollapsed}
        style={styles.header}
        borderRadius={8}
        accessibilityLabel={t(isCollapsed ? 'home.onboardingExpand' : 'home.onboardingCollapse')}
      >
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: h.checklistTitle }]}>
            {t('home.onboardingTitle')}
          </Text>
          {/* Says what is earned, not a bare number ("200" alone reads as a balance). */}
          <View style={[styles.rewardBadge, { backgroundColor: h.rewardBadgeBackground }]}>
            <GemIcon size={14} color={h.rewardBadgeText} />
            <Text style={[styles.rewardBadgeText, { color: h.rewardBadgeText }]}>
              {t('home.onboardingReward', { gems: status.rewardGems })}
            </Text>
          </View>
        </View>
        <View style={isCollapsed ? undefined : styles.chevronOpen}>
          <ChevronDownIcon size={20} color={h.checklistChevron} />
        </View>
      </Touchable>

      {!isCollapsed && (
        <Text style={[styles.subtitle, { color: h.checklistSubtitle }]}>
          {t('home.onboardingSubtitle', { total: status.totalCount })}
        </Text>
      )}

      {/* The bar stays visible while collapsed: it is the section's summary. */}
      <View style={[styles.progressRow, !isCollapsed && styles.progressRowOpen]}>
        <View style={[styles.progressTrack, { backgroundColor: h.progressTrack }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: h.progressFill, width: `${progress}%` },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: h.progressText }]}>
          {status.completedCount}/{status.totalCount}
        </Text>
      </View>

      {!isCollapsed && (
        <View style={styles.taskList}>
          {ONBOARDING_TASK_KEYS.map(key => {
            const done = !!status.tasks[key];
            const Icon = TASK_ICONS[key];
            return (
              <Touchable
                key={key}
                onPress={() => onTaskPress(key)}
                borderRadius={8}
                style={[
                  styles.task,
                  done
                    ? { backgroundColor: h.taskDoneBackground, borderColor: h.taskDoneBorder }
                    : { backgroundColor: h.taskBackground, borderColor: h.taskBorder },
                ]}
              >
                <View
                  style={[
                    styles.taskIcon,
                    { backgroundColor: done ? h.taskDoneIconBackground : h.taskIconBackground },
                  ]}
                >
                  {done ? (
                    <CheckIcon size={18} color={h.taskDoneIcon} />
                  ) : (
                    <Icon size={18} color={h.taskIcon} />
                  )}
                </View>
                <Text
                  style={[
                    styles.taskText,
                    done
                      ? [styles.taskTextDone, { color: h.taskDoneText }]
                      : [styles.taskTextPending, { color: h.taskText }],
                  ]}
                >
                  {t(`home.onboardingTask_${key}`)}
                </Text>
                {!done && <ArrowRightIcon size={16} color={h.taskArrow} />}
              </Touchable>
            );
          })}
        </View>
      )}

      {/* The claim button is never collapsed away: hiding the list should not
          hide a reward the user already earned. */}
      {canClaim && (
        <Touchable
          onPress={onClaimReward}
          disabled={isClaiming}
          borderRadius={8}
          style={[
            styles.claimButton,
            { backgroundColor: h.claimButton },
            isClaiming && styles.disabled,
          ]}
        >
          {isClaiming ? (
            <ActivityIndicator size="small" color={h.claimButtonText} />
          ) : (
            <>
              <GemIcon size={18} color={h.claimButtonText} />
              <Text style={[styles.claimText, { color: h.claimButtonText }]}>
                {t('home.onboardingClaim', { gems: status.rewardGems })}
              </Text>
            </>
          )}
        </Touchable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: {
    flex: 1,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  rewardBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  subtitle: {
    fontSize: 13,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
  },
  progressRowOpen: {
    marginBottom: 20,
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
  taskList: {
    gap: 8,
  },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  taskIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskText: {
    flex: 1,
    fontSize: 14,
  },
  taskTextPending: {
    fontWeight: '500',
  },
  taskTextDone: {
    textDecorationLine: 'line-through',
  },
  claimButton: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  claimText: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.6,
  },
});

export default OnboardingChecklist;
