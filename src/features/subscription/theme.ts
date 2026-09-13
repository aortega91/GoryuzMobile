import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette } from '@theme/palettes';

export interface SubscriptionTheme extends Theme {
  subscription: {
    background: string;
    loaderColor: string;
    errorText: string;
    retryButtonBg: string;
    retryButtonText: string;
  };
}

function buildSubscriptionLight(palette: BrandPalette): SubscriptionTheme {
  const accent600 = palette.accent[600];

  return {
    ...getCommonTheme(palette),
    subscription: {
      background: commonColors.slateBackground,
      loaderColor: accent600,
      errorText: '#6B7280',
      retryButtonBg: accent600,
      retryButtonText: commonColors.white,
    },
  };
}

function buildSubscriptionDark(palette: BrandPalette): SubscriptionTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    subscription: {
      background: commonColors.darkSurface,
      loaderColor: accent400,
      errorText: 'rgba(255,255,255,0.60)',
      retryButtonBg: accentDefault,
      retryButtonText: commonColors.white,
    },
  };
}

export function getSubscriptionTheme(palette: BrandPalette): SubscriptionTheme {
  return palette.dark ? buildSubscriptionDark(palette) : buildSubscriptionLight(palette);
}
