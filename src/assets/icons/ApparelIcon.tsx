import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * No `strokeWidth`, unlike the Lucide icons here: Material Symbols describe
 * their outlines as a filled path, so there is no stroke to weight.
 */
interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Google Material Symbols `apparel` (outlined, 24dp), path data verbatim from
 * google/material-design-icons — a t-shirt, for the gallery of saved looks.
 *
 * Keeps Material's own `0 -960 960 960` viewBox rather than being rescaled to
 * the 24×24 box the Lucide icons use: the path is left exactly as published.
 */
function ApparelIcon({ size = 24, color = '#000000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <Path d="m240-522-40 22q-14 8-30 4t-24-18L66-654q-8-14-4-30t18-24l230-132h70q9 0 14.5 5.5T400-820v20q0 33 23.5 56.5T480-720q33 0 56.5-23.5T560-800v-20q0-9 5.5-14.5T580-840h70l230 132q14 8 18 24t-4 30l-80 140q-8 14-23.5 17.5T760-501l-40-20v361q0 17-11.5 28.5T680-120H280q-17 0-28.5-11.5T240-160v-362Zm80-134v456h320v-456l124 68 42-70-172-100q-15 51-56.5 84.5T480-640q-56 0-97.5-33.5T326-758L154-658l42 70 124-68Zm160 177Z" />
    </Svg>
  );
}

export default ApparelIcon;
