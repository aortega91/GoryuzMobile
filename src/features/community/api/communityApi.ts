import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { CommunityUser, FriendRequest, Conversation, ChatMessage } from '../types';

function normalizeFriendshipStatus(
  raw: string | null | undefined,
): CommunityUser['friendshipStatus'] {
  if (raw === 'accepted') return 'following';
  if (raw === 'pending') return 'sent';
  return 'none';
}

export async function fetchFollowing(): Promise<CommunityUser[]> {
  const results: any[] = await apiGet('/friends');
  return results.map(u => ({
    id: u.id,
    name: u.name,
    handle: u.handle ?? u.nickname,
    avatarUrl: u.avatarUrl,
    friendshipStatus: 'following' as const,
  }));
}

export async function fetchRequests(): Promise<FriendRequest[]> {
  const results: any[] = await apiGet('/friends/requests');
  return results.map(r => ({
    id: r.id,
    name: r.name,
    handle: r.handle ?? r.nickname,
    avatarUrl: r.avatarUrl,
  }));
}

export function fetchSentRequests(): Promise<{ id: string; name: string; handle?: string; avatarUrl: string }[]> {
  return apiGet('/friends/sent-requests');
}

export async function searchUsers(query: string): Promise<CommunityUser[]> {
  const results: any[] = await apiGet(`/friends/search?q=${encodeURIComponent(query)}`);
  return results.map(u => ({
    id: u.id,
    name: u.name,
    handle: u.handle ?? u.nickname,
    avatarUrl: u.avatarUrl,
    friendshipStatus: normalizeFriendshipStatus(u.friendshipStatus),
  }));
}

export function sendRequest(handle: string): Promise<{ success: boolean }> {
  return apiPost('/friends/requests', { nickname: handle });
}

export function respondToRequest(id: string, action: 'accept' | 'reject'): Promise<{ success: boolean }> {
  return apiPut(`/friends/requests/${id}`, { action });
}

export function cancelRequest(id: string): Promise<{ success: boolean }> {
  return apiDelete(`/friends/requests/${id}`);
}

export function unfollowUser(id: string): Promise<{ success: boolean }> {
  return apiDelete(`/friends/${id}`);
}

/**
 * Normalises a server timestamp (ISO string, or unix seconds/millis) to an ISO string.
 * The chat backend stores `created_at` as unix seconds; the Durable Object echoes them
 * as raw seconds while the REST layer serialises Drizzle timestamps as ISO strings.
 */
export function toIsoTimestamp(value: string | number | null | undefined): string {
  if (value == null) return new Date().toISOString();
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  const asNumber = Number(value);
  if (!Number.isNaN(asNumber) && /^\d+$/.test(value)) {
    return toIsoTimestamp(asNumber);
  }
  return value;
}

export async function fetchConversations(userId: string): Promise<Conversation[]> {
  const results: any[] = await apiGet(
    `/chat/conversations?userId=${encodeURIComponent(userId)}`,
  );
  return results
    .map(conv => {
      const last = conv.lastMessage ?? null;
      const lastMessageAt = toIsoTimestamp(last?.createdAt ?? conv.createdAt);
      return {
        id: conv.id,
        otherUserId: conv.otherUserId,
        otherUserName: conv.otherUserName ?? conv.otherUserId,
        otherUserAvatar: conv.otherUserAvatar,
        unreadCount: conv.unreadCount ?? 0,
        lastMessage: last?.content ?? '',
        lastMessageAt,
        createdAt: toIsoTimestamp(conv.createdAt),
      } as Conversation;
    })
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

/** Returns the existing conversation id between two users, creating one if needed. */
export async function getOrCreateConversation(
  user1Id: string,
  user2Id: string,
): Promise<string> {
  const res: any = await apiPost('/chat/conversation', { user1Id, user2Id });
  return res.id;
}

/**
 * Loads the message history for a conversation via REST (`GET /chat/messages`).
 * This reads the same `messages` table the app already serves and is independent of the
 * realtime chat worker — so history loads even when the WebSocket is unavailable. The
 * socket then takes over for live messages.
 */
export async function fetchMessages(conversationId: string): Promise<ChatMessage[]> {
  const rows: any[] = await apiGet(
    `/chat/messages?conversationId=${encodeURIComponent(conversationId)}`,
  );
  return rows
    .map(r => ({
      id: String(r.id),
      senderId: String(r.senderId ?? r.sender_id),
      content: String(r.content),
      isRead: r.isRead === true || r.isRead === 1 || r.is_read === 1 || r.is_read === true,
      createdAt: toIsoTimestamp(r.createdAt ?? r.created_at),
    }) as ChatMessage)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Marks every message in a conversation that was NOT sent by the current user as read. */
export function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<{ success: boolean }> {
  return apiPut('/chat/read', { conversationId, userId });
}
