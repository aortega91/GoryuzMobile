/**
 * notificationsApi.ts — Notification history (server-side bell)
 *
 * Mirrors zena's `/api/notifications`. The history rows are written by the
 * `goryuz-notifications` worker at send time (see zena
 * workers/notifications/src/push/history.ts), *before* it talks to FCM and
 * regardless of whether delivery succeeds: the history records that the event
 * happened, not that it was delivered. That is what makes the bell useful to a
 * user who dismissed the system notification, reinstalled, or never granted
 * notification permission at all.
 *
 * The worker prunes to the 20 most recent rows per user, so GET returns the
 * whole list and there is nothing to paginate.
 */

import { apiGet, apiPut, apiDelete } from '@api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Push categories the worker can record. Mirrors zena's `PushKind`. */
export type NotificationKind =
  | 'gems'
  | 'chat_message'
  | 'closet_ready'
  | 'custom';

export interface ServerNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  /** Web deep link, e.g. `/?view=messages&friendId=…`. Null for plain notices. */
  url: string | null;
  read: boolean;
  /**
   * Creation time, and it is NOT the epoch-seconds number zena's own client
   * type claims: `user_notifications.created_at` is declared `mode:
   * "timestamp"` in the Drizzle schema, so a selected row comes back as a Date
   * and serialises to an ISO string over the wire. Typed as both because a raw
   * number is still what the column holds. Parse via the slice's
   * `toIsoTimestamp`, never by multiplying.
   */
  createdAt: number | string;
}

/** Every mutating endpoint targets either one notification or all of them. */
export type NotificationScope = { id: string } | { all: true };

// ─── Calls ────────────────────────────────────────────────────────────────────

/** GET /notifications — the user's 20 most recent push notifications. */
export async function fetchNotifications(): Promise<ServerNotification[]> {
  const data = await apiGet<{ notifications: ServerNotification[] }>(
    '/notifications',
  );
  return data.notifications ?? [];
}

/** PUT /notifications — mark one notification read, or all of them. */
export function markNotificationsRead(scope: NotificationScope) {
  return apiPut<{ success: boolean }>('/notifications', scope);
}

/** DELETE /notifications — discard one notification, or all of them. */
export function deleteNotifications(scope: NotificationScope) {
  return apiDelete<{ success: boolean }>('/notifications', scope);
}
