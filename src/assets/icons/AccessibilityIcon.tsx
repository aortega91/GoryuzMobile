import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * No `strokeWidth`, unlike every other icon here: a filled glyph has no stroke
 * to weight. Callers may still pass one — it is simply ignored.
 */
interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Google Material Design `accessibility` (24dp), path data verbatim.
 *
 * The one filled icon in the set — Material draws solid glyphs where Lucide
 * draws outlines, and the solid torso is the point: the stroked figures we
 * tried before had no body to them at tab-bar size.
 */
function AccessibilityIcon({ size = 24, color = '#000000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
    </Svg>
  );
}

export default AccessibilityIcon;
