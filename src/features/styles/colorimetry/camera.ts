/**
 * Pixel side of the colour test — the non-React half of zena's
 * `src/components/colorimetry/ColorimetryCamera.tsx`, as pure functions over an
 * RGBA `Uint8Array` + width/height instead of a `<canvas>`.
 *
 * `OVAL` and `rgbToHex` are VERBATIM copies of that component's constants and
 * must be re-synced when zena changes. `measureSkin` reproduces the body of its
 * `capture()` callback step by step (oval → region → SKIN_PATCHES → average);
 * `extractRegion` stands in for `ctx.getImageData` and `downscale` for the
 * 64×64 `ctx.drawImage` that feeds the light meter.
 *
 * There is no live preview on mobile: the photo comes from the native camera
 * (react-native-image-picker) as a small JPEG, is decoded here with the pure-JS
 * `jpeg-js`, and both the skin reading and the light verdict are run on it.
 */
import { decode } from 'jpeg-js';

import {
  averagePatch,
  frameLuminance,
  judgeLight,
  rgbToLab,
  SKIN_PATCHES,
  type ColorimetryMeasurement,
  type LightVerdict,
} from './colorimetry';

// ─── Verbatim from zena ColorimetryCamera.tsx ─────────────────────────────────

/* eslint-disable prefer-template */
/** El óvalo ocupa este trozo del encuadre; define dónde se muestrea la piel. */
export const OVAL = { widthPct: 62, heightPct: 74 };

export const rgbToHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
/* eslint-enable */

// ─── Canvas stand-ins ─────────────────────────────────────────────────────────

export interface RgbaImage {
  data: Uint8Array;
  width: number;
  height: number;
}

/** The verbatim helpers are typed for canvas data; this is a zero-copy view. */
const clamped = (data: Uint8Array) => new Uint8ClampedArray(data.buffer, data.byteOffset, data.length);

/**
 * `ctx.getImageData(sx, sy, sw, sh)` on a canvas holding `image`. Its arguments
 * are WebIDL `long`s, so fractional values are truncated toward zero — the
 * same happens here. Pixels outside the image come back transparent black.
 */
export function extractRegion(image: RgbaImage, sx: number, sy: number, sw: number, sh: number): RgbaImage {
  const x0 = Math.trunc(sx);
  const y0 = Math.trunc(sy);
  const w = Math.trunc(sw);
  const h = Math.trunc(sh);
  const out = new Uint8Array(Math.max(0, w) * Math.max(0, h) * 4);
  for (let y = 0; y < h; y += 1) {
    const srcY = y0 + y;
    if (srcY >= 0 && srcY < image.height) {
      for (let x = 0; x < w; x += 1) {
        const srcX = x0 + x;
        if (srcX >= 0 && srcX < image.width) {
          const si = (srcY * image.width + srcX) * 4;
          const di = (y * w + x) * 4;
          out[di] = image.data[si];
          out[di + 1] = image.data[si + 1];
          out[di + 2] = image.data[si + 2];
          out[di + 3] = image.data[si + 3];
        }
      }
    }
  }
  return { data: out, width: Math.max(0, w), height: Math.max(0, h) };
}

/**
 * Box-filtered resize — what `ctx.drawImage(img, 0, 0, size, size)` feeds the
 * light meter (64) and the garment colour hook (48). Every output pixel is the
 * mean of the source pixels it covers, which keeps the frame's mean intact.
 */
export function downscale(image: RgbaImage, size: number): RgbaImage {
  const out = new Uint8Array(size * size * 4);
  for (let ty = 0; ty < size; ty += 1) {
    const ya = Math.floor((ty * image.height) / size);
    const yb = Math.max(ya + 1, Math.floor(((ty + 1) * image.height) / size));
    for (let tx = 0; tx < size; tx += 1) {
      const xa = Math.floor((tx * image.width) / size);
      const xb = Math.max(xa + 1, Math.floor(((tx + 1) * image.width) / size));
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      let n = 0;
      for (let y = ya; y < yb && y < image.height; y += 1) {
        for (let x = xa; x < xb && x < image.width; x += 1) {
          const i = (y * image.width + x) * 4;
          r += image.data[i];
          g += image.data[i + 1];
          b += image.data[i + 2];
          a += image.data[i + 3];
          n += 1;
        }
      }
      const o = (ty * size + tx) * 4;
      if (n > 0) {
        out[o] = Math.round(r / n);
        out[o + 1] = Math.round(g / n);
        out[o + 2] = Math.round(b / n);
        out[o + 3] = Math.round(a / n);
      }
    }
  }
  return { data: out, width: size, height: size };
}

