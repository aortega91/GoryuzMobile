import { useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import { logError } from '@utilities/crashlytics';

// Requests OS-level push permission. Unlike camera/photo/location, denial here
// doesn't block any in-progress user action, so there's no blocked-state modal —
// the app just won't register a token and the user silently gets no pushes.
// Exported as a plain function too so non-component code (e.g. src/utilities/push.ts)
// can call it without needing a hook.
//
// POST_NOTIFICATIONS (Android 13+) is requested via RN core's PermissionsAndroid
// rather than react-native-permissions — the installed version (5.5.1) doesn't
// expose it as a typed constant.
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return (
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL
      );
    }

    // Android < 13 doesn't require a runtime notification permission.
    if (Platform.OS === 'android' && Platform.Version < 33) {
      return true;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err: unknown) {
    logError(err instanceof Error ? err : new Error(String(err)), 'requestNotificationPermission');
    return false;
  }
}

function useNotificationPermission() {
  return { requestNotificationPermission: useCallback(requestNotificationPermission, []) };
}

export default useNotificationPermission;
