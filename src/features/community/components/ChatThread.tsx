/**
 * ChatThread — the active 1-to-1 conversation view.
 *
 * Mounting this component opens the chat WebSocket; unmounting (backing out of the
 * thread) closes it, which is exactly the "socket only while the messages screen is
 * active" behaviour we want. History + live messages stream in over the socket.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { MessageIcon, SendIcon } from '@assets/icons';
import useCommunityTheme from '@hooks/useCommunityTheme';
import { logApiError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import { Conversation } from '../types';
import { fetchMessages, markConversationRead } from '../api/communityApi';
import useChatSocket from '../hooks/useChatSocket';

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

type Props = {
  conversation: Conversation;
  currentUserId: string;
  /** Called after messages are marked read so the parent can refresh unread badges. */
  onRead: () => void;
};

function ChatThread({ conversation, currentUserId, onRead }: Props) {
  const c = useCommunityTheme().community;
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { messages, status, send, addMessages } = useChatSocket(conversation.id, currentUserId);
  const [input, setInput] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const listRef = useRef<FlatList>(null);

  // Load history via REST (independent of the realtime worker); the socket then takes
  // over for live messages, deduped against this history by message id.
  useEffect(() => {
    let cancelled = false;
    setHistoryLoading(true);
    fetchMessages(conversation.id)
      .then(history => {
        if (!cancelled) addMessages(history);
      })
      .catch(err => logApiError('/chat/messages', err))
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [conversation.id, addMessages]);

  const markRead = useCallback(() => {
    markConversationRead(conversation.id, currentUserId)
      .then(onRead)
      .catch(err => logApiError('/chat/read', err));
  }, [conversation.id, currentUserId, onRead]);

  // Mark read on entering the conversation.
  useEffect(() => {
    markRead();
  }, [markRead]);

  // Mark read again whenever a new message from the other user arrives while viewing.
  const lastCount = useRef(0);
  useEffect(() => {
    if (messages.length > lastCount.current) {
      const last = messages[messages.length - 1];
      if (last && last.senderId !== currentUserId && !last.pending) markRead();
    }
    lastCount.current = messages.length;
  }, [messages, currentUserId, markRead]);

  const handleSend = () => {
    if (send(input)) {
      setInput('');
    } else {
      toast.error(t('community.sendFailed'));
    }
  };

  const connecting = historyLoading && messages.length === 0;
  // Allow attempting to send regardless of socket state — send() returns false if the
  // socket is down and we surface a toast, which is clearer than a disabled button.
  const canSend = input.trim().length > 0;
  const statusLabel =
    status === 'open'
      ? null
      : status === 'connecting'
        ? t('community.chatConnecting')
        : t('community.chatReconnecting');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {statusLabel ? (
        <View style={[styles.statusBar, { backgroundColor: c.searchBackground }]}>
          <ActivityIndicator size="small" color={c.tabActiveIndicator} />
          <Text style={[styles.statusText, { color: c.cardSubtitle }]}>{statusLabel}</Text>
        </View>
      ) : null}

      {connecting ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={c.tabActiveIndicator} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={m => m.id}
          style={styles.list}
          contentContainerStyle={styles.messagesList}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MessageIcon size={40} color={c.emptyIcon} strokeWidth={1.5} />
              <Text style={[styles.emptyText, { color: c.emptyText }]}>
                {t('community.noMessages')}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.senderId === currentUserId;
            return (
              <View style={[styles.bubbleRow, isMe ? styles.bubbleRowMe : styles.bubbleRowThem]}>
                <View
                  style={[
                    styles.bubble,
                    isMe ? styles.bubbleMe : styles.bubbleThem,
                    { backgroundColor: isMe ? c.bubbleMe : c.bubbleThem },
                    item.pending && styles.bubblePending,
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: isMe ? c.bubbleMeText : c.bubbleThemText }]}>
                    {item.content}
                  </Text>
                </View>
                <Text style={[styles.bubbleTime, { color: c.timestampText }]}>
                  {formatTime(item.createdAt)}
                </Text>
              </View>
            );
          }}
        />
      )}

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: c.chatInputBackground,
            borderTopColor: c.chatInputBorder,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { backgroundColor: c.searchBackground, borderColor: c.chatInputBorder, color: c.chatInputText }]}
          placeholder={t('community.messagePlaceholder')}
          placeholderTextColor={c.chatInputPlaceholder}
          value={input}
          onChangeText={setInput}
          multiline
        />
        <Touchable
          style={[styles.sendBtn, { backgroundColor: c.sendButton }, !canSend && styles.sendBtnDisabled]}
          onPress={handleSend}
          borderRadius={22}
          disabled={!canSend}
        >
          <SendIcon size={18} color={c.sendButtonIcon} strokeWidth={2} />
        </Touchable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  loaderWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  statusText: { fontSize: 12, fontWeight: '500' },
  messagesList: { padding: 16, gap: 8, flexGrow: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { fontSize: 15, fontWeight: '600', textAlign: 'center' },
  bubbleRow: { maxWidth: '80%', gap: 2 },
  bubbleRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubbleRowThem: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 9 },
  bubbleMe: { borderTopRightRadius: 4 },
  bubbleThem: { borderTopLeftRadius: 4 },
  bubblePending: { opacity: 0.6 },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTime: { fontSize: 10, marginHorizontal: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.45 },
});

export default ChatThread;
