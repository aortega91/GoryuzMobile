import { CollectionTheme, getCollectionTheme } from '@features/collection/theme';
import useActiveThemePalette from './useActiveThemePalette';

function useCollectionTheme(): CollectionTheme {
  const palette = useActiveThemePalette();
  return getCollectionTheme(palette);
}

export default useCollectionTheme;
