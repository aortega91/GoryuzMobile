/**
 * deepLink.ts — Notification → screen resolution
 *
 * A notification reaches the app by two routes that must land on the same
 * screen: the system notification (FCM `data.url`, tapped from background or a
 * killed app) and the row in the in-app bell (the `url` column of the history
 * table). Both carry the web deep link the worker built in
 * zena/workers/notifications/src/push/messages.ts, so both resolve through
 * here — mirroring `applyDeepLink` in zena's App.tsx.
 *
 * The links are web-shaped (`/?view=messages&friendId=…`) because the same
 * push is delivered to the browser. The `view` is what maps to a module; the
 * remaining params say what to open inside it.
 */

import { ActiveModule } from '@features/home/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PendingDeepLink {
  module: ActiveModule;
  /** Community only — open Messages on this conversation. */
  friendId?: string;
  friendName?: string;
}

/** What the notification carried, from an FCM `data` block or a history row. */
export interface DeepLinkSource {
  /** Web deep link, e.g. `/?view=messages&friendId=…`. */
  url?: string;
  /** Push category, the fallback when a push arrives with no usable url. */
  kind?: string;
  /** Sender name for a chat push — the push title is the sender. */
  title?: string;
  /** Sender id, sent in the FCM data block alongside the url. */
  senderId?: string;
}

// ─── View → module ────────────────────────────────────────────────────────────

/**
 * Only views that map to a module a user can otherwise reach. `lookbook`
 * (home) and `discover` are deliberately absent: they are hidden from the
 * drawer, and a push should not be the one way back into them.
 *
 * `closet` covers zena's `closet_ready`. The bulk-ingest review it deep-links
 * into is not ported, so that push opens the collection and stops there.
 */
const VIEW_TO_MODULE: Partial<Record<string, ActiveModule>> = {
  profile: 'profile',
  messages: 'community',
  community: 'community',
  closet: 'closet',
  schedule: 'schedule',
  styles: 'styles',
  second_life: 'second_life',
  support: 'support',
  subscription: 'subscription',
};

/** Kind → view, for a push whose url is missing or not one we understand. */
const KIND_TO_VIEW: Partial<Record<string, string>> = {
  chat_message: 'messages',
  gems: 'profile',
  closet_ready: 'closet',
};

// ─── Resolution ───────────────────────────────────────────────────────────────

/**
 * The two sources spell the same link differently: FCM's `data.url` is made
 * absolute by the worker (`https://…/?view=…`), while the history row keeps
 * the relative form. Reading from the `?` onwards handles both.
 */
function paramsOf(url: string): URLSearchParams {
  const query = url.slice(url.indexOf('?') + 1);
  return new URLSearchParams(url.includes('?') ? query : '');
}

/**
 * Works out which screen a notification should open, or null when it maps
 * nowhere — a plain notice with no destination, which should just be marked
 * read where it sits.
 */
export function resolveDeepLink(source: DeepLinkSource): PendingDeepLink | null {
  const params = source.url ? paramsOf(source.url) : new URLSearchParams();
  const view = params.get('view') ?? (source.kind ? KIND_TO_VIEW[source.kind] : undefined);
  const module = view ? VIEW_TO_MODULE[view] : undefined;
  if (!module) return null;

  if (view === 'messages') {
    return {
      module,
      // The url is authoritative; `senderId` is what an older push carries.
      friendId: params.get('friendId') ?? source.senderId,
      friendName: source.title,
    };
  }

  return { module };
}
