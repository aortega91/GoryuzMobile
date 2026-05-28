import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useCommunityTheme from '@hooks/useCommunityTheme';
import useRequest from '@hooks/useRequest';
import { RootState } from '@utilities/store';
import {
  ChevronLeftIcon,
  CheckIcon,
  CloseIcon,
  MessageIcon,
  MoreVerticalIcon,
  SearchIcon,
  SendIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from '@assets/icons';
import {
  fetchFollowing,
  fetchRequests,
  searchUsers,
  sendRequest,
  respondToRequest,
  unfollowUser,
  fetchConversations,
  fetchMessages,
  sendMessage,
} from '../api/communityApi';
import { CommunityUser, ChatMessage, Conversation, FriendRequest } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

type MainTab = 'connections' | 'messages';
type ConnectionsTab = 'search' | 'following' | 'requests';

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// ─── User card ────────────────────────────────────────────────────────────────

type UserCardProps = {
  user: CommunityUser;
  c: ReturnType<typeof useCommunityTheme>['community'];
  rightSlot: React.ReactNode;
  onPress?: () => void;
};

function UserCard({ user, c, rightSlot, onPress }: UserCardProps) {
  return (
    <Touchable
      style={[styles.card, { backgroundColor: c.cardBackground, borderColor: c.cardBorder }]}
      onPress={onPress}
      borderRadius={14}
      disabled={!onPress}
    >
      <Image
        source={{ uri: user.avatarUrl || `https://i.pravatar.cc/80?u=${user.id}` }}
        style={[styles.cardAvatar, { borderColor: c.avatarBorder }]}
      />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: c.cardTitle }]} numberOfLines={1}>
          {user.name}
        </Text>
        {user.handle ? (
          <Text style={[styles.cardHandle, { color: c.cardSubtitle }]} numberOfLines={1}>
            @{user.handle}
          </Text>
        ) : null}
      </View>
      <View style={styles.cardRight}>{rightSlot}</View>
    </Touchable>
  );
}

// ─── Request card ─────────────────────────────────────────────────────────────

type RequestCardProps = {
  request: FriendRequest;
  c: ReturnType<typeof useCommunityTheme>['community'];
  onAccept: () => void;
  onReject: () => void;
};

function RequestCard({ request, c, onAccept, onReject }: RequestCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: c.cardBackground, borderColor: c.cardBorder }]}>
      <Image
        source={{ uri: request.avatarUrl || `https://i.pravatar.cc/80?u=${request.id}` }}
        style={[styles.cardAvatar, { borderColor: c.avatarBorder }]}
      />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: c.cardTitle }]} numberOfLines={1}>
          {request.name}
        </Text>
        {request.handle ? (
          <Text style={[styles.cardHandle, { color: c.cardSubtitle }]} numberOfLines={1}>
            @{request.handle}
          </Text>
        ) : null}
      </View>
      <View style={styles.requestActions}>
        <Touchable
          style={[styles.requestBtn, { backgroundColor: c.acceptBackground }]}
          onPress={onAccept}
          borderRadius={20}
        >
          <CheckIcon size={16} color={c.acceptText} strokeWidth={2.5} />
        </Touchable>
        <Touchable
          style={[styles.requestBtn, { backgroundColor: c.rejectBackground, borderColor: c.rejectBorder, borderWidth: 1 }]}
          onPress={onReject}
          borderRadius={20}
        >
          <CloseIcon size={16} color={c.rejectText} strokeWidth={2.5} />
        </Touchable>
      </View>
    </View>
  );
}

// ─── Conversation row ─────────────────────────────────────────────────────────

type ConvRowProps = {
  conv: Conversation;
  c: ReturnType<typeof useCommunityTheme>['community'];
  onPress: () => void;
};

