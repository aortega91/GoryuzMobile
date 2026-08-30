import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

export interface SubscriptionTheme extends Theme {
  subscription: {
    background: string;
    loaderColor: string;
    errorText: string;
    retryButtonBg: string;
    retryButtonText: string;
  };
}

export const subscriptionLightTheme: SubscriptionTheme = {
  ...lightTheme,
  subscription: {
    background: commonColors.slateBackground,
    loaderColor: commonColors.indigo,
    errorText: '#6B7280',
    retryButtonBg: commonColors.indigo,
    retryButtonText: commonColors.white,
  },
};

export const subscriptionDarkTheme: SubscriptionTheme = {
  ...darkTheme,
  subscription: {
    background: commonColors.darkSurface,
    loaderColor: commonColors.copperLight,
    errorText: 'rgba(255,255,255,0.60)',
    retryButtonBg: commonColors.copper,
    retryButtonText: commonColors.navyDark,
  },
};