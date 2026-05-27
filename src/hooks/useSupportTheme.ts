import {
  SupportTheme,
  supportLightTheme,
  supportDarkTheme,
} from '@features/support/theme';
import useAppColorScheme from './useAppColorScheme';

function useSupportTheme(): SupportTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? supportDarkTheme : supportLightTheme;
}

export default useSupportTheme;
