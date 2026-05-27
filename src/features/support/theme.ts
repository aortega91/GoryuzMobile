import commonColors from '@theme/commonColors';
import { Theme, lightTheme, darkTheme } from '@theme/index';

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

export const supportLightTheme: SupportTheme = {
  ...lightTheme,
  support: {
    background: commonColors.slateBackground,
    headerBackground: commonColors.white,
    headerTitle: '#111827',
    headerBorder: commonColors.grayLight,
    tabBarBackground: commonColors.white,
    tabText: '#6B7280',
    tabActiveText: commonColors.indigo,
    tabActiveBorder: commonColors.indigo,
    cardBackground: commonColors.white,
    cardBorder: commonColors.grayLight,
    sectionTitle: '#374151',
    fieldLabel: '#374151',
    inputBackground: commonColors.white,
    inputBorder: commonColors.grayLight,
    inputText: '#111827',
    inputPlaceholder: '#9CA3AF',
    submitButtonBg: commonColors.indigo,
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
    adminResponseBg: '#EEF2FF',
    adminResponseBorder: '#C7D2FE',
    adminResponseLabel: commonColors.indigo,
    adminResponseText: '#1E1B4B',
    dateText: '#9CA3AF',
    emptyText: '#374151',
    emptySubText: '#9CA3AF',
    divider: commonColors.grayLight,
    danger: commonColors.errorRed,
  },
};

export const supportDarkTheme: SupportTheme = {
  ...darkTheme,
  support: {
    background: commonColors.navyDark,
    headerBackground: commonColors.navy,
    headerTitle: commonColors.white,
    headerBorder: 'rgba(255,255,255,0.08)',
    tabBarBackground: commonColors.navy,
    tabText: 'rgba(255,255,255,0.45)',
    tabActiveText: commonColors.goldLight,
    tabActiveBorder: commonColors.goldLight,
    cardBackground: commonColors.navyMid,
    cardBorder: 'rgba(255,255,255,0.08)',
    sectionTitle: commonColors.white,
    fieldLabel: 'rgba(255,255,255,0.75)',
    inputBackground: commonColors.navy,
    inputBorder: 'rgba(255,255,255,0.12)',
    inputText: commonColors.white,
    inputPlaceholder: 'rgba(255,255,255,0.30)',
    submitButtonBg: commonColors.gold,
    submitButtonText: commonColors.navyDark,
    attachButtonBg: commonColors.navyLight,
    attachButtonBorder: 'rgba(255,255,255,0.12)',
    attachButtonText: commonColors.white,
    attachButtonIcon: 'rgba(255,255,255,0.60)',
    statusPendingBg: 'rgba(245,166,35,0.15)',
    statusPendingText: '#FCD34D',
    statusPendingBorder: 'rgba(245,166,35,0.30)',
    statusResolvedBg: 'rgba(52,211,153,0.15)',
    statusResolvedText: '#6EE7B7',
    statusResolvedBorder: 'rgba(52,211,153,0.30)',
    adminResponseBg: 'rgba(79,70,229,0.15)',
    adminResponseBorder: 'rgba(79,70,229,0.30)',
    adminResponseLabel: commonColors.goldLight,
    adminResponseText: 'rgba(255,255,255,0.85)',
    dateText: 'rgba(255,255,255,0.35)',
    emptyText: 'rgba(255,255,255,0.70)',
    emptySubText: 'rgba(255,255,255,0.35)',
    divider: 'rgba(255,255,255,0.08)',
    danger: '#FF6B6B',
  },
};
