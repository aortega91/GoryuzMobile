import { AuthTheme, getAuthTheme } from '@features/auth/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useTheme(): AuthTheme {
  const palette = useActiveThemePalette();
  return getAuthTheme(palette);
}

export default useTheme;
