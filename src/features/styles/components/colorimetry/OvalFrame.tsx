import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Defs, Ellipse, Mask, Rect } from 'react-native-svg';

import { OVAL } from '../../colorimetry/camera';

interface Props {
  maskColor: string;
  strokeColor: string;
}

/**
 * zena's oval guide: outside darkened so the framing is obvious. Same geometry
 * as the sampling box (`OVAL`), drawn on a 0-100 viewBox stretched over the
 * frame, so what is inside the ring is what gets measured.
 */
function OvalFrame({ maskColor, strokeColor }: Props) {
  return (
    <Svg viewBox="0 0 100 100" preserveAspectRatio="none" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Mask id="colorimetryOvalMask">
          <Rect width="100" height="100" fill="white" />
          <Ellipse cx="50" cy="50" rx={OVAL.widthPct / 2} ry={OVAL.heightPct / 2} fill="black" />
        </Mask>
      </Defs>
      <Rect width="100" height="100" fill={maskColor} mask="url(#colorimetryOvalMask)" />
      <Ellipse
        cx="50"
        cy="50"
        rx={OVAL.widthPct / 2}
        ry={OVAL.heightPct / 2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={0.6}
        strokeDasharray="3 2"
      />
    </Svg>
  );
}

export default OvalFrame;
