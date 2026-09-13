import { Theme, getCommonTheme } from '@theme/index';
import useActiveThemePalette from './useActiveThemePalette';

/**
 * The brand-agnostic slice of the theme (`Theme.common` — toasts, the shared
 * onboarding dialog styling, etc.) for components that aren't scoped to one
 * feature module. Palette-driven like every feature theme: the active
 * theme's accent/primary now reach these shared dialogs too.
 */
function useCommonTheme(): Theme {
  const palette = useActiveThemePalette();
  return getCommonTheme(palette);
}

export default useCommonTheme;
