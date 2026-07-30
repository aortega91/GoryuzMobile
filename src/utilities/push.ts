import { Platform } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

import { store } from '@utilities/store';
import { logError } from '@utilities/crashlytics';
import { requestNotificationPermission } from '@hooks/useNotificationPermission';
import { setPendingDeepLink, DeepLinkKind } from '@features/notifications/deepLinkSlice';
import { navigationRef } from '@navigation/navigationRef';
import i18n from '@language/index';
import { registerPushToken, unregisterPushToken } from './pushApi';

let unsubscribeTokenRefresh: (() => void) | null = null;
let unsubscribeOnMessage: (() => void) | null = null;
let unsubscribeOnNotificationOpened: (() => void) | null = null;
let unsubscribeOnForegroundEvent: (() => void) | null = null;
let hasInitialized = false;

// Minimal shape shared by a real FirebaseMessagingTypes.RemoteMessage (background/
// killed taps) and a notifee foreground-event notification (foreground taps) —
// both carry the same `data.kind`/`data.url` and a notification title.
interface PushTapSource {
  data?: Record<string, unknown>;
  notification?: { title?: string };
}

function parseFriendId(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const query = url.split('?')[1] ?? '';
    return new URLSearchParams(query).get('friendId') ?? undefined;
  } catch {
    return undefined;
  }
}

function handlePushTap(remoteMessage: PushTapSource): void {
  const kind = remoteMessage.data?.kind as DeepLinkKind | undefined;
  if (kind === 'chat_message') {
    store.dispatch(
      setPendingDeepLink({
        kind: 'chat_message',
        friendId: parseFriendId(remoteMessage.data?.url as string | undefined)
          ?? (remoteMessage.data?.senderId as string | undefined),
        friendName: remoteMessage.notification?.title,
      }),
    );
  } else if (kind === 'gems') {
    store.dispatch(setPendingDeepLink({ kind: 'gems' }));
  } else {
    return;
  }

  if (navigationRef.isReady()) {
    navigationRef.navigate('Home');
  }
}

// FCM only auto-displays a system notification for background/killed app state —
// by design, foreground messages just fire onMessage with no UI. Mirror that as a
// real notification here (same channel/icon), so foreground behaves like background.
async function displayForegroundNotification(
  remoteMessage: FirebaseMessagingTypes.RemoteMessage,
): Promise<void> {
  const { title, body } = remoteMessage.notification ?? {};
  if (!title && !body) return;

  await notifee.displayNotification({
    title,
    body,
    data: remoteMessage.data,
    android: {
      channelId: 'goryuz_default',
      smallIcon: 'ic_notification',
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default' },
    },
  });
}

async function registerCurrentToken(): Promise<void> {
  const token = await messaging().getToken();
  await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android', i18n.language);
}

/** Call once, after login (a valid session is required for /push/register). */
export async function initPush(): Promise<void> {
  if (hasInitialized) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  try {
    await registerCurrentToken();
  } catch (err: unknown) {
    logError(err instanceof Error ? err : new Error(String(err)), 'push:register');
  }

  hasInitialized = true;

  unsubscribeTokenRefresh?.();
  unsubscribeTokenRefresh = messaging().onTokenRefresh(async () => {
    try {
      await registerCurrentToken();
    } catch (err: unknown) {
      logError(err instanceof Error ? err : new Error(String(err)), 'push:tokenRefresh');
    }
  });

  unsubscribeOnMessage?.();
  unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
    try {
      await displayForegroundNotification(remoteMessage);
    } catch (err: unknown) {
      logError(err instanceof Error ? err : new Error(String(err)), 'push:foregroundDisplay');
    }
  });

  unsubscribeOnNotificationOpened?.();
  unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(handlePushTap);

  // Tap on a notification we displayed manually (foreground case, above).
  unsubscribeOnForegroundEvent?.();
  unsubscribeOnForegroundEvent = notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS && detail.notification) {
      handlePushTap({
        data: detail.notification.data,
        notification: { title: detail.notification.title },
      });
    }
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    handlePushTap(initialNotification);
  }
}

/** Call before auth().signOut() — the endpoint needs a valid session to authorize the delete. */
export async function teardownPush(): Promise<void> {
  try {
    const token = await messaging().getToken();
    await unregisterPushToken(token);
  } catch (err: unknown) {
    logError(err instanceof Error ? err : new Error(String(err)), 'push:unregister');
  } finally {
    unsubscribeTokenRefresh?.();
    unsubscribeOnMessage?.();
    unsubscribeOnNotificationOpened?.();
    unsubscribeOnForegroundEvent?.();
    unsubscribeTokenRefresh = null;
    unsubscribeOnMessage = null;
    unsubscribeOnNotificationOpened = null;
    unsubscribeOnForegroundEvent = null;
    hasInitialized = false;
  }
}
