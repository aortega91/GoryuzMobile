import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import useHomeTheme from '@hooks/useHomeTheme';
import { RootState, AppDispatch } from '@utilities/store';
import { RootStackParamList } from '@navigation/types';
import { ShirtIcon, StarIcon, PlusCircleIcon } from '@assets/icons';
import { loadProfile } from '../profileSlice';

import TopBar from '../components/TopBar';
import ActionCard from '../components/ActionCard';
import DrawerMenu from '../components/DrawerMenu';

function Home() {
  const theme = useHomeTheme();
  const homeTokens = theme.home;
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.session.user);
  const profile = useSelector((state: RootState) => state.profile.data);
  const profileStatus = useSelector((state: RootState) => state.profile.status);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fetch profile once on mount; skip if already loaded
  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(loadProfile());
    }
  }, [dispatch, profileStatus]);

  const gemCount = profile?.tokens ?? 0;

  const firstName = user?.displayName?.split(' ')[0] ?? t('home.defaultName');

  const handleNavigate = useCallback((_route: keyof RootStackParamList) => {
    setIsDrawerOpen(false);
    // TODO: navigation.navigate(_route) — wire up when each screen is built
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: homeTokens.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={homeTokens.topBarBackground}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Top navigation bar */}
        <TopBar
          onMenuPress={() => setIsDrawerOpen(true)}
          avatarUrl={user?.photoURL}
          gemCount={gemCount}
        />

        {/* Main scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={[styles.greeting, { color: homeTokens.headlineText }]}>
              {t('home.greeting', { name: firstName })}
            </Text>
            <Text style={[styles.greetingSubtitle, { color: homeTokens.subtitleText }]}>
              {t('home.greetingSubtitle')}
            </Text>
            <Text style={[styles.greetingQuestion, { color: homeTokens.subtitleText }]}>
              {t('home.greetingQuestion')}
            </Text>
          </View>

          {/* Action cards */}
          <View style={styles.cards}>
            {/* CTA — shown when closet is empty */}
            <ActionCard
              isCta
              icon={<ShirtIcon size={24} />}
              title={t('home.loadFirstItem')}
              description={t('home.loadFirstItemDesc')}
              onPress={() => {}}
            />

            <ActionCard
              icon={<StarIcon size={24} />}
              title={t('home.myStyles')}
              description={t('home.myStylesDesc')}
              onPress={() => handleNavigate('Styles')}
            />

            <ActionCard
              icon={<PlusCircleIcon size={24} />}
              title={t('home.addPieces')}
              description={t('home.addPiecesDesc')}
              onPress={() => handleNavigate('Collection')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Drawer overlay — rendered outside SafeAreaView to cover full screen */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        activeRoute="Home"
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    gap: 24,
  },
  greetingSection: {
    gap: 4,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  greetingSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 4,
  },
  greetingQuestion: {
    fontSize: 16,
    fontWeight: '400',
  },
  cards: {
    gap: 12,
  },
});

export default Home;
