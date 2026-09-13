import { ProfileTheme, getProfileTheme } from '@features/profile/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useProfileTheme(): ProfileTheme {
  const palette = useActiveThemePalette();
  return getProfileTheme(palette);
}

export default useProfileTheme;
