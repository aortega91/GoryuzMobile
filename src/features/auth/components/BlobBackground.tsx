import React from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Filter, FeGaussianBlur } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('screen');
const BLOB_SIZE = 380;

// ─── iOS: SVG feGaussianBlur (true Gaussian blur via Core Image) ──────────────

function IosBlobs() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      width={SCREEN_W}
      height={SCREEN_H}
      pointerEvents="none"
    >
      <Defs>
        <Filter id="blob-blur" x="-150%" y="-150%" width="400%" height="400%">
          <FeGaussianBlur in="SourceGraphic" stdDeviation="55" />
        </Filter>
      </Defs>
      <Circle
        cx={-20}
        cy={-20}
        r={180}
        fill="#6366F1"
        fillOpacity={0.6}
        filter="url(#blob-blur)"
      />
      <Circle
        cx={SCREEN_W + 20}
        cy={SCREEN_H * 0.35}
        r={180}
        fill="#A855F7"
        fillOpacity={0.6}
        filter="url(#blob-blur)"
      />
      <Circle
        cx={SCREEN_W * 0.5}
        cy={SCREEN_H + 20}
        r={180}
        fill="#F472B6"
        fillOpacity={0.6}
        filter="url(#blob-blur)"
      />
    </Svg>
  );
}

// ─── Android: RN style filter blur (native render thread, works on Android) ───

function AndroidBlobs() {
  return (
    <>
      <View style={androidStyles.blob1} />
      <View style={androidStyles.blob2} />
      <View style={androidStyles.blob3} />
    </>
  );
}

const androidStyles = StyleSheet.create({
  blob1: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    backgroundColor: 'rgba(99,102,241,0.65)',
    top: -BLOB_SIZE * 0.3,
    left: -BLOB_SIZE * 0.3,
    filter: [{ blur: 60 }],
  },
  blob2: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    backgroundColor: 'rgba(168,85,247,0.65)',
    top: '25%',
    right: -BLOB_SIZE * 0.3,
    filter: [{ blur: 60 }],
  },
  blob3: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
    backgroundColor: 'rgba(244,114,182,0.65)',
    bottom: -BLOB_SIZE * 0.3,
    left: '20%',
    filter: [{ blur: 60 }],
  },
});

// ─── Public component ─────────────────────────────────────────────────────────

export default function BlobBackground() {
  return Platform.OS === 'ios' ? <IosBlobs /> : <AndroidBlobs />;
}
