import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function PersonStandingIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Circle cx="12" cy="5" r="1" />
      <Path d="m9 20 3-6 3 6" />
      <Path d="m6 8 6 2 6-2" />
      <Path d="M12 10v4" />
    </Svg>
  );
}

export default PersonStandingIcon;
