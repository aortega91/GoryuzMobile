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
  lastMessage: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
