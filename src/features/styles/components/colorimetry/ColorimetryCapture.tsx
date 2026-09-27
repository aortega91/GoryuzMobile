import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  LayoutChangeEvent,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  CommonResolutions,
  useCameraDevice,
  useCameraPermission as useVisionCameraPermission,
  usePhotoOutput,
  type CameraRef,
} from 'react-native-vision-camera';

import Touchable from '@components/Touchable';
import PermissionModal from '@components/PermissionModal';
import useCameraPermission from '@hooks/useCameraPermission';
import useStylesTheme from '@hooks/useStylesTheme';
import { AlertTriangleIcon, CameraIcon, ImageIcon, RefreshCwIcon, SunIcon } from '@assets/icons';
import { logError } from '@utilities/crashlytics';
import {
  base64ToBytes,
  bytesToBase64,
  coverCrop,
  decodeJpeg,
  fitScale,
  isJpeg,
  measureLight,
  measureSkin,
} from '../../colorimetry/camera';
import type { ColorimetryMeasurement, LightVerdict } from '../../colorimetry/colorimetry';
import OvalFrame from './OvalFrame';

interface Props {
  /** The measurement and the photo (raw base64) for the AI check. */
  onCapture: (measurement: ColorimetryMeasurement, imageBase64: string, mimeType: string) => void;
  onCancel: () => void;
}

/** A gallery photo waiting for confirmation (the live camera goes straight to analysis, like zena). */
interface Shot {
  uri: string;
  base64: string;
  aspect: number;
  light: LightVerdict;
  measurement: ColorimetryMeasurement;
}

/** The model only needs to see the face, and jpeg-js decodes in JS: keep it small. */
const MAX_SIDE = 512;
const JPEG_QUALITY = 0.9;
/** zena reads the light once a second. */
const METER_INTERVAL_MS = 1000;
/** Snapshot pre-shrink before the JS decode; `measureLight` then box-filters to 64×64. */
const METER_SIZE = { width: 96, height: 128 };
/**
 * Live light meter source. Android: a preview snapshot. iOS has no preview
 * snapshot in VisionCamera, and a silent photo every second is only possible on
 * iOS 18+, so there the light is judged on the captured photo instead.
 */
const HAS_LIVE_METER = Platform.OS === 'android';

const GALLERY_OPTIONS = {
  maxWidth: MAX_SIDE,
  maxHeight: MAX_SIDE,
  quality: JPEG_QUALITY,
  includeBase64: true,
  assetRepresentationMode: 'compatible',
  selectionLimit: 1,
} as const;

const LIGHT_KEYS: Record<LightVerdict, string> = {
  dark: 'styles.colorimetry.lightDark',
  bright: 'styles.colorimetry.lightBright',
  ok: 'styles.colorimetry.lightOk',
};

const toError = (err: unknown) => (err instanceof Error ? err : new Error(String(err)));

/** zena's banner at the bottom of the frame. `null` = not measured yet (iOS): framing tip only. */
function LightBanner({ light }: { light: LightVerdict | null }) {
  const { t } = useTranslation();
  const c = useStylesTheme().colorimetry;
  const background =
    light === null ? c.lightNeutralBackground : light === 'ok' ? c.lightOkBackground : c.lightWarnBackground;
  return (
    <View style={[styles.lightBanner, { backgroundColor: background }]}>
      <SunIcon size={14} color={c.lightText} />
      <Text style={[styles.lightText, { color: c.lightText }]}>
        {light === null
          ? `${t('styles.colorimetry.guideFrame')} ${t('styles.colorimetry.guideLight')}`
          : t(LIGHT_KEYS[light])}
      </Text>
    </View>
  );
}

function DarkNote({ textKey }: { textKey: string }) {
  const { t } = useTranslation();
  const c = useStylesTheme().colorimetry;
  return (
    <View style={styles.darkNote}>
      <RefreshCwIcon size={12} color={c.darkNote} />
      <Text style={[styles.darkNoteText, { color: c.darkNote }]}>{t(textKey)}</Text>
    </View>
  );
}

/**
 * Capture step — port of zena's ColorimetryCamera on react-native-vision-camera.
 *
 * Front camera preview in a 3:4 card with zena's oval. The light meter judges
 * a small frame every second and blocks the capture while it is too dark. On
 * capture the photo is cropped to exactly what the `cover` preview showed, so
 * the `OVAL` box sampled on it is the oval drawn on screen, then downscaled to
 * ~512 px JPEG and measured with zena's maths.
 */
