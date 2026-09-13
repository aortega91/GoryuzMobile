import { SubscriptionTheme, getSubscriptionTheme } from '@features/subscription/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useSubscriptionTheme(): SubscriptionTheme {
  const palette = useActiveThemePalette();
  return getSubscriptionTheme(palette);
}

export default useSubscriptionTheme;
