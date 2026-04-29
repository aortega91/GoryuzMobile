import { useColorScheme } from 'react-native';
import {
  CollectionTheme,
  collectionLightTheme,
  collectionDarkTheme,
} from '@features/collection/theme';

function useCollectionTheme(): CollectionTheme {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? collectionDarkTheme : collectionLightTheme;
}

export default useCollectionTheme;
