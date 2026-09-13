import { useSelector } from 'react-redux';
import { RootState } from '@utilities/store';
import { BrandPalette, getBrandPalette } from '@theme/palettes';

/**
 * The user's chosen brand theme (natural/boutique/moderno/elegancia). Unlike
 * the old light/dark/system preference, this is never derived from the
 * device colour scheme — it matches the zena reference, where theme choice is
 * an explicit pick with no system link.
 */
function useActiveThemePalette(): BrandPalette {
  const themeId = useSelector((state: RootState) => state.appTheme.themeId);
  return getBrandPalette(themeId);
}

export default useActiveThemePalette;
