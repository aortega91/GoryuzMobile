import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import {
  check,
  request,
  openSettings,
  PERMISSIONS,
  RESULTS,
  type Permission,
} from 'react-native-permissions';
import { launchCamera, launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';

import { logError } from '@utilities/crashlytics';
import { PermissionType } from '@components/PermissionModal';

// ─── Platform-specific permission names ───────────────────────────────────────

const CAMERA_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

const PHOTO_PERMISSION =
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.PHOTO_LIBRARY
    : PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;

// ─── Types ────────────────────────────────────────────────────────────────────

type LaunchResult =
  | { status: 'success'; response: ImagePickerResponse }
  | { status: 'cancelled' }
  | { status: 'permission_denied'; type: PermissionType }
  | { status: 'error'; message: string };

// ─── Hook ─────────────────────────────────────────────────────────────────────

function useCameraPermission() {
  const [blockedPermission, setBlockedPermission] = useState<PermissionType | null>(null);

  // ─── Shared permission gate ─────────────────────────────────────────────────

  const ensurePermission = useCallback(
    async (
      permission: Permission,
      type: PermissionType,
    ): Promise<'granted' | 'denied' | 'blocked'> => {
      const status = await check(permission);

      switch (status) {
        case RESULTS.GRANTED:
        case RESULTS.LIMITED:
          return 'granted';

        case RESULTS.DENIED: {
          // Not yet asked or asked once (Android allows one more request)
          const next = await request(permission);
          if (next === RESULTS.GRANTED || next === RESULTS.LIMITED) {
            return 'granted';
          }
          if (next === RESULTS.BLOCKED) {
            setBlockedPermission(type);
            return 'blocked';
          }
          // Still denied — user can try again next time; do nothing this round
          return 'denied';
        }

        case RESULTS.BLOCKED:
        case RESULTS.UNAVAILABLE:
          setBlockedPermission(type);
          return 'blocked';

        default:
          return 'denied';
      }
    },
    [],
  );

  // ─── Camera ─────────────────────────────────────────────────────────────────

  const openCamera = useCallback(async (): Promise<LaunchResult> => {
    try {
      const perm = await ensurePermission(CAMERA_PERMISSION, 'camera');
      if (perm !== 'granted') {
        return { status: perm === 'blocked' ? 'permission_denied' : 'cancelled', type: 'camera' } as LaunchResult;
      }

      const response = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      });

      if (response.didCancel) {
        return { status: 'cancelled' };
      }
      if (response.errorCode) {
        return { status: 'error', message: response.errorMessage ?? 'Camera error' };
      }

      return { status: 'success', response };
    } catch (err: unknown) {
      logError(err instanceof Error ? err : new Error(String(err)), 'openCamera');
      return { status: 'error', message: String(err) };
    }
  }, [ensurePermission]);

  // ─── Gallery ─────────────────────────────────────────────────────────────────

  const openGallery = useCallback(async (): Promise<LaunchResult> => {
    try {
      const perm = await ensurePermission(PHOTO_PERMISSION, 'photo');
      if (perm !== 'granted') {
        return { status: perm === 'blocked' ? 'permission_denied' : 'cancelled', type: 'photo' } as LaunchResult;
      }

      const response = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.8,
      });

      if (response.didCancel) {
        return { status: 'cancelled' };
      }
      if (response.errorCode) {
        return { status: 'error', message: response.errorMessage ?? 'Gallery error' };
      }

      return { status: 'success', response };
    } catch (err: unknown) {
      logError(err instanceof Error ? err : new Error(String(err)), 'openGallery');
      return { status: 'error', message: String(err) };
    }
  }, [ensurePermission]);

  // ─── Settings redirect ────────────────────────────────────────────────────────

  const handleOpenSettings = useCallback(() => {
    openSettings();
    setBlockedPermission(null);
  }, []);

  const dismissPermissionModal = useCallback(() => {
    setBlockedPermission(null);
  }, []);

  return {
    openCamera,
    openGallery,
    blockedPermission,
    dismissPermissionModal,
    handleOpenSettings,
  };
}

export default useCameraPermission;
