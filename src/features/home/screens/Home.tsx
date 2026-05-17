import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from '@language/index';

import Touchable from '@components/Touchable';
import PermissionModal from '@components/PermissionModal';
import useHomeTheme from '@hooks/useHomeTheme';
import useLocation from '@hooks/useLocation';
import { RootState, AppDispatch } from '@utilities/store';
import { ShirtIcon, StarIcon, PlusCircleIcon, EyeIcon, SparklesIcon, BookmarkIcon } from '@assets/icons';
import { clearSession } from '@features/auth/sessionSlice';
import Collection from '@features/collection/screens/Collection';
import Styles from '@features/styles/screens/Styles';
import Schedule from '@features/schedule/screens/Schedule';
import Profile from '@features/profile/screens/Profile';
import Discover from '@features/discover/screens/Discover';
import { loadProfile } from '../profileSlice';
import { MOCK_FEED_POSTS } from '../mockFeedData';
import { ActiveModule } from '../types';

import TopBar from '../components/TopBar';
import ActionCard from '../components/ActionCard';
import DrawerMenu, { DrawerMenuHandle } from '../components/DrawerMenu';
import FeedPost from '../components/FeedPost';

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeTab = 'feed' | 'my_posts' | 'saved';

// ─── Component ────────────────────────────────────────────────────────────────

