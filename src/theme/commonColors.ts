/**
 * commonColors
 *
 * The single source of truth for all palette values used across the app.
 * Module-level theme files reference these values. To override a color in a
 * specific module, stop referencing it here and supply the hex directly in that
 * module's theme file.
 */
const commonColors = {
  // Brand
  navyDark: '#0F1E35',
  navy: '#1B2A4A',
  navyMid: '#243660',
  navyLight: '#2E4A80',

  gold: '#C4933F',
  goldLight: '#D4A85A',

  // Neutrals – Light
  white: '#FFFFFF',
  offWhite: '#F5F4F1',
  grayLight: '#E8E6E1',
  gray: '#9E9E9E',
  grayDark: '#6B6B6B',

  // Neutrals – Dark
  black: '#000000',
  darkSurface: '#121212',
  darkCard: '#1E1E1E',
  darkBorder: '#2C2C2C',

  // Semantic
  errorRed: '#D64045',
  successGreen: '#3CB371',
  warningAmber: '#F5A623',

  // Indigo accent (login screen, primary CTA)
  indigo: '#4F46E5',
  indigoSoft: '#EEF2FF',

  // Slate background
  slateBackground: '#F8FAFC',

  // Transparent / overlay
  overlayDark: 'rgba(0,0,0,0.55)',
  overlayLight: 'rgba(255,255,255,0.15)',
} as const;

export type CommonColorKey = keyof typeof commonColors;
export default commonColors;
