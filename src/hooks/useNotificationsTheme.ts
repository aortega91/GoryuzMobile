import { NotificationsTheme, getNotificationsTheme } from '@features/notifications/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useNotificationsTheme(): NotificationsTheme {
  const palette = useActiveThemePalette();
  return getNotificationsTheme(palette);
}

export default useNotificationsTheme;
