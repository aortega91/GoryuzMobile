import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface CommunityTheme extends Theme {
  community: {
    background: string;
    headerBackground: string;
    headerBorder: string;
    headerTitle: string;
    // Main tabs
    tabBackground: string;
    tabBorder: string;
    tabText: string;
    tabActiveText: string;
    tabActiveIndicator: string;
    // Segment control (sub-tabs)
    segmentBackground: string;
    segmentActiveBackground: string;
    segmentText: string;
    segmentActiveText: string;
    // Bottom submodules bar (search/following/requests — mobile only)
    submodulesBarBackground: string;
    submodulesBarBorder: string;
    submodulesBarIconInactive: string;
    submodulesBarTextInactive: string;
    submodulesBarIconActive: string;
    submodulesBarTextActive: string;
    // Cards
    cardBackground: string;
    cardBorder: string;
    cardTitle: string;
    cardSubtitle: string;
    // Search input
    searchBackground: string;
    searchBorder: string;
    searchText: string;
    searchPlaceholder: string;
    // Action buttons
    followBackground: string;
    followText: string;
    followingBackground: string;
    followingText: string;
    acceptBackground: string;
    acceptText: string;
    rejectBackground: string;
    rejectBorder: string;
    rejectText: string;
    // Request badge
    badgeBackground: string;
    badgeText: string;
    // Chat bubbles
    bubbleMe: string;
    bubbleMeText: string;
    bubbleThem: string;
    bubbleThemText: string;
    // Chat input
    chatInputBackground: string;
    chatInputBorder: string;
    chatInputText: string;
    chatInputPlaceholder: string;
    sendButton: string;
    sendButtonIcon: string;
    // Timestamp
    timestampText: string;
    // Empty states
    emptyIcon: string;
    emptyText: string;
    emptySubtext: string;
    // Avatar
    avatarBorder: string;
    unreadDot: string;
  };
}

function buildCommunityLight(palette: BrandPalette): CommunityTheme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    community: {
      background: commonColors.slateBackground,
      headerBackground: commonColors.white,
      headerBorder: commonColors.grayLight,
      headerTitle: palette.primary,
      tabBackground: commonColors.white,
      tabBorder: commonColors.grayLight,
      tabText: commonColors.gray,
      tabActiveText: palette.primary,
      tabActiveIndicator: accent600,
      segmentBackground: '#F1F5F9',
      segmentActiveBackground: commonColors.white,
      segmentText: commonColors.gray,
      segmentActiveText: palette.primary,
      submodulesBarBackground: withAlpha(commonColors.white, 0.95),
      submodulesBarBorder: commonColors.grayLight,
      submodulesBarIconInactive: commonColors.gray,
      submodulesBarTextInactive: commonColors.gray,
      submodulesBarIconActive: accent600,
      submodulesBarTextActive: accent600,
      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,
      cardTitle: palette.primary,
      cardSubtitle: commonColors.grayDark,
      searchBackground: commonColors.slateBackground,
      searchBorder: commonColors.grayLight,
      searchText: palette.primary,
      searchPlaceholder: commonColors.gray,
      followBackground: accent600,
      followText: commonColors.white,
      followingBackground: accent100,
      followingText: accent600,
      acceptBackground: commonColors.successGreen,
      acceptText: commonColors.white,
      rejectBackground: commonColors.white,
      rejectBorder: commonColors.grayLight,
      rejectText: commonColors.grayDark,
      badgeBackground: commonColors.errorRed,
      badgeText: commonColors.white,
      bubbleMe: accent600,
      bubbleMeText: commonColors.white,
      bubbleThem: commonColors.white,
      bubbleThemText: palette.primary,
      chatInputBackground: commonColors.white,
      chatInputBorder: commonColors.grayLight,
      chatInputText: palette.primary,
      chatInputPlaceholder: commonColors.gray,
      sendButton: accent600,
      sendButtonIcon: commonColors.white,
      timestampText: commonColors.gray,
      emptyIcon: commonColors.grayLight,
      emptyText: '#6B7280',
      emptySubtext: commonColors.gray,
      avatarBorder: commonColors.grayLight,
      unreadDot: accent600,
    },
  };
}

function buildCommunityDark(palette: BrandPalette): CommunityTheme {
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    community: {
      background: commonColors.darkSurface,
      headerBackground: commonColors.darkCard,
      headerBorder: commonColors.darkBorder,
      headerTitle: commonColors.white,
      tabBackground: commonColors.darkCard,
      tabBorder: commonColors.darkBorder,
      tabText: commonColors.gray,
      tabActiveText: commonColors.white,
      tabActiveIndicator: accent400,
      segmentBackground: '#1A2440',
      segmentActiveBackground: commonColors.darkBorder,
      segmentText: commonColors.gray,
      segmentActiveText: commonColors.white,
      submodulesBarBackground: withAlpha(commonColors.darkCard, 0.95),
      submodulesBarBorder: commonColors.darkBorder,
      submodulesBarIconInactive: commonColors.gray,
      submodulesBarTextInactive: commonColors.gray,
      submodulesBarIconActive: accent400,
      submodulesBarTextActive: accent400,
      cardBackground: commonColors.darkCard,
      cardBorder: commonColors.darkBorder,
      cardTitle: commonColors.white,
      cardSubtitle: commonColors.gray,
      searchBackground: '#1A2440',
      searchBorder: commonColors.darkBorder,
      searchText: commonColors.offWhite,
      searchPlaceholder: commonColors.grayDark,
      followBackground: accent400,
      followText: commonColors.white,
      followingBackground: withAlpha(accent400, 0.15),
      followingText: accent400,
      acceptBackground: commonColors.successGreen,
      acceptText: commonColors.white,
      rejectBackground: commonColors.darkCard,
      rejectBorder: commonColors.darkBorder,
      rejectText: commonColors.gray,
      badgeBackground: commonColors.errorRed,
      badgeText: commonColors.white,
      bubbleMe: accent400,
      bubbleMeText: commonColors.white,
      bubbleThem: commonColors.darkCard,
      bubbleThemText: commonColors.offWhite,
      chatInputBackground: commonColors.darkCard,
      chatInputBorder: commonColors.darkBorder,
      chatInputText: commonColors.offWhite,
      chatInputPlaceholder: commonColors.grayDark,
      sendButton: accent400,
      sendButtonIcon: commonColors.white,
      timestampText: commonColors.grayDark,
      emptyIcon: commonColors.darkBorder,
      emptyText: commonColors.gray,
      emptySubtext: commonColors.grayDark,
      avatarBorder: commonColors.darkBorder,
      unreadDot: accent400,
    },
  };
}

export function getCommunityTheme(palette: BrandPalette): CommunityTheme {
  return palette.dark ? buildCommunityDark(palette) : buildCommunityLight(palette);
}
