import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';



// ─── Auth module theme tokens ─────────────────────────────────────────────────

export interface AuthTheme extends Theme {
  auth: {
    /** Screen background */
    background: string;
    /** Card / surface colour */
    surface: string;
    /** Primary headline */
    headlineText: string;
    /** Body / sub-copy text */
    bodyText: string;
    /** Accent text (e.g. "Gorgeous" italic) */
    accentText: string;
    /** Google sign-in button background */
    googleButtonBg: string;
    /** Google sign-in button text */
    googleButtonText: string;
    /** Google sign-in button border */
    googleButtonBorder: string;
    /** Error message text */
    errorText: string;
    /** Logo colour */
    logoColor: string;
    /** Separator line */
    separator: string;
  };
}

// ─── Light variant (Clear background, dark text/buttons) ─────────────────────
export const authLightTheme: AuthTheme = {
  ...lightTheme,
  auth: {
    background: commonColors.white,
    surface: commonColors.offWhite,
    headlineText: commonColors.navyDark,
    bodyText: 'rgba(15,30,53,0.70)',
    accentText: commonColors.gold,
    googleButtonBg: commonColors.navy,
    googleButtonText: commonColors.white,
    googleButtonBorder: commonColors.navyLight,
    errorText: commonColors.errorRed,
    logoColor: commonColors.navyDark,
    separator: 'rgba(0,0,0,0.10)',
  },
};

// ─── Dark variant (Navy background, clear text/buttons) ───────────────────────
export const authDarkTheme: AuthTheme = {
  ...darkTheme,
  auth: {
    background: commonColors.navy,
    surface: commonColors.navyMid,
    headlineText: commonColors.white,
    bodyText: 'rgba(255,255,255,0.75)',
    accentText: commonColors.goldLight,
    googleButtonBg: commonColors.white,
    googleButtonText: commonColors.navyDark,
    googleButtonBorder: commonColors.grayLight,
    errorText: '#FF6B6B',
    logoColor: commonColors.white,
    separator: 'rgba(255,255,255,0.15)',
  },
};
