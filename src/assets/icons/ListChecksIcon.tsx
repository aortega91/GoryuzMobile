import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function ListChecksIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="m3 17 2 2 4-4" />
      <Path d="m3 7 2 2 4-4" />
      <Path d="M13 6h8" />
      <Path d="M13 12h8" />
      <Path d="M13 18h8" />
    </Svg>
  );
}

export default ListChecksIcon;
