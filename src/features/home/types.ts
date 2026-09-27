export type ActiveModule =
  | 'home'
  /** The design's LookBook social feed — mock data only, hidden from the drawer. */
  | 'lookbook'
  | 'closet'
  | 'styles'
  | 'schedule'
  | 'profile'
  | 'discover'
  | 'second_life'
  | 'community'
  | 'notifications'
  | 'subscription'
  | 'support';

/**
 * Drawer modules that carry the "not visited yet" dot — zena's
 * `TRACKED_MODULES`. Messages, notifications and the gem counter are left out
 * on purpose: they already signal on their own and are not discovery.
 */
export const TRACKED_MODULES: ActiveModule[] = [
  'home',
  'closet',
  'styles',
  'schedule',
  'second_life',
  'community',
];

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
  /** Colour palette tags used by the LookBook collection filter */
  colors?: string[];
  /** Mock AI style analysis result for "Descubrir Estilo" */
  aiPrompt?: string;
  /** Mock outfit piece labels for "Análisis Market IA" */
  clothingItems?: string[];
  accessories?: string[];
}