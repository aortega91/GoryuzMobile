import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * The universal-access figure: head, arms straight out, legs apart.
 *
 * Not Lucide's own `accessibility` glyph, which draws a figure mid-stride
 * around an arc and reads as motion rather than as a body at tab-bar size.
 * This is the symmetric, front-on symbol people picture — and the whole body
 * is the point of the tab it labels.
 */
function AccessibilityIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx="12" cy="4" r="2" />
      <Path d="M5 9h14" />
      <Path d="M12 8v6" />
      <Path d="m9 21 3-7 3 7" />
    </Svg>
  );
}

export default AccessibilityIcon;