function Home() {
  const theme = useHomeTheme();
  const homeTokens = theme.home;
  const { t } = useTranslation();

  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.session.user);
  const profile = useSelector((state: RootState) => state.profile.data);
  const profileStatus = useSelector((state: RootState) => state.profile.status);
  const cityName = useSelector((state: RootState) => state.location.cityName);

  const { detectLocation, locationBlocked, handleOpenLocationSettings, dismissLocationBlocked } = useLocation();

  const insets = useSafeAreaInsets();

  const [activeModule, setActiveModule] = useState<ActiveModule>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<DrawerMenuHandle>(null);
  const [activeTab, setActiveTab] = useState<HomeTab>('feed');
  const [tabContentHeight, setTabContentHeight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(loadProfile());
    }
  }, [dispatch, profileStatus]);

  useEffect(() => {
    detectLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.language && profile.language !== i18n.language) {
      i18n.changeLanguage(profile.language);
      detectLocation();
    }
  }, [profile?.language]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await dispatch(loadProfile());
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]);

  const handleNavigate = useCallback((module: ActiveModule) => {
    setIsDrawerOpen(false);
    setActiveModule(module);
  }, []);

  const gemCount = profile?.tokens ?? 0;
  const firstName = user?.displayName?.split(' ')[0] ?? t('home.defaultName');
  const location = cityName ?? undefined;

  // ─── Home panel tabs ─────────────────────────────────────────────────────────

  const renderInspirationTab = () => {
    if (tabContentHeight === 0) {
      return null;
    }
    return (
      <FlatList
        data={MOCK_FEED_POSTS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <FeedPost post={item} height={tabContentHeight} />
        )}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: tabContentHeight,
          offset: tabContentHeight * index,
          index,
        })}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={homeTokens.headlineText}
          />
        }
      />
    );
  };

  const renderMyVisionTab = () => (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={homeTokens.headlineText}
        />
      }
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
        <ActionCard
          isCta
          icon={<ShirtIcon size={24} />}
          title={t('home.loadFirstItem')}
          description={t('home.loadFirstItemDesc')}
          onPress={() => setActiveModule('closet')}
        />
        <ActionCard
          icon={<StarIcon size={24} />}
          title={t('home.myStyles')}
          description={t('home.myStylesDesc')}
          onPress={() => setActiveModule('styles')}
        />
        <ActionCard
          icon={<PlusCircleIcon size={24} />}
          title={t('home.addPieces')}
          description={t('home.addPiecesDesc')}
          onPress={() => setActiveModule('closet')}
        />
      </View>
    </ScrollView>
  );

  const renderSavedTab = () => (
    <View style={styles.emptyState}>
      <BookmarkIcon size={48} color={homeTokens.subtitleText} strokeWidth={1.5} />
      <Text style={[styles.emptyTitle, { color: homeTokens.headlineText }]}>
        {t('home.noSavedYet')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: homeTokens.subtitleText }]}>
        {t('home.tabInspiration')} →
      </Text>
    </View>
  );

  // ─── Bottom tab bar (home panel only) ────────────────────────────────────────

  const TABS: { id: HomeTab; labelKey: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { id: 'my_posts', labelKey: 'home.tabMyVision', Icon: EyeIcon },
    { id: 'feed', labelKey: 'home.tabInspiration', Icon: SparklesIcon },
    { id: 'saved', labelKey: 'home.tabCollection', Icon: BookmarkIcon },
  ];

  // ─── Coming soon placeholder ──────────────────────────────────────────────────

  const renderComingSoon = () => (
    <View style={styles.comingSoon}>
      <SparklesIcon size={48} color={homeTokens.subtitleText} strokeWidth={1.5} />
      <Text style={[styles.comingSoonText, { color: homeTokens.headlineText }]}>
        {t('common.comingSoon')}
      </Text>
    </View>
  );

  const statusBarDark = activeModule === 'home' && activeTab === 'feed';

  return (
    <View style={[styles.root, { backgroundColor: homeTokens.background }]}>
      <StatusBar
        barStyle={theme.dark || statusBarDark ? 'light-content' : 'dark-content'}
        backgroundColor={statusBarDark ? '#000000' : homeTokens.topBarBackground}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top navigation bar — always visible */}
        <TopBar
          onMenuPress={() => { drawerRef.current?.open(); setIsDrawerOpen(true); }}
          avatarUrl={profile?.avatarUrl ?? user?.photoURL}
          gemCount={gemCount}
          location={location}
          onLocationPress={detectLocation}
          onAvatarPress={() => setActiveModule('profile')}
        />

        {/* Module content area */}
        <View
          style={styles.content}
          onLayout={e => setTabContentHeight(e.nativeEvent.layout.height)}
        >
          {activeModule === 'home' && (
            <>
              {activeTab === 'feed' && renderInspirationTab()}
              {activeTab === 'my_posts' && renderMyVisionTab()}
              {activeTab === 'saved' && renderSavedTab()}

              {activeTab === 'feed' && (
                <Touchable
                  style={[styles.fab, { backgroundColor: homeTokens.fabBackground }]}
                  onPress={() => {}}
                  borderRadius={26}
                >
                  <Text style={[styles.fabIcon, { color: homeTokens.fabIcon }]}>+</Text>
                </Touchable>
              )}
            </>
          )}

          {activeModule === 'closet' && <Collection />}
          {activeModule === 'styles' && <Styles />}
          {activeModule === 'schedule' && <Schedule />}
          {activeModule === 'profile' && <Profile />}
          {activeModule === 'discover' && <Discover />}
          {activeModule === 'second_life' && renderComingSoon()}
          {activeModule === 'community' && renderComingSoon()}
        </View>

        {/* Bottom tab bar — home panel only */}
        {activeModule === 'home' && (
          <View
            style={[
              styles.tabBar,
              {
                backgroundColor: homeTokens.tabBarBackground,
                borderTopColor: homeTokens.tabBarBorder,
                paddingBottom: insets.bottom + 8,
              },
            ]}
          >
            {TABS.map(({ id, labelKey, Icon }) => {
              const isActive = activeTab === id;
              return (
                <Touchable
                  key={id}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(id)}
                >
                  <Icon
                    size={22}
                    color={isActive ? homeTokens.tabBarActiveIcon : homeTokens.tabBarIcon}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                      {
                        color: isActive
                          ? homeTokens.tabBarActiveText
                          : homeTokens.tabBarText,
                      },
                    ]}
                  >
                    {t(labelKey)}
                  </Text>
                </Touchable>
              );
            })}
          </View>
        )}
      </SafeAreaView>

      {/* Drawer overlay */}
      <DrawerMenu
        ref={drawerRef}
        isOpen={isDrawerOpen}
        activeModule={activeModule}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
        onLogout={() => dispatch(clearSession())}
      />

      {locationBlocked && (
        <PermissionModal
          type="location"
          onOpenSettings={handleOpenLocationSettings}
          onDismiss={dismissLocationBlocked}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  // Home panel
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
  },
  // FAB
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  // Bottom tab bar
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 10,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  tabLabelInactive: {
    fontWeight: '500',
  },
  // Coming soon placeholder
  comingSoon: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: '700',
  },
});

export default Home;
