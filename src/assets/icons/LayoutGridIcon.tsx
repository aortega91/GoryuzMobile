import React from 'react';
import Svg, { Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function LayoutGridIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Rect width={7} height={7} x={3} y={3} rx={1} />
      <Rect width={7} height={7} x={14} y={3} rx={1} />
      <Rect width={7} height={7} x={14} y={14} rx={1} />
      <Rect width={7} height={7} x={3} y={14} rx={1} />
    </Svg>
  );
}

export default LayoutGridIcon;
