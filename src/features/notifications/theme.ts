import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

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

function buildNotificationsLight(palette: BrandPalette): NotificationsTheme {
  const accent600 = palette.accent[600];
  const accent100 = palette.accent[100];

  return {
    ...getCommonTheme(palette),
    notifications: {
      background: commonColors.slateBackground,
      headerBorder: commonColors.grayLight,
      headerTitle: palette.primary,
      markAllText: accent600,
      itemBackground: commonColors.white,
      itemUnreadBackground: accent100,
      itemBorder: commonColors.grayLight,
      unreadDot: accent600,
      text: '#1F2937',
      timestamp: commonColors.grayDark,
      deleteIcon: commonColors.gray,
      emptyIcon: commonColors.grayLight,
      emptyText: '#6B7280',
      emptySubtext: commonColors.gray,
    },
  };
}

function buildNotificationsDark(palette: BrandPalette): NotificationsTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    notifications: {
      background: commonColors.darkSurface,
      headerBorder: commonColors.darkBorder,
      headerTitle: commonColors.white,
      markAllText: accent400,
      itemBackground: commonColors.darkCard,
      // Same role as the light theme's indigoSoft unread highlight — a pale
      // accent tint, translated to a translucent overlay for dark surfaces.
      itemUnreadBackground: withAlpha(accentDefault, 0.18),
      itemBorder: commonColors.darkBorder,
      unreadDot: accent400,
      text: commonColors.offWhite,
      timestamp: commonColors.gray,
      deleteIcon: commonColors.grayDark,
      emptyIcon: commonColors.darkBorder,
      emptyText: commonColors.gray,
      emptySubtext: commonColors.grayDark,
    },
  };
}

export function getNotificationsTheme(palette: BrandPalette): NotificationsTheme {
  return palette.dark ? buildNotificationsDark(palette) : buildNotificationsLight(palette);
}
