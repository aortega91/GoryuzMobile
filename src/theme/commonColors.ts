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

/**
 * Tailwind hue ramps the zena reference paints Agenda plan motives, weather
 * boxes and plan-status chips with (see zena `src/constants/agendaMotives.ts`).
 * Kept apart from `commonColors` so that object stays a flat string map.
 */
export const tailwindHues = {
  blue: { 50: '#EFF6FF', 100: '#DBEAFE', 200: '#BFDBFE', 300: '#93C5FD', 500: '#3B82F6', 700: '#1D4ED8', 800: '#1E40AF', 900: '#1E3A8A', 950: '#172554' },
  amber: { 50: '#FFFBEB', 100: '#FEF3C7', 200: '#FDE68A', 500: '#F59E0B', 700: '#B45309', 900: '#78350F', 950: '#451A03' },
  fuchsia: { 50: '#FDF4FF', 100: '#FAE8FF', 200: '#F5D0FE', 500: '#D946EF', 700: '#A21CAF', 900: '#701A75', 950: '#4A044E' },
  rose: { 50: '#FFF1F2', 100: '#FFE4E6', 200: '#FECDD3', 500: '#F43F5E', 700: '#BE123C', 900: '#881337', 950: '#4C0519' },
  emerald: { 50: '#ECFDF5', 100: '#D1FAE5', 200: '#A7F3D0', 300: '#6EE7B7', 500: '#10B981', 600: '#059669', 700: '#047857', 900: '#064E3B', 950: '#022C22' },
  orange: { 50: '#FFF7ED', 100: '#FFEDD5', 200: '#FED7AA', 500: '#F97316', 700: '#C2410C', 900: '#7C2D12', 950: '#431407' },
  teal: { 50: '#F0FDFA', 100: '#CCFBF1', 200: '#99F6E4', 500: '#14B8A6', 700: '#0F766E', 900: '#134E4A', 950: '#042F2E' },
  violet: { 50: '#F5F3FF', 100: '#EDE9FE', 200: '#DDD6FE', 500: '#8B5CF6', 700: '#6D28D9', 900: '#4C1D95', 950: '#2E1065' },
  gray: { 50: '#F9FAFB', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB', 400: '#9CA3AF', 500: '#6B7280', 600: '#4B5563', 700: '#374151', 800: '#1F2937', 900: '#111827', 950: '#030712' },
  yellow: { 400: '#FACC15' },
} as const;

export type CommonColorKey = keyof typeof commonColors;
export default commonColors;
