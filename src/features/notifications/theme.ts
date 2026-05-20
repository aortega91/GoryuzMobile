import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

export interface NotificationsTheme extends Theme {
  notifications: {
    background: string;
    headerBorder: string;
    headerTitle: string;
    markAllText: string;
    itemBackground: string;
    itemUnreadBackground: string;
    itemBorder: string;
    unreadDot: string;
    text: string;
    timestamp: string;
    deleteIcon: string;
    emptyIcon: string;
    emptyText: string;
    emptySubtext: string;
  };
}

export const notificationsLightTheme: NotificationsTheme = {
  ...lightTheme,
  notifications: {
    background: commonColors.slateBackground,
    headerBorder: commonColors.grayLight,
    headerTitle: commonColors.navyDark,
    markAllText: commonColors.indigo,
    itemBackground: commonColors.white,
    itemUnreadBackground: '#EEF2FF',
    itemBorder: commonColors.grayLight,
    unreadDot: commonColors.indigo,
    text: '#1F2937',
    timestamp: commonColors.grayDark,
    deleteIcon: commonColors.gray,
    emptyIcon: commonColors.grayLight,
    emptyText: '#6B7280',
    emptySubtext: commonColors.gray,
  },
};

export const notificationsDarkTheme: NotificationsTheme = {
  ...darkTheme,
  notifications: {
    background: commonColors.navyDark,
    headerBorder: commonColors.darkBorder,
    headerTitle: commonColors.white,
    markAllText: '#818CF8',
    itemBackground: commonColors.darkCard,
    itemUnreadBackground: '#1E2A4A',
    itemBorder: commonColors.darkBorder,
    unreadDot: '#818CF8',
    text: commonColors.offWhite,
    timestamp: commonColors.gray,
    deleteIcon: commonColors.grayDark,
    emptyIcon: commonColors.darkBorder,
    emptyText: commonColors.gray,
    emptySubtext: commonColors.grayDark,
  },
};
