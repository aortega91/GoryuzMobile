import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function MapPinOffIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M12.75 7.09a3 3 0 0 1 2.16 2.16" />
      <Path d="M17.072 17.072c-1.634 2.17-3.527 3.912-4.471 4.727a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 1.432-4.568" />
      <Path d="M10.733 5.076A8 8 0 0 1 20 10c0 1.698-.559 3.269-1.504 4.568" />
      <Line x1="2" y1="2" x2="22" y2="22" />
    </Svg>
  );
}

export default MapPinOffIcon;
