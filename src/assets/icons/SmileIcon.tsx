import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function SmileIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Circle cx={12} cy={12} r={10} />
      <Path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <Line x1={9} x2={9.01} y1={9} y2={9} />
      <Line x1={15} x2={15.01} y1={9} y2={9} />
    </Svg>
  );
}

export default SmileIcon;
