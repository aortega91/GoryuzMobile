import { useColorScheme } from 'react-native';
import { HomeTheme, homeLightTheme, homeDarkTheme } from '@features/home/theme';

/**
 * useHomeTheme
 *
 * Returns the home-module theme that matches the device's current colour scheme.
 */
function useHomeTheme(): HomeTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? homeDarkTheme : homeLightTheme;
}

export default useHomeTheme;
