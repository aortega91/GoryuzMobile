import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function RepeatIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="m17 2 4 4-4 4" />
      <Path d="M3 11v-1a4 4 0 0 1 4-4h14" />
      <Path d="m7 22-4-4 4-4" />
      <Path d="M21 13v1a4 4 0 0 1-4 4H3" />
    </Svg>
  );
}

export default RepeatIcon;
