import {
  SubscriptionTheme,
  subscriptionLightTheme,
  subscriptionDarkTheme,
} from '@features/subscription/theme';
import useAppColorScheme from './useAppColorScheme';

function useSubscriptionTheme(): SubscriptionTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? subscriptionDarkTheme : subscriptionLightTheme;
}

export default useSubscriptionTheme;