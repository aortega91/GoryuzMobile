import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from '@language/index';

import Touchable from '@components/Touchable';
import BottomSheet from '@components/BottomSheet';
import PermissionModal from '@components/PermissionModal';
import useHomeTheme from '@hooks/useHomeTheme';
import useLocation from '@hooks/useLocation';
import useCameraPermission from '@hooks/useCameraPermission';
import { RootState, AppDispatch } from '@utilities/store';
import {
  BookmarkIcon,
  CameraIcon,
  ImageIcon,
  PlusCircleIcon,
  SparklesIcon,
} from '@assets/icons';
import { clearSession } from '@features/auth/sessionSlice';
import Collection from '@features/collection/screens/Collection';
import Styles from '@features/styles/screens/Styles';
import Schedule from '@features/schedule/screens/Schedule';
import Profile from '@features/profile/screens/Profile';
import Discover from '@features/discover/screens/Discover';
import SecondLife from '@features/secondLife/screens/SecondLife';
import Notifications from '@features/notifications/screens/Notifications';
import Subscription from '@features/subscription/screens/Subscription';
import Support from '@features/support/screens/Support';
import Community from '@features/community/screens/Community';
import { fetchConversations } from '@features/community/api/communityApi';
import { addNotification } from '@features/notifications/notificationsSlice';
import { clearPendingDeepLink } from '@features/notifications/deepLinkSlice';
import { loadEvents } from '@features/schedule/scheduleSlice';
import { logError } from '@utilities/crashlytics';
import { loadProfile } from '../profileSlice';
import { MOCK_FEED_POSTS, MOCK_OWN_POSTS, MOCK_SAVED_POSTS } from '../mockFeedData';
import { ActiveModule, FeedPost as FeedPostType } from '../types';

import TopBar from '../components/TopBar';
import DrawerMenu, { DrawerMenuHandle } from '../components/DrawerMenu';
import FeedPost from '../components/FeedPost';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLS = 3;
const GRID_GAP = 2;
const GRID_ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (GRID_COLS + 1)) / GRID_COLS;

