import {
  DiscoverThemeInstance,
  getDiscoverTheme,
} from '@features/discover/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useDiscoverTheme(): DiscoverThemeInstance {
  const palette = useActiveThemePalette();
  return getDiscoverTheme(palette);
}

export default useDiscoverTheme;
