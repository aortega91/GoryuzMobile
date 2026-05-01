import { AuthTheme, authLightTheme, authDarkTheme } from '@features/auth/theme';
import useAppColorScheme from './useAppColorScheme';

function useTheme(): AuthTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? authDarkTheme : authLightTheme;
}

export default useTheme;
