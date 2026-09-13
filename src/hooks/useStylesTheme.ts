import { StylesTheme, getStylesTheme } from '@features/styles/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useStylesTheme(): StylesTheme {
  const palette = useActiveThemePalette();
  return getStylesTheme(palette);
}

export default useStylesTheme;
