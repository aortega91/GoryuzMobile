import { HomeTheme, homeLightTheme, homeDarkTheme } from '@features/home/theme';
import useAppColorScheme from './useAppColorScheme';

function useHomeTheme(): HomeTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? homeDarkTheme : homeLightTheme;
}

export default useHomeTheme;
