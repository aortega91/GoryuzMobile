import { notificationsLightTheme, notificationsDarkTheme, NotificationsTheme } from '@features/notifications/theme';
import useAppColorScheme from './useAppColorScheme';

function useNotificationsTheme(): NotificationsTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? notificationsDarkTheme : notificationsLightTheme;
}

export default useNotificationsTheme;
