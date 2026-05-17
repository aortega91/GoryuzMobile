import React from 'react';
import Svg, { Path, Polyline } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function UploadCloudIcon({ size = 24, color = '#000000', strokeWidth = 2 }: IconProps) {
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
      <Path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <Path d="M12 12v9" />
      <Polyline points="16 16 12 12 8 16" />
    </Svg>
  );
}

export default UploadCloudIcon;
