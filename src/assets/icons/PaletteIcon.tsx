import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function PaletteIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" />
      <Circle cx="13.5" cy="6.5" r="0.5" fill={color} stroke="none" />
      <Circle cx="17.5" cy="10.5" r="0.5" fill={color} stroke="none" />
      <Circle cx="6.5" cy="12.5" r="0.5" fill={color} stroke="none" />
      <Circle cx="8.5" cy="7.5" r="0.5" fill={color} stroke="none" />
    </Svg>
  );
}

export default PaletteIcon;
