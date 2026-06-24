import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Custom Lucide-style icon — Lucide has no dress glyph
function DressIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M8 3 7 7l1 1-3 13h14l-3-13 1-1-1-4Z" />
      <Path d="M8 3l4 3 4-3" />
    </Svg>
  );
}

export default DressIcon;
