import {
  stylesLightTheme,
  stylesDarkTheme,
  StylesThemeInstance,
} from '@features/styles/theme';
import useAppColorScheme from './useAppColorScheme';

function useStylesTheme(): StylesThemeInstance {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? stylesDarkTheme : stylesLightTheme;
}

export default useStylesTheme;
