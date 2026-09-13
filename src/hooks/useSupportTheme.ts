import { SupportTheme, getSupportTheme } from '@features/support/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useSupportTheme(): SupportTheme {
  const palette = useActiveThemePalette();
  return getSupportTheme(palette);
}

export default useSupportTheme;
