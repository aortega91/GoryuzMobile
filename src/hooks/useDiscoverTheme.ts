import {
  discoverLightTheme,
  discoverDarkTheme,
  DiscoverThemeInstance,
} from '@features/discover/theme';
import useAppColorScheme from './useAppColorScheme';

function useDiscoverTheme(): DiscoverThemeInstance {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? discoverDarkTheme : discoverLightTheme;
}

export default useDiscoverTheme;
