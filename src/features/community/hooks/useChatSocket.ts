/**
 * useChatSocket — realtime 1-to-1 chat over the zena chat WebSocket.
 *
 * The backend exposes a Cloudflare Durable Object at `/api/chat/ws`. On connect the
 * DO replays the full message history (snake_case frames) and then broadcasts live
 * messages (camelCase frames) to every connected client. Sending a message is done
 * over the socket — there is no REST endpoint for it.
 *
 * Lifecycle is intentionally scoped to the active, foregrounded chat screen:
 *   - opens on mount,
 *   - closes when the app backgrounds (AppState !== 'active') and reopens on foreground,
 *   - closes on unmount.
 * No background work is performed; "new message while away" is a push-notification concern.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import Config from 'react-native-config';

import { logError } from '@utilities/crashlytics';
import { ChatMessage } from '../types';
import { toIsoTimestamp } from '../api/communityApi';

// The chat WebSocket is NOT served from the app domain (API_URL) — it lives on a
// separate Cloudflare worker, exactly as the zena web client connects to it. We mirror
// its host mapping, derived from API_URL so no extra env var / native rebuild is needed.
// An explicit CHAT_WS_URL override wins if it is ever added to .env.
function deriveChatWsBase(): string {
  const override = Config.CHAT_WS_URL?.trim();
  if (override) return override;
  const apiUrl = Config.API_URL ?? '';
  if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    return 'ws://localhost:8787';
  }
  if (apiUrl.includes('preview')) {
    return 'wss://zena-chat-worker-preview.hernan-mancini.workers.dev';
  }
  return 'wss://zena-chat-worker-production.hernan-mancini.workers.dev';
}

const WS_BASE = deriveChatWsBase();

export type ChatSocketStatus = 'connecting' | 'open' | 'closed';

interface UseChatSocketResult {
  messages: ChatMessage[];
  status: ChatSocketStatus;
  /** Sends a message over the socket. Returns false if the socket is not open. */
  send: (content: string) => boolean;
  /** Merges externally-loaded messages (e.g. REST history) into the thread. */
  addMessages: (messages: ChatMessage[]) => void;
}

/** Maps either a snake_case history frame or a camelCase live frame to a ChatMessage. */
function normalizeFrame(raw: any): ChatMessage | null {
  const id = raw?.id;
  const senderId = raw?.senderId ?? raw?.sender_id;
  const content = raw?.content;
  if (!id || senderId == null || content == null) return null;
  const rawRead = raw?.isRead ?? raw?.is_read;
  return {
    id: String(id),
    senderId: String(senderId),
    content: String(content),
    isRead: rawRead === true || rawRead === 1,
    createdAt: toIsoTimestamp(raw?.createdAt ?? raw?.created_at),
  };
}

function byCreatedAt(a: ChatMessage, b: ChatMessage): number {
  return a.createdAt.localeCompare(b.createdAt);
}

/**
 * Merges one message into the thread: dedups by id, reconciles an optimistic send with
 * its server echo, otherwise inserts in chronological order. Shared by REST history
 * seeding and live socket frames so there is a single merge path.
 */
function mergeOne(prev: ChatMessage[], incoming: ChatMessage, selfId: string): ChatMessage[] {
  if (prev.some(m => m.id === incoming.id)) {
    return prev.map(m => (m.id === incoming.id ? incoming : m));
  }
  if (incoming.senderId === selfId) {
    const idx = prev.findIndex(
      m => m.pending && m.senderId === selfId && m.content === incoming.content,
    );
    if (idx !== -1) {
      const next = [...prev];
      next[idx] = incoming;
      return next;
    }
  }
  return [...prev, incoming].sort(byCreatedAt);
}

export default function useChatSocket(
  conversationId: string | null,
  currentUserId: string,
): UseChatSocketResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatSocketStatus>('connecting');
  const socketRef = useRef<WebSocket | null>(null);
  const optimisticSeq = useRef(0);

  // Reset the thread whenever the conversation changes.
  useEffect(() => {
    setMessages([]);
  }, [conversationId]);

  const handleFrame = useCallback(
    (rawData: string) => {
      let parsed: any;
      try {
        parsed = JSON.parse(rawData);
      } catch {
        return;
      }
      if (parsed?.type === 'error') {
        logError(new Error(`chat socket error: ${parsed.message}`), 'useChatSocket');
        return;
      }
      if (parsed?.type !== 'message') return;
      const incoming = normalizeFrame(parsed);
      if (!incoming) return;
      setMessages(prev => mergeOne(prev, incoming, currentUserId));
    },
    [currentUserId],
  );

  /** Seeds/merges a batch of messages (e.g. REST history) into the thread. */
  const addMessages = useCallback(
    (incoming: ChatMessage[]) => {
      if (!incoming.length) return;
      setMessages(prev => incoming.reduce((acc, m) => mergeOne(acc, m, currentUserId), prev));
    },
    [currentUserId],
  );

  useEffect(() => {
    if (!conversationId || !currentUserId || !WS_BASE) {
      setStatus('closed');
      return undefined;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    // True while the screen is mounted AND foregrounded — gates auto-reconnect.
    let shouldConnect = true;

    const clearReconnect = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const connect = () => {
      if (
        !shouldConnect ||
        (socket &&
          (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING))
      ) {
        return;
      }
      clearReconnect();
      setStatus('connecting');
      const url =
        `${WS_BASE}/api/chat/ws?conversationId=${encodeURIComponent(conversationId)}` +
        `&userId=${encodeURIComponent(currentUserId)}`;
      const next = new WebSocket(url);
      socket = next;
      socketRef.current = next;
      next.onopen = () => setStatus('open');
      next.onmessage = e => handleFrame(e.data as string);
      next.onclose = () => {
        if (socketRef.current === next) socketRef.current = null;
        setStatus('closed');
        // Retry while the screen is active (cold worker / transient drop), like the web client.
        if (shouldConnect) {
          clearReconnect();
          reconnectTimer = setTimeout(connect, 3000);
        }
      };
      // onclose follows an error and handles status + retry; nothing extra needed here.
      next.onerror = () => {};
    };

    const disconnect = () => {
      clearReconnect();
      if (socket) {
        try {
          socket.close();
        } catch {
          // ignore
        }
        socket = null;
      }
      socketRef.current = null;
      setStatus('closed');
    };

    connect();

    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        shouldConnect = true;
        connect();
      } else {
        shouldConnect = false;
        disconnect();
      }
    });

    return () => {
      shouldConnect = false;
      sub.remove();
      disconnect();
    };
  }, [conversationId, currentUserId, handleFrame]);

  const send = useCallback(
    (content: string): boolean => {
      const trimmed = content.trim();
      const socket = socketRef.current;
      if (!trimmed || !conversationId || !socket || socket.readyState !== WebSocket.OPEN) {
        return false;
      }
      socket.send(
        JSON.stringify({
          type: 'message',
          conversationId,
          senderId: currentUserId,
          content: trimmed,
        }),
      );
      optimisticSeq.current += 1;
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}-${optimisticSeq.current}`,
        senderId: currentUserId,
        content: trimmed,
        isRead: false,
        createdAt: new Date().toISOString(),
        pending: true,
      };
      setMessages(prev => [...prev, optimistic]);
      return true;
    },
    [conversationId, currentUserId],
  );

  return { messages, status, send, addMessages };
}