function ConvRow({ conv, c, onPress }: ConvRowProps) {
  return (
    <Touchable
      style={[styles.convRow, { backgroundColor: c.cardBackground, borderBottomColor: c.cardBorder }]}
      onPress={onPress}
      borderRadius={0}
    >
      <View style={styles.convAvatarWrap}>
        <Image
          source={{ uri: conv.otherUserAvatar || `https://i.pravatar.cc/80?u=${conv.otherUserId}` }}
          style={[styles.convAvatar, { borderColor: c.avatarBorder }]}
        />
        {conv.unreadCount > 0 && (
          <View style={[styles.unreadDot, { backgroundColor: c.unreadDot }]} />
        )}
      </View>
      <View style={styles.convBody}>
        <View style={styles.convTopRow}>
          <Text style={[styles.convName, { color: c.cardTitle }]} numberOfLines={1}>
            {conv.otherUserName}
          </Text>
          <Text style={[styles.convTime, { color: c.timestampText }]}>
            {formatTime(conv.createdAt)}
          </Text>
        </View>
        <Text style={[styles.convPreview, { color: c.cardSubtitle }]} numberOfLines={1}>
          {conv.lastMessage || '…'}
        </Text>
      </View>
    </Touchable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function Community() {
  const theme = useCommunityTheme();
  const c = theme.community;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const user = useSelector((state: RootState) => state.session.user);
  const currentUserId = user?.uid ?? '';

  // ─ Navigation state ──────────────────────────────────────────────────────
  const [mainTab, setMainTab] = useState<MainTab>('connections');
  const [connTab, setConnTab] = useState<ConnectionsTab>('following');
  const [activeChat, setActiveChat] = useState<Conversation | null>(null);

  // ─ Connections data ──────────────────────────────────────────────────────
  const { data: following, loading: followingLoading, refetch: refetchFollowing } = useRequest(fetchFollowing);
  const { data: requests, loading: requestsLoading, refetch: refetchRequests } = useRequest(fetchRequests);

  // ─ Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CommunityUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─ Following action state ────────────────────────────────────────────────
  const [pendingSent, setPendingSent] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // ─ Messages data ─────────────────────────────────────────────────────────
  const fetchConvsBound = useCallback(
    () => fetchConversations(currentUserId),
    [currentUserId],
  );
  const { data: conversations, loading: convsLoading, refetch: refetchConvs } = useRequest(fetchConvsBound);

  // ─ Chat thread state ─────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesListRef = useRef<FlatList>(null);

  // ─ Search debounce ───────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (searchQuery.length < 3) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQuery]);

  // ─ Load messages when entering a chat ───────────────────────────────────
  useEffect(() => {
    if (!activeChat) return;
    setMessagesLoading(true);
    fetchMessages(activeChat.otherUserId)
      .then(setMessages)
      .catch(() => setMessages([]))
      .finally(() => setMessagesLoading(false));
  }, [activeChat]);

  // ─ Actions ───────────────────────────────────────────────────────────────

  const handleFollow = async (targetUser: CommunityUser) => {
    if (!targetUser.handle) return;
    setPendingSent(prev => new Set(prev).add(targetUser.id));
    try {
      await sendRequest(targetUser.handle);
    } catch {
      setPendingSent(prev => { const s = new Set(prev); s.delete(targetUser.id); return s; });
    }
  };

  const handleAccept = async (req: FriendRequest) => {
    try {
      await respondToRequest(req.id, 'accept');
      refetchRequests();
      refetchFollowing();
    } catch {
      // silent
    }
  };

  const handleReject = async (req: FriendRequest) => {
    setPendingAccept(prev => new Set(prev).add(req.id));
    try {
      await respondToRequest(req.id, 'reject');
      refetchRequests();
    } catch {
      // silent
    }
  };

  const handleUnfollow = (targetUser: CommunityUser) => {
    Alert.alert(
      t('community.unfollowTitle'),
      t('community.unfollowMessage', { name: targetUser.name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('community.unfollow'),
          style: 'destructive',
          onPress: async () => {
            try {
              await unfollowUser(targetUser.id);
              refetchFollowing();
            } catch {
              // silent
            }
          },
        },
      ],
    );
    setOpenMenu(null);
  };

  const handleSend = async () => {
    if (!chatInput.trim() || !activeChat || sendingMessage) return;
    const text = chatInput.trim();
    setChatInput('');
    setSendingMessage(true);
    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    try {
      await sendMessage(activeChat.id, text);
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    } finally {
      setSendingMessage(false);
    }
  };

  // ─ Derived data ──────────────────────────────────────────────────────────

  const filteredFollowing = (following ?? []).filter(
    f =>
      !filterQuery ||
      f.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      f.handle?.toLowerCase().includes(filterQuery.toLowerCase()),
  );

  const pendingRequestCount = requests?.length ?? 0;

  // ─ Render helpers ────────────────────────────────────────────────────────

  const renderEmptyState = (icon: React.ReactNode, title: string, subtitle?: string) => (
    <View style={styles.emptyState}>
      {icon}
      <Text style={[styles.emptyTitle, { color: c.emptyText }]}>{title}</Text>
      {subtitle ? <Text style={[styles.emptySubtitle, { color: c.emptySubtext }]}>{subtitle}</Text> : null}
    </View>
  );

  const renderSearchTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPad} keyboardShouldPersistTaps="handled">
      <View style={[styles.searchBox, { backgroundColor: c.searchBackground, borderColor: c.searchBorder }]}>
        <SearchIcon size={18} color={c.searchPlaceholder} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: c.searchText }]}
          placeholder={t('community.searchPlaceholder')}
          placeholderTextColor={c.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchLoading && <ActivityIndicator size="small" color={c.searchPlaceholder} />}
      </View>

      {searchQuery.length < 3 && !searchLoading ? (
        renderEmptyState(
          <UserPlusIcon size={48} color={c.emptyIcon} strokeWidth={1.5} />,
          t('community.searchHint'),
          t('community.searchHintSub'),
        )
      ) : searchResults.length === 0 && !searchLoading ? (
        renderEmptyState(
          <UserIcon size={48} color={c.emptyIcon} strokeWidth={1.5} />,
          t('community.noResults'),
        )
      ) : (
        <View style={styles.list}>
          {searchResults.map(u => {
            const alreadyFollowing = (following ?? []).some(f => f.id === u.id);
            const sent = pendingSent.has(u.id) || u.friendshipStatus === 'sent';
            return (
              <UserCard
                key={u.id}
                user={u}
                c={c}
                rightSlot={
                  alreadyFollowing ? (
                    <View style={[styles.followingBadge, { backgroundColor: c.followingBackground }]}>
                      <Text style={[styles.followingBadgeText, { color: c.followingText }]}>
                        {t('community.following')}
                      </Text>
                    </View>
                  ) : sent ? (
                    <Text style={[styles.sentText, { color: c.timestampText }]}>
                      {t('community.requestSent')}
                    </Text>
                  ) : (
                    <Touchable
                      style={[styles.followBtn, { backgroundColor: c.followBackground }]}
                      onPress={() => handleFollow(u)}
                      borderRadius={20}
                    >
                      <UserPlusIcon size={14} color={c.followText} strokeWidth={2.5} />
                      <Text style={[styles.followBtnText, { color: c.followText }]}>
                        {t('community.follow')}
                      </Text>
                    </Touchable>
                  )
                }
              />
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  const renderFollowingTab = () => (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabContentPad} keyboardShouldPersistTaps="handled">
      <View style={[styles.searchBox, { backgroundColor: c.searchBackground, borderColor: c.searchBorder }]}>
        <SearchIcon size={18} color={c.searchPlaceholder} strokeWidth={2} />
        <TextInput
          style={[styles.searchInput, { color: c.searchText }]}
          placeholder={t('community.filterPlaceholder')}
          placeholderTextColor={c.searchPlaceholder}
          value={filterQuery}
          onChangeText={setFilterQuery}
        />
      </View>

      {followingLoading ? (
        <ActivityIndicator style={styles.loader} color={c.tabActiveIndicator} />
      ) : filteredFollowing.length === 0 ? (
        renderEmptyState(
          <UsersIcon size={48} color={c.emptyIcon} strokeWidth={1.5} />,
          t('community.followingEmpty'),
          t('community.followingEmptySub'),
        )
      ) : (
        <View style={styles.list}>
          {filteredFollowing.map(u => (
            <UserCard
              key={u.id}
              user={u}
              c={c}
              rightSlot={
                <View style={styles.followingActions}>
                  <Touchable
                    style={[styles.iconBtn, { backgroundColor: c.followingBackground }]}
                    onPress={() => {
                      const conv = (conversations ?? []).find(cv => cv.otherUserId === u.id);
                      if (conv) { setMainTab('messages'); setActiveChat(conv); }
                      else { setMainTab('messages'); }
                    }}
                    borderRadius={20}
                    hitSlop={6}
                  >
                    <MessageIcon size={16} color={c.followingText} strokeWidth={2} />
                  </Touchable>
                  <Touchable
                    style={styles.iconBtn}
                    onPress={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                    borderRadius={20}
                    hitSlop={6}
                  >
                    <MoreVerticalIcon size={16} color={c.cardSubtitle} strokeWidth={2} />
                  </Touchable>
                  {openMenu === u.id && (
                    <View style={[styles.menuPopup, { backgroundColor: c.cardBackground, borderColor: c.cardBorder }]}>
                      <Touchable style={styles.menuItem} onPress={() => handleUnfollow(u)} borderRadius={8}>
                        <Text style={styles.menuItemDestructive}>{t('community.unfollow')}</Text>
                      </Touchable>
                    </View>
                  )}
                </View>
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderRequestsTab = () => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={styles.tabContentPad}
      refreshControl={<RefreshControl refreshing={requestsLoading} onRefresh={refetchRequests} />}
    >
      {requestsLoading && !requests ? (
        <ActivityIndicator style={styles.loader} color={c.tabActiveIndicator} />
      ) : !requests || requests.length === 0 ? (
        renderEmptyState(
          <CheckIcon size={48} color={c.emptyIcon} strokeWidth={1.5} />,
          t('community.requestsEmpty'),
        )
      ) : (
        <View style={styles.list}>
          {requests.map(req => (
            <RequestCard
              key={req.id}
              request={req}
              c={c}
              onAccept={() => handleAccept(req)}
              onReject={() => handleReject(req)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );

  const renderMessagesTab = () => {
    if (activeChat) {
      return (
        <KeyboardAvoidingView
          style={styles.chatContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          {messagesLoading ? (
            <ActivityIndicator style={styles.loader} color={c.tabActiveIndicator} />
          ) : (
            <FlatList
              ref={messagesListRef}
              data={messages}
              keyExtractor={m => m.id}
              contentContainerStyle={styles.messagesList}
              onContentSizeChange={() => messagesListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <MessageIcon size={40} color={c.emptyIcon} strokeWidth={1.5} />
                  <Text style={[styles.emptyTitle, { color: c.emptyText }]}>{t('community.noMessages')}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const isMe = item.senderId === currentUserId;
                return (
                  <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
                    <View style={[
                      styles.bubble,
                      { backgroundColor: isMe ? c.bubbleMe : c.bubbleThem },
                    ]}>
                      <Text style={[styles.bubbleText, { color: isMe ? c.bubbleMeText : c.bubbleThemText }]}>
                        {item.content}
                      </Text>
                    </View>
                    <Text style={[styles.bubbleTime, { color: c.timestampText }]}>
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                );
              }}
            />
          )}

          <View style={[
            styles.chatInputRow,
            { backgroundColor: c.chatInputBackground, borderTopColor: c.chatInputBorder, paddingBottom: insets.bottom > 0 ? insets.bottom : 12 },
          ]}>
            <TextInput
              style={[styles.chatInput, { backgroundColor: c.searchBackground, borderColor: c.chatInputBorder, color: c.chatInputText }]}
              placeholder={t('community.messagePlaceholder')}
              placeholderTextColor={c.chatInputPlaceholder}
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <Touchable
              style={[styles.sendBtn, { backgroundColor: c.sendButton }, (!chatInput.trim() || sendingMessage) && styles.sendBtnDisabled]}
              onPress={handleSend}
              borderRadius={22}
              disabled={!chatInput.trim() || sendingMessage}
            >
              {sendingMessage
                ? <ActivityIndicator size="small" color={c.sendButtonIcon} />
                : <SendIcon size={18} color={c.sendButtonIcon} strokeWidth={2} />}
            </Touchable>
          </View>
        </KeyboardAvoidingView>
      );
    }

    return (
      <ScrollView
        style={styles.tabContent}
        refreshControl={<RefreshControl refreshing={convsLoading} onRefresh={refetchConvs} />}
      >
        {convsLoading && !conversations ? (
          <ActivityIndicator style={styles.loader} color={c.tabActiveIndicator} />
        ) : !conversations || conversations.length === 0 ? (
          renderEmptyState(
            <MessageIcon size={48} color={c.emptyIcon} strokeWidth={1.5} />,
            t('community.noConversations'),
            t('community.noConversationsSub'),
          )
        ) : (
          conversations.map(conv => (
            <ConvRow key={conv.id} conv={conv} c={c} onPress={() => setActiveChat(conv)} />
          ))
        )}
      </ScrollView>
    );
  };

  // ─ Header ────────────────────────────────────────────────────────────────

  const headerTitle = activeChat
    ? activeChat.otherUserName
    : t(`community.tab${mainTab === 'connections' ? 'Connections' : 'Messages'}`);

  // ─ Layout ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.headerBackground, borderBottomColor: c.headerBorder }]}>
        {activeChat ? (
          <Touchable style={styles.backBtn} onPress={() => setActiveChat(null)} borderRadius={20} hitSlop={8}>
            <ChevronLeftIcon size={22} color={c.headerTitle} strokeWidth={2} />
          </Touchable>
        ) : null}
        <Text style={[styles.headerTitle, { color: c.headerTitle }]} numberOfLines={1}>
          {headerTitle}
        </Text>
      </View>

      {/* Main tabs — hidden when in chat thread */}
      {!activeChat && (
        <View style={[styles.mainTabBar, { backgroundColor: c.tabBackground, borderBottomColor: c.tabBorder }]}>
          {(['connections', 'messages'] as MainTab[]).map(tab => {
            const isActive = mainTab === tab;
            const label = t(`community.tab${tab === 'connections' ? 'Connections' : 'Messages'}`);
            return (
              <Touchable key={tab} style={styles.mainTabItem} onPress={() => setMainTab(tab)}>
                <Text style={[styles.mainTabLabel, { color: isActive ? c.tabActiveText : c.tabText }, isActive && styles.mainTabLabelActive]}>
                  {label}
                </Text>
                {isActive && <View style={[styles.mainTabIndicator, { backgroundColor: c.tabActiveIndicator }]} />}
              </Touchable>
            );
          })}
        </View>
      )}

      {/* Connections sub-tabs */}
      {mainTab === 'connections' && !activeChat && (
        <View style={[styles.segmentBar, { backgroundColor: c.segmentBackground }]}>
          {([
            { id: 'search' as ConnectionsTab, label: t('community.tabSearch') },
            { id: 'following' as ConnectionsTab, label: t('community.tabFollowing') },
            { id: 'requests' as ConnectionsTab, label: t('community.tabRequests') },
          ]).map(seg => {
            const isActive = connTab === seg.id;
            return (
              <Touchable
                key={seg.id}
                style={[styles.segmentItem, isActive && [styles.segmentItemActive, { backgroundColor: c.segmentActiveBackground }]]}
                onPress={() => setConnTab(seg.id)}
                borderRadius={8}
              >
                <Text style={[styles.segmentText, { color: isActive ? c.segmentActiveText : c.segmentText }]}>
                  {seg.label}
                  {seg.id === 'requests' && pendingRequestCount > 0 ? ` (${pendingRequestCount})` : ''}
                </Text>
              </Touchable>
            );
          })}
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {mainTab === 'connections' && !activeChat && connTab === 'search' && renderSearchTab()}
        {mainTab === 'connections' && !activeChat && connTab === 'following' && renderFollowingTab()}
        {mainTab === 'connections' && !activeChat && connTab === 'requests' && renderRequestsTab()}
        {mainTab === 'messages' && renderMessagesTab()}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  backBtn: { marginRight: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: 0.2, flex: 1 },
  // Main tabs
  mainTabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mainTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  mainTabLabel: { fontSize: 14, fontWeight: '500' },
  mainTabLabelActive: { fontWeight: '700' },
  mainTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
  },
  // Segment control
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 10,
    padding: 3,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentItemActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: { fontSize: 12, fontWeight: '600' },
  // Content
  content: { flex: 1 },
  tabContent: { flex: 1 },
  tabContentPad: { padding: 16, gap: 10 },
  loader: { marginTop: 40 },
  // Search
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  // List
  list: { gap: 8 },
  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 14, fontWeight: '700' },
  cardHandle: { fontSize: 12 },
  cardRight: { alignItems: 'flex-end' },
  // Follow buttons
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  followBtnText: { fontSize: 12, fontWeight: '700' },
  followingBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  followingBadgeText: { fontSize: 12, fontWeight: '600' },
  sentText: { fontSize: 11 },
  // Following tab actions
  followingActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuPopup: {
    position: 'absolute',
    top: 36,
    right: 0,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  menuItem: { paddingHorizontal: 16, paddingVertical: 12 },
  menuItemDestructive: { color: '#EF4444', fontSize: 14, fontWeight: '600' },
  // Request actions
  requestActions: { flexDirection: 'row', gap: 8 },
  requestBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Conversation rows
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  convAvatarWrap: { position: 'relative' },
  convAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
  },
  unreadDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  convBody: { flex: 1, gap: 3 },
  convTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convName: { fontSize: 14, fontWeight: '700', flex: 1, marginRight: 8 },
  convTime: { fontSize: 11 },
  convPreview: { fontSize: 13 },
  // Chat
  chatContainer: { flex: 1 },
  messagesList: { padding: 16, gap: 8 },
  bubbleRow: { maxWidth: '80%', gap: 2 },
  bubbleRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginHorizontal: 4 },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.45 },
  // Empty
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18 },
});

export default Community;
