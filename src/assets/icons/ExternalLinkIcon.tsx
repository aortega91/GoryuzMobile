import React from 'react';
import Svg, { Path, Polyline, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function ExternalLinkIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <Polyline points="15 3 21 3 21 9" />
      <Line x1="10" y1="14" x2="21" y2="3" />
    </Svg>
  );
}

export default ExternalLinkIcon;
