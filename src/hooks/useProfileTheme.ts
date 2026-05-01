import {
  ProfileTheme,
  profileLightTheme,
  profileDarkTheme,
} from '@features/profile/theme';
import useAppColorScheme from './useAppColorScheme';

function useProfileTheme(): ProfileTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? profileDarkTheme : profileLightTheme;
}

export default useProfileTheme;
