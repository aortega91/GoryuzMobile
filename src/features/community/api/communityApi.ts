import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { CommunityUser, FriendRequest, Conversation, ChatMessage } from '../types';

export function fetchFollowing(): Promise<CommunityUser[]> {
  return apiGet('/friends');
}

export function fetchRequests(): Promise<FriendRequest[]> {
  return apiGet('/friends/requests');
}

export function fetchSentRequests(): Promise<{ id: string; name: string; handle?: string; avatarUrl: string }[]> {
  return apiGet('/friends/sent-requests');
}

export function searchUsers(query: string): Promise<CommunityUser[]> {
  return apiGet(`/friends/search?q=${encodeURIComponent(query)}`);
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
