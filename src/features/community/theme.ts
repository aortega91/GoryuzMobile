import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

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

export const communityLightTheme: CommunityTheme = {
  ...lightTheme,
  community: {
    background: commonColors.slateBackground,
    headerBackground: commonColors.white,
    headerBorder: commonColors.grayLight,
    headerTitle: commonColors.navyDark,
    tabBackground: commonColors.white,
    tabBorder: commonColors.grayLight,
    tabText: commonColors.gray,
    tabActiveText: commonColors.navyDark,
    tabActiveIndicator: commonColors.indigo,
    segmentBackground: '#F1F5F9',
    segmentActiveBackground: commonColors.white,
    segmentText: commonColors.gray,
    segmentActiveText: commonColors.navyDark,
    cardBackground: commonColors.white,
    cardBorder: commonColors.grayLight,
    cardTitle: commonColors.navyDark,
    cardSubtitle: commonColors.grayDark,
    searchBackground: commonColors.slateBackground,
    searchBorder: commonColors.grayLight,
    searchText: commonColors.navyDark,
    searchPlaceholder: commonColors.gray,
    followBackground: commonColors.indigo,
    followText: commonColors.white,
    followingBackground: commonColors.indigoSoft,
    followingText: commonColors.indigo,
    acceptBackground: commonColors.successGreen,
    acceptText: commonColors.white,
    rejectBackground: commonColors.white,
    rejectBorder: commonColors.grayLight,
    rejectText: commonColors.grayDark,
    badgeBackground: commonColors.errorRed,
    badgeText: commonColors.white,
    bubbleMe: commonColors.indigo,
    bubbleMeText: commonColors.white,
    bubbleThem: commonColors.white,
    bubbleThemText: commonColors.navyDark,
    chatInputBackground: commonColors.white,
    chatInputBorder: commonColors.grayLight,
    chatInputText: commonColors.navyDark,
    chatInputPlaceholder: commonColors.gray,
    sendButton: commonColors.indigo,
    sendButtonIcon: commonColors.white,
    timestampText: commonColors.gray,
    emptyIcon: commonColors.grayLight,
    emptyText: '#6B7280',
    emptySubtext: commonColors.gray,
    avatarBorder: commonColors.grayLight,
    unreadDot: commonColors.indigo,
  },
};

export const communityDarkTheme: CommunityTheme = {
  ...darkTheme,
  community: {
    background: commonColors.darkSurface,
    headerBackground: commonColors.darkCard,
    headerBorder: commonColors.darkBorder,
    headerTitle: commonColors.white,
    tabBackground: commonColors.darkCard,
    tabBorder: commonColors.darkBorder,
    tabText: commonColors.gray,
    tabActiveText: commonColors.white,
    tabActiveIndicator: '#818CF8',
    segmentBackground: '#1A2440',
    segmentActiveBackground: commonColors.darkBorder,
    segmentText: commonColors.gray,
    segmentActiveText: commonColors.white,
    cardBackground: commonColors.darkCard,
    cardBorder: commonColors.darkBorder,
    cardTitle: commonColors.white,
    cardSubtitle: commonColors.gray,
    searchBackground: '#1A2440',
    searchBorder: commonColors.darkBorder,
    searchText: commonColors.offWhite,
    searchPlaceholder: commonColors.grayDark,
    followBackground: '#818CF8',
    followText: commonColors.white,
    followingBackground: 'rgba(129,140,248,0.15)',
    followingText: '#818CF8',
    acceptBackground: commonColors.successGreen,
    acceptText: commonColors.white,
    rejectBackground: commonColors.darkCard,
    rejectBorder: commonColors.darkBorder,
    rejectText: commonColors.gray,
    badgeBackground: commonColors.errorRed,
    badgeText: commonColors.white,
    bubbleMe: '#818CF8',
    bubbleMeText: commonColors.white,
    bubbleThem: commonColors.darkCard,
    bubbleThemText: commonColors.offWhite,
    chatInputBackground: commonColors.darkCard,
    chatInputBorder: commonColors.darkBorder,
    chatInputText: commonColors.offWhite,
    chatInputPlaceholder: commonColors.grayDark,
    sendButton: '#818CF8',
    sendButtonIcon: commonColors.white,
    timestampText: commonColors.grayDark,
    emptyIcon: commonColors.darkBorder,
    emptyText: commonColors.gray,
    emptySubtext: commonColors.grayDark,
    avatarBorder: commonColors.darkBorder,
    unreadDot: '#818CF8',
  },
};
