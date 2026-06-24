import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Custom Lucide-style icon — Lucide has no jacket/coat glyph
function JacketIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M8 3 4 7l1 14h14l1-14-4-4-2 3-2 2-2-2-2-3Z" />
      <Path d="M12 8v13" />
    </Svg>
  );
}

export default JacketIcon;
