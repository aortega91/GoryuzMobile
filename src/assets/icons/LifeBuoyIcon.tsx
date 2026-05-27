import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function LifeBuoyIcon({ size = 24, color = '#000000', strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="4.93" y1="4.93" x2="9.17" y2="9.17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="14.83" y1="14.83" x2="19.07" y2="19.07" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="14.83" y1="9.17" x2="19.07" y2="4.93" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="4.93" y1="19.07" x2="9.17" y2="14.83" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default LifeBuoyIcon;
