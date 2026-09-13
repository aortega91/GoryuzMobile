import { SecondLifeTheme, getSecondLifeTheme } from '@features/secondLife/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useSecondLifeTheme(): SecondLifeTheme {
  const palette = useActiveThemePalette();
  return getSecondLifeTheme(palette);
}

export default useSecondLifeTheme;
