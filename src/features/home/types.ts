export interface FeedUser {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
}

export interface FeedPost {
  id: string;
  user: FeedUser;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  saves: number;
  timestamp: string;
  isLiked: boolean;
  isSaved: boolean;
  isOwn: boolean;
  categories?: string[];
}