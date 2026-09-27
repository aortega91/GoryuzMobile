/**
 * Dominant colour of each closet garment — port of zena `useGarmentColors`.
 *
 * zena draws every garment on a 48×48 canvas and votes the dominant colour
 * with `dominantColorFromPixels`. Without a canvas the image is fetched,
 * decoded with jpeg-js and box-downscaled to the same 48×48 before the same
 * vote. Only JPEG can be decoded without native code: other formats (PNG
 * cut-outs) stay out of the match, like zena's CORS-tainted images do.
 *
 * Unlike zena this only starts when `enabled` (the first tapped swatch):
 * decoding in JS is far costlier than a canvas, so it is not paid for by users
 * who never open a colour.
 */
import { useEffect, useMemo, useState } from 'react';

import { ClothingItem } from '@features/collection/types';
import { logError } from '@utilities/crashlytics';
import { toBase64Image } from '../api/stylesGenerateApi';
import { base64ToBytes, decodeJpeg, downscale, isJpeg } from './camera';
import { dominantColorFromPixels, type Lab } from './colorimetry';

const SAMPLE_SIZE = 48;

/** Lives outside the render and is keyed by garment id: only new items are measured. */
const cache = new Map<string, Lab>();
/** Already tried and without a colour, so they are not retried in a loop. */
const failed = new Set<string>();

const yieldToUi = () =>
  new Promise<void>(resolve => {
    setTimeout(resolve, 0);
  });

async function measure(item: ClothingItem): Promise<void> {
  try {
    const image = await toBase64Image(item.imageData);
    const bytes = image ? base64ToBytes(image.base64) : null;
    if (!bytes || !isJpeg(bytes)) {
      failed.add(item.id);
      return;
    }
    const small = downscale(decodeJpeg(bytes), SAMPLE_SIZE);
    const lab = dominantColorFromPixels(new Uint8ClampedArray(small.data.buffer));
    if (lab) cache.set(item.id, lab);
    else failed.add(item.id);
  } catch (err) {
    failed.add(item.id);
    logError(err instanceof Error ? err : new Error(String(err)), 'colorimetry/garmentColor');
  }
}

export function useGarmentColors(
  closet: ClothingItem[],
  enabled: boolean,
): { colors: Map<string, Lab>; measuring: boolean } {
  const [version, setVersion] = useState(0);
  const [measuring, setMeasuring] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    const pending = closet.filter(item => item.imageData && !cache.has(item.id) && !failed.has(item.id));
    if (pending.length === 0) return undefined;

    let cancelled = false;
    setMeasuring(true);
    (async () => {
      // One at a time with a yield in between: decoding is synchronous JS and
      // would otherwise freeze the sheet. The grid fills in as it goes.
      for (let i = 0; i < pending.length; i += 1) {
        if (cancelled) return;
        // eslint-disable-next-line no-await-in-loop
        await measure(pending[i]);
        if (cancelled) return;
        setVersion(v => v + 1);
        // eslint-disable-next-line no-await-in-loop
        await yieldToUi();
      }
      if (!cancelled) setMeasuring(false);
    })();

    return () => {
      cancelled = true;
      setMeasuring(false);
    };
  }, [closet, enabled]);

  // A copy, not the cache itself: its identity never changes, so memos
  // depending on it would not notice newly measured garments.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const colors = useMemo(() => new Map(cache), [version]);
  return { colors, measuring };
}
