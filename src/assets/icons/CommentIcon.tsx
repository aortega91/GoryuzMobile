import React from 'react';
import Svg, { Path } from 'react-native-svg';

/**
 * No `strokeWidth`, unlike the Lucide icons here: Material Symbols describe
 * their outlines as a filled path, so there is no stroke to weight. Callers
 * may still pass one — it is simply ignored.
 */
interface IconProps {
  size?: number;
  color?: string;
}

/**
 * Google Material Symbols `comment` (outlined, 24dp), path data verbatim from
 * google/material-design-icons — a speech bubble with three lines of text in
 * it, which is the point: it says written words, not a conversation.
 *
 * Keeps Material's own `0 -960 960 960` viewBox rather than being rescaled to
 * the 24×24 box the Lucide icons use: the path is left exactly as published.
 */
function CommentIcon({ size = 24, color = '#000000' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960" fill={color}>
      <Path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720ZM160-320h594l46 45v-525H160v480Zm0 0v-480 480Z" />
    </Svg>
  );
}

export default CommentIcon;
