import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface SupportTheme extends Theme {
  support: {
    background: string;
    headerBackground: string;
    headerTitle: string;
    headerBorder: string;
    tabBarBackground: string;
    tabText: string;
    tabActiveText: string;
    tabActiveBorder: string;
    cardBackground: string;
    cardBorder: string;
    sectionTitle: string;
    fieldLabel: string;
    inputBackground: string;
    inputBorder: string;
    inputText: string;
    inputPlaceholder: string;
    submitButtonBg: string;
    submitButtonText: string;
    attachButtonBg: string;
    attachButtonBorder: string;
    attachButtonText: string;
    attachButtonIcon: string;
    statusPendingBg: string;
    statusPendingText: string;
    statusPendingBorder: string;
    statusResolvedBg: string;
    statusResolvedText: string;
    statusResolvedBorder: string;
    adminResponseBg: string;
    adminResponseBorder: string;
    adminResponseLabel: string;
    adminResponseText: string;
    dateText: string;
    emptyText: string;
    emptySubText: string;
    divider: string;
    danger: string;
  };
}

function buildSupportLight(palette: BrandPalette): SupportTheme {
  const accent600 = palette.accent[600];
  const accent200 = palette.accent[200];
  const accent100 = palette.accent[100];
  const accent950 = palette.accent[950];

  return {
    ...getCommonTheme(palette),
    support: {
      background: commonColors.slateBackground,
      headerBackground: commonColors.white,
      headerTitle: '#111827',
      headerBorder: commonColors.grayLight,
      tabBarBackground: commonColors.white,
      tabText: '#6B7280',
      tabActiveText: accent600,
      tabActiveBorder: accent600,
      cardBackground: commonColors.white,
      cardBorder: commonColors.grayLight,
      sectionTitle: '#374151',
      fieldLabel: '#374151',
      inputBackground: commonColors.white,
      inputBorder: commonColors.grayLight,
      inputText: '#111827',
      inputPlaceholder: '#9CA3AF',
      submitButtonBg: accent600,
      submitButtonText: commonColors.white,
      attachButtonBg: '#F3F4F6',
      attachButtonBorder: commonColors.grayLight,
      attachButtonText: '#374151',
      attachButtonIcon: '#6B7280',
      statusPendingBg: '#FEF3C7',
      statusPendingText: '#92400E',
      statusPendingBorder: '#FDE68A',
      statusResolvedBg: '#D1FAE5',
      statusResolvedText: '#065F46',
      statusResolvedBorder: '#6EE7B7',
      // Flat pale badge fill + its matching border/text steps on the same scale
      // (these were hardcoded indigo-200/indigo-950 literals in the reference).
      adminResponseBg: accent100,
      adminResponseBorder: accent200,
      adminResponseLabel: accent600,
      adminResponseText: accent950,
      dateText: '#9CA3AF',
      emptyText: '#374151',
      emptySubText: '#9CA3AF',
      divider: commonColors.grayLight,
      danger: commonColors.errorRed,
    },
  };
}

function buildSupportDark(palette: BrandPalette): SupportTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    support: {
      background: commonColors.darkSurface,
      headerBackground: commonColors.darkCard,
      headerTitle: commonColors.white,
      headerBorder: 'rgba(255,255,255,0.08)',
      tabBarBackground: commonColors.darkCard,
      tabText: 'rgba(255,255,255,0.45)',
      tabActiveText: accent400,
      tabActiveBorder: accent400,
      cardBackground: commonColors.darkCard,
      cardBorder: 'rgba(255,255,255,0.08)',
      sectionTitle: commonColors.white,
      fieldLabel: 'rgba(255,255,255,0.75)',
      inputBackground: commonColors.darkCard,
      inputBorder: 'rgba(255,255,255,0.12)',
      inputText: commonColors.white,
      inputPlaceholder: 'rgba(255,255,255,0.30)',
      submitButtonBg: accentDefault,
      submitButtonText: commonColors.white,
      attachButtonBg: accent400,
      attachButtonBorder: 'rgba(255,255,255,0.12)',
      attachButtonText: commonColors.white,
      attachButtonIcon: 'rgba(255,255,255,0.60)',
      statusPendingBg: 'rgba(245,166,35,0.15)',
      statusPendingText: '#FCD34D',
      statusPendingBorder: 'rgba(245,166,35,0.30)',
      statusResolvedBg: 'rgba(52,211,153,0.15)',
      statusResolvedText: '#6EE7B7',
      statusResolvedBorder: 'rgba(52,211,153,0.30)',
      // These were literally `rgba(79,70,229,...)` — indigo's own rgb values
      // re-expressed as translucent overlays — so they follow the accentDefault swap.
      adminResponseBg: withAlpha(accentDefault, 0.15),
      adminResponseBorder: withAlpha(accentDefault, 0.30),
      adminResponseLabel: accent400,
      adminResponseText: 'rgba(255,255,255,0.85)',
      dateText: 'rgba(255,255,255,0.35)',
      emptyText: 'rgba(255,255,255,0.70)',
      emptySubText: 'rgba(255,255,255,0.35)',
      divider: 'rgba(255,255,255,0.08)',
      danger: '#FF6B6B',
    },
  };
}

export function getSupportTheme(palette: BrandPalette): SupportTheme {
  return palette.dark ? buildSupportDark(palette) : buildSupportLight(palette);
}
