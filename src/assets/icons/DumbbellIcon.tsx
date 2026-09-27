import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function DumbbellIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="m6.5 6.5 11 11" />
      <Path d="m21 21-1-1" />
      <Path d="m3 3 1 1" />
      <Path d="m18 22 4-4" />
      <Path d="m2 6 4-4" />
      <Path d="m3 10 7-7" />
      <Path d="m14 21 7-7" />
    </Svg>
  );
}

export default DumbbellIcon;
