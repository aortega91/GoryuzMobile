import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function GlassesIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Circle cx={6} cy={15} r={4} />
      <Circle cx={18} cy={15} r={4} />
      <Path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      <Path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2" />
      <Path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2" />
    </Svg>
  );
}

export default GlassesIcon;
