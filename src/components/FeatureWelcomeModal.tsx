import React, { useCallback, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { CheckIcon, SparklesIcon } from '@assets/icons';
import Touchable from '@components/Touchable';
import useTheme from '@hooks/useTheme';
import { RootState } from '@utilities/store';
import { markTourCompleted, TourId } from '@utilities/onboardingSlice';

// ─── TEMP — REVERT BEFORE SHIPPING ───────────────────────────────────────────
// Forces every welcome dialog to appear on each visit so the copy and layout can
// be reviewed on device. Set back to `false` to restore the show-once behaviour
// (dismissals are still recorded either way, so nothing else needs undoing).
const ALWAYS_SHOW_TOURS = false;

interface FeatureWelcomeModalProps {
  /** Identifies the tour so it is only ever shown once. */
  tour: TourId;
  /** i18n key for the module name shown in the heading. */
  titleKey: string;
  /** i18n keys, one per bullet, in display order. */
  stepKeys: string[];
}

/**
 * One-time welcome dialog for a feature module: a short checklist explaining
 * what the module does. Self-gating — mount it unconditionally at the top of a
 * screen and it renders nothing once its tour has been completed.
 */
function FeatureWelcomeModal({ tour, titleKey, stepKeys }: FeatureWelcomeModalProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const c = theme.common;

  const completedTours = useSelector((state: RootState) => state.onboarding.completedTours);
  const alreadySeen = !ALWAYS_SHOW_TOURS && completedTours.includes(tour);

  // Closing is driven locally rather than by the redux flag, so the dialog still
  // dismisses while ALWAYS_SHOW_TOURS is on.
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    dispatch(markTourCompleted(tour));
  }, [dispatch, tour]);

  if (alreadySeen || dismissed) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.root}>
        {/* Full-screen backdrop — tapping it dismisses, as with every dialog here */}
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: c.overlayDark }]} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.card,
            {
              backgroundColor: c.onboardingCardBackground,
              borderColor: c.onboardingCardBorder,
            },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: c.onboardingAccentSoft }]}>
            <SparklesIcon size={30} color={c.onboardingAccent} />
          </View>

          <Text style={[styles.title, { color: c.onboardingTitle }]}>
            {t('onboarding.welcomeTo', { module: t(titleKey) })}
          </Text>

          <ScrollView
            style={styles.stepsScroll}
            contentContainerStyle={styles.steps}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {stepKeys.map(key => (
              <View
                key={key}
                style={[styles.step, { backgroundColor: c.onboardingStepBackground }]}
              >
                <View style={[styles.checkCircle, { backgroundColor: c.onboardingCheckSoft }]}>
                  <CheckIcon size={12} color={c.onboardingCheck} strokeWidth={3} />
                </View>
                <Text style={[styles.stepText, { color: c.onboardingStepText }]}>
                  {t(key)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Touchable
            onPress={handleDismiss}
            borderRadius={14}
            style={[styles.primaryBtn, { backgroundColor: c.onboardingAccent }]}
          >
            <Text style={[styles.primaryBtnText, { color: c.onboardingAccentText }]}>
              {t('onboarding.gotIt')}
            </Text>
          </Touchable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  stepsScroll: {
    alignSelf: 'stretch',
    flexGrow: 0,
  },
  steps: {
    gap: 10,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: 16,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '500',
    lineHeight: 20,
  },
  primaryBtn: {
    alignSelf: 'stretch',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});

export default FeatureWelcomeModal;
