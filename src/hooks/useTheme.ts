import { useColorScheme } from 'react-native';
import { AuthTheme, authLightTheme, authDarkTheme } from '@features/auth/theme';

/**
 * useTheme
 *
 * Returns the auth-module theme that matches the device's current colour scheme.
 * As new feature modules are added, extend this hook (or create sibling hooks)
 * to return their theme objects.
 *
 * Usage:
 *   const theme = useTheme();
 *   <View style={{ backgroundColor: theme.auth.background }} />
 */
function useTheme(): AuthTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? authDarkTheme : authLightTheme;
}

export default useTheme;
