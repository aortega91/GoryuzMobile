import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface GoryuzLogoProps {
  size?: number;
  color?: string;
}

function GoryuzLogo({ size = 80, color = '#1B2A4A' }: GoryuzLogoProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      <Path
        d="M50 5C25.147 5 5 25.147 5 50C5 74.853 25.147 95 50 95C74.853 95 95 74.853 95 50"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
      />
      <Path
        d="M90 35V50H50V68H75C71.5 80 60 85 50 85C30.67 85 15 69.33 15 50C15 30.67 30.67 15 50 15C63 15 72 21 78 28"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default GoryuzLogo;
