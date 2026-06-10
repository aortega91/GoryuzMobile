/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { Image, ImageProps } from 'react-native';

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
 */
type Props = Omit<ImageProps, 'source'> & {
  data?: string | null;
  fallbackUri?: string;
};

function AuthedImage({ data, fallbackUri, onError, ...rest }: Props) {
  // Re-render whenever the cached ID token changes so getImageSource() below
  // resolves with the latest Bearer header.
  useSyncExternalStore(subscribeAuthToken, getAuthTokenSnapshot);

  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [data]);

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

export default AuthedImage;
