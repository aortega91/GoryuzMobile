export interface CommunityUser {
  id: string;
  name: string;
  handle?: string;
  avatarUrl: string;
  friendshipStatus?: 'following' | 'sent' | 'received' | 'none';
}

export interface FriendRequest {
  id: string;
  name: string;
  handle?: string;
  avatarUrl: string;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  unreadCount: number;
  /** Preview text of the last message (empty string when none). */
  lastMessage: string;
  /** ISO timestamp of the last message, falling back to the conversation creation time. */
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  /** ISO timestamp. */
  createdAt: string;
  /** True while an optimistic message is awaiting its server echo. */
  pending?: boolean;
}