function ColorimetryCapture({ onCapture, onCancel }: Props) {
  const { t } = useTranslation();
  const c = useStylesTheme().colorimetry;
  const { openGallery, blockedPermission, dismissPermissionModal, handleOpenSettings } = useCameraPermission();
  const permission = useVisionCameraPermission();
  const device = useCameraDevice('front');
  const photoOutput = usePhotoOutput({
    targetResolution: CommonResolutions.HD_4_3,
    containerFormat: 'jpeg',
    quality: JPEG_QUALITY,
    qualityPrioritization: 'speed',
  });
  const constraints = useMemo(() => [{ resolutionBias: photoOutput }], [photoOutput]);

  const cameraRef = useRef<CameraRef>(null);
  const meterBusy = useRef(false);
  const meterErrorLogged = useRef(false);

  const isFocused = useIsFocused();
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  /** `null` until measured (always on iOS before the first capture). */
  const [light, setLight] = useState<LightVerdict | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [shot, setShot] = useState<Shot | null>(null);
  const [reading, setReading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cameraActive = isFocused && appActive && !shot && !error && permission.hasPermission;

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => setAppActive(state === 'active'));
    return () => sub.remove();
  }, []);

  // Ask once; a refusal falls through to zena's "couldn't open the camera".
  useEffect(() => {
    if (permission.canRequestPermission) permission.requestPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permission.canRequestPermission]);

  useEffect(() => {
    if (!cameraActive) setPreviewReady(false);
  }, [cameraActive]);

  // ─── Light meter ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!HAS_LIVE_METER || !cameraActive || !previewReady) return undefined;
    const id = setInterval(async () => {
      // Never overlap: a slow snapshot simply skips the next tick.
      if (meterBusy.current || !cameraRef.current) return;
      meterBusy.current = true;
      try {
        const snapshot = await cameraRef.current.takeSnapshot();
        const small = await snapshot.resizeAsync(METER_SIZE.width, METER_SIZE.height);
        const encoded = await small.toEncodedImageDataAsync('jpg', 0.6);
        setLight(measureLight(decodeJpeg(new Uint8Array(encoded.buffer))));
      } catch (err) {
        // Once per mount: this runs every second.
        if (!meterErrorLogged.current) {
          meterErrorLogged.current = true;
          logError(toError(err), 'colorimetry/lightMeter');
        }
      } finally {
        meterBusy.current = false;
      }
    }, METER_INTERVAL_MS);
    return () => clearInterval(id);
  }, [cameraActive, previewReady]);

  const onFrameLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setLayout({ width, height });
  }, []);

  // ─── Capture ────────────────────────────────────────────────────────────────
  const capture = async () => {
    if (!layout || capturing) return;
    setCapturing(true);
    try {
      const photo = await photoOutput.capturePhoto({ flashMode: 'off' }, {});
      // Upright and mirrored like the preview: Android bakes orientation and
      // mirroring into the bitmap, iOS carries them as UIImage orientation and
      // the resize below draws them into the pixels. No EXIF is left for
      // jpeg-js to ignore.
      const full = await photo.toImageAsync();
      const crop = coverCrop(full.width, full.height, layout.width, layout.height);
      const scale = fitScale(crop.width, crop.height, MAX_SIDE);
      const resized = await full.resizeAsync(
        Math.max(1, Math.round(full.width * scale)),
        Math.max(1, Math.round(full.height * scale)),
      );
      const cropped = await resized.cropAsync(
        Math.round(crop.x * scale),
        Math.round(crop.y * scale),
        Math.round((crop.x + crop.width) * scale),
        Math.round((crop.y + crop.height) * scale),
      );
      const encoded = await cropped.toEncodedImageDataAsync('jpg', JPEG_QUALITY);
      const bytes = new Uint8Array(encoded.buffer);
      const image = decodeJpeg(bytes);

      const verdict = measureLight(image);
      setLight(verdict);
      // zena never lets a dark frame through; here the photo itself is the check.
      if (verdict === 'dark') return;

      const measurement = measureSkin(image);
      if (!measurement) {
        setError(t('styles.colorimetry.skinError'));
        return;
      }
      onCapture(measurement, bytesToBase64(bytes), 'image/jpeg');
    } catch (err) {
      logError(toError(err), 'colorimetry/capture');
      setError(t('styles.colorimetry.skinError'));
    } finally {
      setCapturing(false);
    }
  };

  // ─── Gallery fallback ───────────────────────────────────────────────────────
  const pickFromGallery = async () => {
    if (reading || capturing) return;
    const res = await openGallery(GALLERY_OPTIONS);
    if (res.status === 'cancelled' || res.status === 'permission_denied') return;
    if (res.status === 'error') {
      setError(t('styles.colorimetry.photoError'));
      return;
    }
    const asset = res.response.assets?.[0];
    if (!asset?.base64 || !asset.uri) {
      setError(t('styles.colorimetry.photoError'));
      return;
    }

    setReading(true);
    // Let the spinner paint before the synchronous decode.
    await new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });
    try {
      const bytes = base64ToBytes(asset.base64);
      if (!isJpeg(bytes)) {
        setError(t('styles.colorimetry.photoError'));
        return;
      }
      const image = decodeJpeg(bytes);
      const measurement = measureSkin(image);
      if (!measurement) {
        setError(t('styles.colorimetry.skinError'));
        return;
      }
      setShot({
        uri: asset.uri,
        base64: asset.base64,
        aspect: image.width / image.height,
        light: measureLight(image),
        measurement,
      });
    } catch (err) {
      logError(toError(err), 'colorimetry/readPhoto');
      setError(t('styles.colorimetry.photoError'));
    } finally {
      setReading(false);
    }
  };

  const permissionModal = blockedPermission ? (
    <PermissionModal type={blockedPermission} onOpenSettings={handleOpenSettings} onDismiss={dismissPermissionModal} />
  ) : null;

  const permissionDenied = permission.status === 'denied' || permission.status === 'restricted';

  // ─── Error (zena's full panel; "Volver" leaves the step) ────────────────────
  if (error || permissionDenied || (permission.hasPermission && !device)) {
    return (
      <View style={styles.errorWrap}>
        <AlertTriangleIcon size={36} color={c.errorIcon} />
        <Text style={[styles.errorText, { color: c.stepText }]}>{error ?? t('styles.colorimetry.cameraError')}</Text>
        <View style={styles.errorActions}>
          {permissionDenied && !error && (
            <Touchable
              onPress={() => Linking.openSettings()}
              borderRadius={12}
              style={[styles.errorBtn, { backgroundColor: c.primaryButton }]}
            >
              <Text style={[styles.errorBtnText, { color: c.primaryButtonText }]}>{t('permissions.openSettings')}</Text>
            </Touchable>
          )}
          <Touchable
            onPress={onCancel}
            borderRadius={12}
            style={[styles.errorBtn, { backgroundColor: c.neutralButtonBackground }]}
          >
            <Text style={[styles.errorBtnText, { color: c.neutralButtonText }]}>{t('styles.colorimetry.goBack')}</Text>
          </Touchable>
        </View>
        {!error && (
          <Touchable onPress={pickFromGallery} borderRadius={12} style={styles.galleryBtn}>
            <ImageIcon size={14} color={c.link} />
            <Text style={[styles.galleryText, { color: c.link }]}>{t('styles.colorimetry.fromGallery')}</Text>
          </Touchable>
        )}
        {permissionModal}
      </View>
    );
  }

  // ─── Gallery photo review ───────────────────────────────────────────────────
  if (shot) {
    const shotDark = shot.light === 'dark';
    return (
      <View style={styles.root}>
        <View style={[styles.frame, { backgroundColor: c.cameraFrameBackground, aspectRatio: shot.aspect }]}>
          <Image source={{ uri: shot.uri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <OvalFrame maskColor={c.ovalMask} strokeColor={shot.light === 'ok' ? c.ovalStrokeOk : c.ovalStrokeWarn} />
          <LightBanner light={shot.light} />
        </View>
        <View style={styles.actions}>
          <Touchable onPress={() => setShot(null)} borderRadius={12} style={styles.ghostBtn}>
            <Text style={[styles.ghostText, { color: c.ghostButtonText }]}>{t('styles.colorimetry.retake')}</Text>
          </Touchable>
          <Touchable
            onPress={() => onCapture(shot.measurement, shot.base64, 'image/jpeg')}
            disabled={shotDark}
            borderRadius={12}
            style={[styles.primaryBtn, { backgroundColor: c.primaryButton }, shotDark && styles.faded]}
          >
            <CameraIcon size={16} color={c.primaryButtonText} />
            <Text style={[styles.primaryText, { color: c.primaryButtonText }]}>{t('styles.colorimetry.analyze')}</Text>
          </Touchable>
        </View>
        {shotDark && <DarkNote textKey="styles.colorimetry.lightDarkRetake" />}
      </View>
    );
  }

  // ─── Live camera ────────────────────────────────────────────────────────────
  const isDark = light === 'dark';
  const ready = previewReady && !!layout;
  // Android blocks while the live meter reads dark, like zena. iOS only learns
  // the light from a capture, so it stays enabled to let the user try again.
  const captureDisabled = !ready || capturing || reading || (HAS_LIVE_METER && isDark);

  return (
    <View style={styles.root}>
      <View style={[styles.frame, styles.liveFrame, { backgroundColor: c.cameraFrameBackground }]} onLayout={onFrameLayout}>
        {device && (
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            outputs={[photoOutput]}
            constraints={constraints}
            isActive={cameraActive}
            mirrorMode="auto"
            resizeMode="cover"
            onPreviewStarted={() => setPreviewReady(true)}
            onPreviewStopped={() => setPreviewReady(false)}
            onError={err => logError(toError(err), 'colorimetry/camera')}
          />
        )}

        {/* The oval guide: outside darkened so the framing is obvious. */}
        <OvalFrame maskColor={c.ovalMask} strokeColor={light === null || light === 'ok' ? c.ovalStrokeOk : c.ovalStrokeWarn} />

        {(!ready || reading) && (
          <View style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: c.cameraLoadingOverlay }]}>
            <ActivityIndicator color={c.lightText} />
          </View>
        )}

        <LightBanner light={light} />
      </View>

      <View style={styles.actions}>
        <Touchable onPress={onCancel} disabled={capturing} borderRadius={12} style={[styles.ghostBtn, capturing && styles.disabled]}>
          <Text style={[styles.ghostText, { color: c.ghostButtonText }]}>{t('styles.colorimetry.goBack')}</Text>
        </Touchable>
        <Touchable
          onPress={capture}
          disabled={captureDisabled}
          borderRadius={12}
          style={[styles.primaryBtn, { backgroundColor: c.primaryButton }, captureDisabled && styles.faded]}
        >
          {capturing ? (
            <ActivityIndicator size="small" color={c.primaryButtonText} />
          ) : (
            <CameraIcon size={16} color={c.primaryButtonText} />
          )}
          <Text style={[styles.primaryText, { color: c.primaryButtonText }]}>{t('styles.colorimetry.analyze')}</Text>
        </Touchable>
      </View>

      {isDark && (
        <DarkNote
          textKey={HAS_LIVE_METER ? 'styles.colorimetry.lightDarkWait' : 'styles.colorimetry.lightDarkRetake'}
        />
      )}

      <Touchable
        onPress={pickFromGallery}
        disabled={capturing || reading}
        borderRadius={12}
        style={[styles.galleryBtn, (capturing || reading) && styles.disabled]}
      >
        <ImageIcon size={14} color={c.link} />
        <Text style={[styles.galleryText, { color: c.link }]}>{t('styles.colorimetry.fromGallery')}</Text>
      </Touchable>

      {permissionModal}
    </View>
  );
}

// zena mobile: max-w-sm aspect-[3/4] rounded-2xl frame, bottom-3 inset-x-3
// banner, gap-3 buttons (flex-1 / flex-[2]), space-y-4.
const styles = StyleSheet.create({
  root: { gap: 16 },
  frame: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  liveFrame: { aspectRatio: 3 / 4 },
  center: { alignItems: 'center', justifyContent: 'center' },
  lightBanner: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lightText: { flex: 1, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ghostBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  ghostText: { fontSize: 14, fontWeight: '600' },
  primaryBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: { fontSize: 14, fontWeight: '700' },
  galleryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 4 },
  galleryText: { fontSize: 13, fontWeight: '700' },
  darkNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  darkNoteText: { fontSize: 11, textAlign: 'center' },
  errorWrap: { alignItems: 'center', paddingVertical: 32, gap: 16 },
  errorText: { fontSize: 14, textAlign: 'center', maxWidth: 320, lineHeight: 20 },
  errorActions: { flexDirection: 'row', gap: 12 },
  errorBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  errorBtnText: { fontSize: 14, fontWeight: '700' },
  faded: { opacity: 0.4 },
  disabled: { opacity: 0.6 },
});

export default ColorimetryCapture;
