import {
  scheduleLightTheme,
  scheduleDarkTheme,
  ScheduleThemeInstance,
} from '@features/schedule/theme';
import useAppColorScheme from './useAppColorScheme';

function useScheduleTheme(): ScheduleThemeInstance {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? scheduleDarkTheme : scheduleLightTheme;
}

export default useScheduleTheme;
