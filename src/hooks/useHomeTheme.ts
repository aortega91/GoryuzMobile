import { HomeTheme, getHomeTheme } from '@features/home/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useHomeTheme(): HomeTheme {
  const palette = useActiveThemePalette();
  return getHomeTheme(palette);
}

export default useHomeTheme;