// ─── zena capture(), minus the canvas ─────────────────────────────────────────

/**
 * Skin measurement from a full frame, exactly as zena's `capture()` does it:
 * the on-screen oval is mapped to the equivalent box on the frame, the skin
 * patches are sampled inside it, and their mean becomes the measurement.
 * `null` when no patch could be read (zena's "No pudimos leer tu piel").
 */
export function measureSkin(image: RgbaImage): ColorimetryMeasurement | null {
  const ovalW = (image.width * OVAL.widthPct) / 100;
  const ovalH = (image.height * OVAL.heightPct) / 100;
  const ovalX = (image.width - ovalW) / 2;
  const ovalY = (image.height - ovalH) / 2;
  const region = extractRegion(image, ovalX, ovalY, ovalW, ovalH);

  const samples = SKIN_PATCHES.map(patch =>
    averagePatch(clamped(region.data), region.width, region.height, patch),
  ).filter((sample): sample is NonNullable<typeof sample> => sample !== null);

  if (samples.length === 0) return null;

  const avg = {
    r: Math.round(samples.reduce((acc, sample) => acc + sample.r, 0) / samples.length),
    g: Math.round(samples.reduce((acc, sample) => acc + sample.g, 0) / samples.length),
    b: Math.round(samples.reduce((acc, sample) => acc + sample.b, 0) / samples.length),
  };

  return { skin: rgbToLab(avg), skinHex: rgbToHex(avg) };
}

/** zena's light meter, run once on the captured photo (64×64, like its canvas). */
export function measureLight(image: RgbaImage): LightVerdict {
  return judgeLight(frameLuminance(clamped(downscale(image, 64).data)));
}

// ─── Decoding ─────────────────────────────────────────────────────────────────

/** Hermes provides `atob` globally (RN ≥ 0.74); the RN TS lib doesn't declare it. */
declare function atob(data: string): string;

/** Raw base64 (no `data:` prefix) → bytes, via Hermes' global `atob`. */
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Only JPEG can be decoded without native code — SOI marker check. */
export const isJpeg = (bytes: Uint8Array) => bytes.length > 2 && bytes[0] === 0xff && bytes[1] === 0xd8;

/** JPEG bytes → RGBA pixels. Throws on anything jpeg-js cannot parse. */
export function decodeJpeg(bytes: Uint8Array): RgbaImage {
  const { data, width, height } = decode(bytes, { useTArray: true, formatAsRGBA: true });
  return { data, width, height };
}

export interface CaptureReading {
  /** `null` = no skin could be read. */
  measurement: ColorimetryMeasurement | null;
  light: LightVerdict;
}

/** Everything the capture step needs from one JPEG photo. */
export function readCapture(base64: string): CaptureReading {
  const image = decodeJpeg(base64ToBytes(base64));
  return { measurement: measureSkin(image), light: measureLight(image) };
}

// ─── Live camera: preview ↔ photo mapping ─────────────────────────────────────

/** Hermes provides `btoa` globally too. */
declare function btoa(data: string): string;

/** Bytes → raw base64, chunked so `String.fromCharCode` never gets too many args. */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(bytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * The part of a `srcW×srcH` frame that a `resizeMode="cover"` preview of
 * `viewW×viewH` actually shows: centred, same aspect as the view.
 *
 * zena maps its oval as a percentage of the frame it samples. Cropping the
 * photo to what the preview showed first makes that frame *be* the view, so
 * the oval drawn over the preview (`OVAL` % of the view) and the one sampled
 * (`OVAL` % of the cropped photo) are the same region.
 */
export function coverCrop(srcW: number, srcH: number, viewW: number, viewH: number): Rect {
  const srcAspect = srcW / srcH;
  const viewAspect = viewW / viewH;
  if (srcAspect > viewAspect) {
    // Source wider than the view: the sides are cut off.
    const width = srcH * viewAspect;
    return { x: (srcW - width) / 2, y: 0, width, height: srcH };
  }
  const height = srcW / viewAspect;
  return { x: 0, y: (srcH - height) / 2, width: srcW, height };
}

/** Uniform scale that brings a `w×h` box within `max` px on its longer side (never upscales). */
export const fitScale = (w: number, h: number, max: number) => Math.min(1, max / Math.max(w, h));
