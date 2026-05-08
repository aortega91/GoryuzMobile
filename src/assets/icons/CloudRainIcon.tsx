import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function CloudRainIcon({ size = 24, color = '#000000', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
      <Line x1="8" y1="19" x2="8" y2="21" />
      <Line x1="8" y1="23" x2="8" y2="24" />
      <Line x1="12" y1="18" x2="12" y2="20" />
      <Line x1="12" y1="22" x2="12" y2="23" />
      <Line x1="16" y1="19" x2="16" y2="21" />
      <Line x1="16" y1="23" x2="16" y2="24" />
    </Svg>
  );
}

export default CloudRainIcon;
