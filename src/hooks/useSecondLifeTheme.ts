import {
  SecondLifeThemeInstance,
  secondLifeLightTheme,
  secondLifeDarkTheme,
} from '@features/secondLife/theme';
import useAppColorScheme from './useAppColorScheme';

function useSecondLifeTheme(): SecondLifeThemeInstance {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? secondLifeDarkTheme : secondLifeLightTheme;
}

export default useSecondLifeTheme;
