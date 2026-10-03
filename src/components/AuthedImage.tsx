/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { ActivityIndicator, Image, ImageProps, StyleSheet, View } from 'react-native';

import {
  getImageSource,
  subscribeAuthToken,
  getAuthTokenSnapshot,
} from '@api/client';

/**
 * AuthedImage — drop-in <Image> for backend-served images that require the
 * Firebase Bearer token (relative /api paths and private-R2 absolute URLs).
 *
 * Why a wrapper instead of `<Image source={getImageSource(x)} />`:
 *   getImageSource embeds the current ID token in the request headers at render
 *   time. ID tokens are short-lived (~1h) and the SDK rotates them, so a plain
 *   <Image> mounted for a long time would keep a stale header and 401 on any
 *   cache-miss re-fetch. This component subscribes to token changes via
 *   useSyncExternalStore and re-renders so the header is always current.
 *
 * Pass the raw `data` string (data URL, relative path, or absolute URL) instead
 * of `source`. Optional `fallbackUri` is shown when `data` is empty or the
 * authed image fails to load (e.g. avatars → a generated placeholder).
 *
 * Pass `loaderColor` (and optionally `placeholderColor`) to show a spinner on a
 * tinted tile until the image arrives — for slow network images. `style` then
 * sizes the tile; give it explicit width/height.
 */
type Props = Omit<ImageProps, 'source'> & {
  data?: string | null;
  fallbackUri?: string;
  loaderColor?: string;
  placeholderColor?: string;
};

function AuthedImage({ data, fallbackUri, onError, loaderColor, placeholderColor, ...rest }: Props) {
  // Re-render whenever the cached ID token changes so getImageSource() below
  // resolves with the latest Bearer header.
  useSyncExternalStore(subscribeAuthToken, getAuthTokenSnapshot);

  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [data]);

  if (data && loaderColor && !(failed && fallbackUri)) {
    const { style, onLoadEnd, ...imageProps } = rest;
    return (
      <View style={[style, styles.tile, { backgroundColor: placeholderColor }]}>
        <Image
          {...imageProps}
          style={StyleSheet.absoluteFill}
          source={getImageSource(data)}
          onLoadEnd={() => {
            setLoaded(true);
            onLoadEnd?.();
          }}
          onError={e => {
            setFailed(true);
            onError?.(e);
          }}
        />
        {!loaded && <ActivityIndicator size="small" color={loaderColor} />}
      </View>
    );
  }

  if (data && !(failed && fallbackUri)) {
    return (
      <Image
        {...rest}
        source={getImageSource(data)}
        onError={e => {
          setFailed(true);
          onError?.(e);
        }}
      />
    );
  }

  if (fallbackUri) {
    return <Image {...rest} source={{ uri: fallbackUri }} />;
  }

  return null;
}

const styles = StyleSheet.create({
  tile: { overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
});

export default AuthedImage;
