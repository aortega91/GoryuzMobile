import { ScheduleTheme, getScheduleTheme } from '@features/schedule/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useScheduleTheme(): ScheduleTheme {
  const palette = useActiveThemePalette();
  return getScheduleTheme(palette);
}

export default useScheduleTheme;
