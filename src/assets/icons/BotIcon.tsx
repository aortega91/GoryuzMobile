import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function BotIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M12 8V4H8" />
      <Rect width="16" height="12" x="4" y="8" rx="2" />
      <Path d="M2 14h2" />
      <Path d="M20 14h2" />
      <Path d="M15 13v2" />
      <Path d="M9 13v2" />
    </Svg>
  );
}

export default BotIcon;