const COLOR_FILTERS = [
  { key: 'all', labelKey: 'lookbook.filterAll' },
  { key: 'neutral', labelKey: 'lookbook.filterNeutral' },
  { key: 'earth', labelKey: 'lookbook.filterEarth' },
  { key: 'dark', labelKey: 'lookbook.filterDark' },
  { key: 'pink', labelKey: 'lookbook.filterPink' },
  { key: 'blue', labelKey: 'lookbook.filterBlue' },
  { key: 'green', labelKey: 'lookbook.filterGreen' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type HomeTab = 'feed' | 'my_posts' | 'saved';

// ─── Publish Sheet ────────────────────────────────────────────────────────────

type HomeTokens = ReturnType<typeof useHomeTheme>['home'];

interface PublishSheetProps {
  onClose: () => void;
  tokens: HomeTokens;
}

function PublishSheet({ onClose, tokens: t_ }: PublishSheetProps) {
  const { t } = useTranslation();
  const { openCamera, openGallery } = useCameraPermission();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handlePickSource = () => {
    Alert.alert(t('lookbook.addPhoto'), '', [
      {
        text: t('lookbook.fromCamera'),
        onPress: async () => {
          const asset = await openCamera();
          if (asset?.uri) setImageUri(asset.uri);
        },
      },
      {
        text: t('lookbook.fromGallery'),
        onPress: async () => {
          const asset = await openGallery();
          if (asset?.uri) setImageUri(asset.uri);
        },
      },
      { text: t('common.cancel'), style: 'cancel' },
    ]);
  };

  const handlePublish = () => {
    if (!title.trim() || !imageUri) {
      Alert.alert(t('lookbook.publishRequired'));
      return;
    }
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1200);
  };

  return (
    <BottomSheet onClose={onClose} backgroundColor={t_.cardBackground}>
      <View style={styles.sheetContent}>
        <Text style={[styles.sheetTitle, { color: t_.headlineText }]}>
          {t('lookbook.publishTitle')}
        </Text>

        <Touchable
          style={[
            styles.imagePicker,
            { backgroundColor: t_.inputBackground, borderColor: t_.inputBorder },
            imageUri ? styles.imagePickerFilled : null,
          ]}
          onPress={handlePickSource}
          borderRadius={12}
          disabled={isSaving}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePickerPreview} resizeMode="cover" />
          ) : (
            <View style={styles.imagePickerPlaceholder}>
              <CameraIcon size={28} color={t_.inputPlaceholder} strokeWidth={1.5} />
              <Text style={[styles.imagePickerLabel, { color: t_.inputPlaceholder }]}>
                {t('lookbook.addPhoto')}
              </Text>
            </View>
          )}
        </Touchable>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: t_.headlineText }]}>
            {t('lookbook.postTitle')}
          </Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: t_.inputBackground, borderColor: t_.inputBorder, color: t_.inputText },
            ]}
            placeholder={t('lookbook.postTitlePlaceholder')}
            placeholderTextColor={t_.inputPlaceholder}
            value={title}
            onChangeText={setTitle}
            editable={!isSaving}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: t_.headlineText }]}>
            {t('lookbook.postDescription')}
          </Text>
          <TextInput
            style={[
              styles.input,
              styles.inputMultiline,
              { backgroundColor: t_.inputBackground, borderColor: t_.inputBorder, color: t_.inputText },
            ]}
            placeholder={t('lookbook.postDescriptionPlaceholder')}
            placeholderTextColor={t_.inputPlaceholder}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            editable={!isSaving}
          />
        </View>

        <Touchable
          style={[
            styles.publishButton,
            { backgroundColor: t_.primaryButton },
            isSaving && styles.disabledButton,
          ]}
          onPress={handlePublish}
          borderRadius={14}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={t_.primaryButtonText} size="small" />
          ) : (
            <Text style={[styles.publishButtonText, { color: t_.primaryButtonText }]}>
              {t('lookbook.publish')}
            </Text>
          )}
        </Touchable>
      </View>
    </BottomSheet>
  );
}

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
  const scheduleEvents = useSelector((state: RootState) => state.schedule.events);
  const scheduleStatus = useSelector((state: RootState) => state.schedule.eventsStatus);
  const unreadNotifications = useSelector(
    (state: RootState) => state.notifications.items.filter(n => !n.read).length,
  );

  const { detectLocation, locationBlocked, handleOpenLocationSettings, dismissLocationBlocked } = useLocation();

  const insets = useSafeAreaInsets();

  const [activeModule, setActiveModule] = useState<ActiveModule>('styles');
  // Which view Community opens into. The TopBar message icon (always visible)
  // opens it straight to `messages`; the drawer opens the default `connections`.
  const [communityView, setCommunityView] = useState<'connections' | 'messages'>('connections');
  const [dmFriend, setDmFriend] = useState<{ id: string; name?: string } | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<DrawerMenuHandle>(null);
  const [activeTab, setActiveTab] = useState<HomeTab>('feed');
  const [tabContentHeight, setTabContentHeight] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const gemCount = profile?.tokens ?? 0;

  // Mi Visión state
  const [ownPosts, setOwnPosts] = useState<FeedPostType[]>(MOCK_OWN_POSTS);
  const [showPublishSheet, setShowPublishSheet] = useState(false);

  // Colección filter state
  const [savedFilter, setSavedFilter] = useState('all');

  useEffect(() => {
    if (profileStatus === 'idle') {
      dispatch(loadProfile());
    }
  }, [dispatch, profileStatus]);

  // Total unread direct messages, surfaced as a bubble on the TopBar message
  // icon. Recomputed when the active module changes (so it clears after the
  // user visits Community) and polled on a light interval so a new incoming
  // message lights up the bubble without needing a navigation.
  const profileId = profile?.id;
  const refreshUnreadMessages = useCallback(async () => {
    if (!profileId) { return; }
    try {
      const conversations = await fetchConversations(profileId);
      setUnreadMessages(
        conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0),
      );
    } catch (err) {
      logError(err, 'Home.refreshUnreadMessages');
    }
  }, [profileId]);

  useEffect(() => {
    refreshUnreadMessages();
    const interval = setInterval(refreshUnreadMessages, 30000);
    return () => clearInterval(interval);
  }, [refreshUnreadMessages, activeModule]);

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

  useEffect(() => {
    if (scheduleStatus === 'idle') dispatch(loadEvents());
  }, [dispatch, scheduleStatus]);

  useEffect(() => {
    if (scheduleStatus !== 'succeeded') return;
    const today = new Date().toISOString().split('T')[0];
    const todayEvent = scheduleEvents.find(e => e.date === today && e.outfit);
    if (todayEvent?.outfit) {
      dispatch(addNotification({
        id: `outfit-today-${today}`,
        text: t('notifications.outfitToday', { name: todayEvent.outfit.name }),
        timestamp: new Date().toISOString(),
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleStatus]);

  // Notify whenever gems are spent (the balance drops). The first observed
  // value just seeds the baseline so loading the profile doesn't fire one.
  const prevGemCountRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevGemCountRef.current;
    if (prev != null && profile != null && gemCount < prev) {
      dispatch(addNotification({
        id: `gem-use-${new Date().toISOString()}`,
        text: t('notifications.gemsUsed', { count: prev - gemCount }),
        timestamp: new Date().toISOString(),
      }));
    }
    prevGemCountRef.current = gemCount;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gemCount]);

  // Notify whenever the unread-message count climbs (a new message arrived).
  const prevUnreadMessagesRef = useRef<number | null>(null);
  useEffect(() => {
    const prev = prevUnreadMessagesRef.current;
    if (prev != null && unreadMessages > prev) {
      dispatch(addNotification({
        id: `msg-${new Date().toISOString()}`,
        text: t('notifications.newMessage'),
        timestamp: new Date().toISOString(),
      }));
    }
    prevUnreadMessagesRef.current = unreadMessages;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unreadMessages]);

  // Consume a push-notification tap (real FCM push, not the in-app bell above).
  const pendingDeepLink = useSelector((state: RootState) => state.deepLink.pendingDeepLink);
  useEffect(() => {
    if (!pendingDeepLink) return;
    if (pendingDeepLink.kind === 'chat_message' && pendingDeepLink.friendId) {
      setDmFriend({ id: pendingDeepLink.friendId, name: pendingDeepLink.friendName });
      setCommunityView('messages');
      setActiveModule('community');
    }
    // 'gems' needs no extra navigation — Home is already the gem-visible landing screen.
    dispatch(clearPendingDeepLink());
  }, [pendingDeepLink, dispatch]);

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
    // The drawer always opens Community on its Connections view; the TopBar
    // message icon is the only entry point to the Messages view.
    if (module === 'community') { setCommunityView('connections'); }
    setActiveModule(module);
  }, []);

  const handleDeletePost = (post: FeedPostType) => {
    Alert.alert(
      t('lookbook.deleteTitle'),
      t('lookbook.deleteMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('lookbook.deleteConfirm'),
          style: 'destructive',
          onPress: () => setOwnPosts(prev => prev.filter(p => p.id !== post.id)),
        },
      ],
    );
  };

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

  const renderMyVisionTab = () => {
    if (ownPosts.length === 0) {
      return (
        <View style={styles.emptyState}>
          <ImageIcon size={48} color={homeTokens.subtitleText} strokeWidth={1.5} />
          <Text style={[styles.emptyTitle, { color: homeTokens.headlineText }]}>
            {t('lookbook.visionEmpty')}
          </Text>
          <Text style={[styles.emptySubtitle, { color: homeTokens.subtitleText }]}>
            {t('lookbook.visionEmptyDesc')}
          </Text>
          <Touchable
            style={[styles.emptyButton, { backgroundColor: homeTokens.primaryButton }]}
            onPress={() => setShowPublishSheet(true)}
            borderRadius={12}
          >
            <Text style={[styles.emptyButtonText, { color: homeTokens.primaryButtonText }]}>
              {t('lookbook.publishFirst')}
            </Text>
          </Touchable>
        </View>
      );
    }

    return (
      <ScrollView
        style={[styles.gridScroll, { backgroundColor: homeTokens.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={homeTokens.headlineText}
          />
        }
      >
        <View style={styles.grid}>
          {ownPosts.map(post => (
            <Touchable
              key={post.id}
              style={[styles.gridItem, { borderColor: homeTokens.gridItemBorder }]}
              onLongPress={() => handleDeletePost(post)}
              borderRadius={4}
            >
              <Image
                source={{ uri: post.imageUrl }}
                style={styles.gridItemImage}
                resizeMode="cover"
              />
            </Touchable>
          ))}
          <Touchable
            style={[
              styles.gridItem,
              styles.gridAddButton,
              { borderColor: homeTokens.gridItemBorder, backgroundColor: homeTokens.inputBackground },
            ]}
            onPress={() => setShowPublishSheet(true)}
            borderRadius={4}
          >
            <PlusCircleIcon size={28} color={homeTokens.inputPlaceholder} strokeWidth={1.5} />
          </Touchable>
        </View>
      </ScrollView>
    );
  };

  const renderSavedTab = () => {
    const filtered = savedFilter === 'all'
      ? MOCK_SAVED_POSTS
      : MOCK_SAVED_POSTS.filter(p => p.colors?.includes(savedFilter));

    return (
      <View style={[styles.collectionContainer, { backgroundColor: homeTokens.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterRowContent}
        >
          {COLOR_FILTERS.map(filter => {
            const isActive = savedFilter === filter.key;
            return (
              <Touchable
                key={filter.key}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive ? homeTokens.chipActiveBackground : homeTokens.chipBackground,
                    borderColor: isActive ? homeTokens.chipActiveBorder : homeTokens.chipBorder,
                  },
                ]}
                onPress={() => setSavedFilter(filter.key)}
                borderRadius={20}
              >
                <Text style={[
                  styles.chipText,
                  { color: isActive ? homeTokens.chipActiveText : homeTokens.chipText },
                ]}>
                  {t(filter.labelKey)}
                </Text>
              </Touchable>
            );
          })}
        </ScrollView>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <BookmarkIcon size={48} color={homeTokens.subtitleText} strokeWidth={1.5} />
            <Text style={[styles.emptyTitle, { color: homeTokens.headlineText }]}>
              {t('lookbook.collectionEmpty')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: homeTokens.subtitleText }]}>
              {t('lookbook.collectionEmptyDesc')}
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {filtered.map(post => (
                <View key={post.id} style={[styles.gridItem, { borderColor: homeTokens.gridItemBorder }]}>
                  <Image
                    source={{ uri: post.imageUrl }}
                    style={styles.gridItemImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  // ─── Bottom tab bar (home panel only) ────────────────────────────────────────

  const TABS: { id: HomeTab; labelKey: string; Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> }[] = [
    { id: 'my_posts', labelKey: 'home.tabMyVision', Icon: ImageIcon },
    { id: 'feed', labelKey: 'home.tabInspiration', Icon: SparklesIcon },
    { id: 'saved', labelKey: 'home.tabCollection', Icon: BookmarkIcon },
  ];


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
          onMessagePress={() => { setCommunityView('messages'); setActiveModule('community'); }}
          unreadMessages={unreadMessages}
          onNotificationPress={() => setActiveModule('notifications')}
          unreadNotifications={unreadNotifications}
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
            </>
          )}

          {activeModule === 'closet' && <Collection />}
          {activeModule === 'styles' && <Styles />}
          {activeModule === 'schedule' && <Schedule />}
          {activeModule === 'profile' && (
            <Profile onViewPlans={() => setActiveModule('subscription')} />
          )}
          {activeModule === 'discover' && <Discover />}
          {activeModule === 'second_life' && <SecondLife />}
          {activeModule === 'community' && (
            <Community
              key={communityView}
              initialView={communityView}
              deepLinkFriendId={dmFriend?.id}
              deepLinkFriendName={dmFriend?.name}
            />
          )}
          {activeModule === 'subscription' && <Subscription />}
          {activeModule === 'support' && <Support />}
          {activeModule === 'notifications' && (
            <Notifications onClose={() => setActiveModule('styles')} />
          )}
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

      {/* Publish sheet — mounted over the home panel */}
      {showPublishSheet && (
        <PublishSheet
          onClose={() => setShowPublishSheet(false)}
          tokens={homeTokens}
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
  // Grid (My Vision & Collection)
  gridScroll: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: GRID_GAP,
    gap: GRID_GAP,
  },
  gridItem: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  gridItemImage: {
    width: '100%',
    height: '100%',
  },
  gridAddButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Empty state
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
    lineHeight: 18,
  },
  emptyButton: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Collection filter
  collectionContainer: {
    flex: 1,
  },
  filterRow: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterRowContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
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
  // Publish sheet
  sheetContent: {
    padding: 20,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  imagePickerFilled: {
    borderWidth: 0,
  },
  imagePickerPreview: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imagePickerLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  publishButton: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default Home;
