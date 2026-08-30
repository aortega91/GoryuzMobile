/**
 * commonColors
 *
 * The single source of truth for all palette values used across the app.
 * Module-level theme files reference these values. To override a color in a
 * specific module, stop referencing it here and supply the hex directly in that
 * module's theme file.
 *
 * Values are aligned to the goryuz-2.0 web reference: the brand anchors come
 * from its Tailwind config (primary / accent / success / error), and the
 * neutrals from the Tailwind grey ramp it actually renders — gray-50 for
 * surfaces, gray-200 for borders, gray-900/800/700 for dark mode.
 */
const commonColors = {
  // Brand — "Azul Medianoche", the reference's `primary`, plus a lightness ramp
  // derived from it for active states, focus borders and raised surfaces.
  navyDark: '#191940',
  navy: '#222258',
  navyMid: '#2C2C70',
  navyLight: '#36368B',

  // Brand accent — "Cobre Pulido", the reference's `accent`
  copper: '#B87333',
  copperLight: '#CE8D50',

  // Neutrals – Light
  white: '#FFFFFF',
  offWhite: '#F9FAFB',   // gray-50  — the reference's `light`, its default surface
  grayLight: '#E5E7EB',  // gray-200 — its dominant border
  gray: '#9CA3AF',       // gray-400
  grayDark: '#6B7280',   // gray-500

  // Neutrals – Dark
  black: '#000000',
  darkSurface: '#111827', // gray-900
  darkCard: '#1F2937',    // gray-800
  darkBorder: '#374151',  // gray-700

  // Semantic
  errorRed: '#C93737',     // "Rojo Terracota"
  successGreen: '#50B873', // "Menta Tranquila"
  warningAmber: '#F59E0B', // amber-500

  // Indigo — the app's action colour: buttons, FABs, active and selected states.
  // The reference renders indigo ~2.7x more than its declared navy `primary`.
  indigo: '#4F46E5',      // indigo-600
  indigoLight: '#6366F1', // indigo-500 — lifted for contrast on dark surfaces
  indigoSoft: '#EEF2FF',  // indigo-50

  // Slate background
  slateBackground: '#F8FAFC',

  // Transparent / overlay
  overlayDark: 'rgba(0,0,0,0.55)',
  overlayLight: 'rgba(255,255,255,0.15)',
} as const;

export type CommonColorKey = keyof typeof commonColors;
export default commonColors;
