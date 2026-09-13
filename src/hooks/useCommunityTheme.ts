import { CommunityTheme, getCommunityTheme } from '@features/community/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useCommunityTheme(): CommunityTheme {
  const palette = useActiveThemePalette();
  return getCommunityTheme(palette);
}

export default useCommunityTheme;
