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

export function fetchConversations(userId: string): Promise<Conversation[]> {
  return apiGet(`/chat/conversations?userId=${encodeURIComponent(userId)}`);
}

export function fetchMessages(userId: string): Promise<ChatMessage[]> {
  return apiGet(`/chat/conversation?userId=${encodeURIComponent(userId)}`);
}

export function sendMessage(conversationId: string, content: string): Promise<{ success: boolean }> {
  return apiPost('/chat/messages', { conversationId, content });
}
