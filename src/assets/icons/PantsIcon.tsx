import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Custom Lucide-style icon — Lucide has no trousers glyph
function PantsIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M5 3h14l-1 18h-4l-2-11-2 11H6L5 3Z" />
      <Path d="M5 6h14" />
    </Svg>
  );
}

export default PantsIcon;
