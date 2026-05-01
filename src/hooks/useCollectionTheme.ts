import {
  CollectionTheme,
  collectionLightTheme,
  collectionDarkTheme,
} from '@features/collection/theme';
import useAppColorScheme from './useAppColorScheme';

function useCollectionTheme(): CollectionTheme {
  const colorScheme = useAppColorScheme();
  return colorScheme === 'dark' ? collectionDarkTheme : collectionLightTheme;
}

export default useCollectionTheme;
