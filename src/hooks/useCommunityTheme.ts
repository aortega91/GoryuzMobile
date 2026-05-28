import { communityLightTheme, communityDarkTheme, CommunityTheme } from '@features/community/theme';
import useAppColorScheme from './useAppColorScheme';

function useCommunityTheme(): CommunityTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? communityDarkTheme : communityLightTheme;
}

export default useCommunityTheme;
