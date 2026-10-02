import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { ChevronDownIcon, HistoryIcon, MessageIcon } from '@assets/icons';
import useStylesTheme from '@hooks/useStylesTheme';
import useRequest from '@hooks/useRequest';
import { fetchStylistChatHistory, StylistChatSession } from '../../api/stylistChatApi';

/** Past stylist sessions (zena ChatModal's "history" tab), fetched when the tab opens. */
function StylistChatHistory() {
  const { t, i18n } = useTranslation();
  const { styles: s } = useStylesTheme();
  const { data, loading, error, refetch } = useRequest(fetchStylistChatHistory);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={s.chatTypingDot} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.emptyDesc, { color: s.chatSubtitle }]}>{t('styles.stylistChat.historyError')}</Text>
        <Touchable onPress={refetch} borderRadius={12} style={styles.retry}>
          <Text style={[styles.retryText, { color: s.chatHeaderIconActive }]}>{t('styles.stylistChat.retry')}</Text>
        </Touchable>
      </View>
    );
  }

  const sessions = data ?? [];
  if (sessions.length === 0) {
    return (
      <View style={styles.center}>
        <View style={[styles.emptyIcon, { backgroundColor: s.chatHistoryCardBackground }]}>
          <HistoryIcon size={32} color={s.chatHeaderIcon} />
        </View>
        <Text style={[styles.emptyTitle, { color: s.chatHistoryTitle }]}>{t('styles.stylistChat.noHistory')}</Text>
        <Text style={[styles.emptyDesc, { color: s.chatSubtitle }]}>{t('styles.stylistChat.noHistoryDesc')}</Text>
      </View>
    );
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const renderSession = ({ item }: { item: StylistChatSession }) => {
    const expanded = expandedId === item.id;
    return (
      <View style={[styles.card, { backgroundColor: s.chatHistoryCardBackground, borderColor: s.chatHistoryCardBorder }]}>
        <Touchable
          onPress={() => setExpandedId(prev => (prev === item.id ? null : item.id))}
          borderRadius={16}
          style={styles.cardHead}
        >
          <View style={[styles.cardIcon, { backgroundColor: s.chatHistoryIconBackground }]}>
            <MessageIcon size={18} color={s.chatHistoryIcon} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: s.chatHistoryTitle }]}>{formatDate(item.startTime)}</Text>
            <Text style={[styles.cardMeta, { color: s.chatHistoryMeta }]}>
              {t('styles.stylistChat.messageCount', { count: item.messages.length })}
            </Text>
          </View>
          <View style={expanded && styles.chevronOpen}>
            <ChevronDownIcon size={18} color={s.chatHeaderIcon} />
          </View>
        </Touchable>
        {expanded && (
          <View style={[styles.thread, { borderTopColor: s.chatHistoryCardBorder }]}>
            {item.messages.map(m => {
              const isUser = m.role === 'user';
              return (
                <View
                  key={m.id}
                  style={[
                    styles.bubble,
                    isUser
                      ? [styles.bubbleUser, { backgroundColor: s.chatUserBubble }]
                      : [styles.bubbleModel, { backgroundColor: s.chatBackground, borderColor: s.chatHistoryCardBorder }],
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: isUser ? s.chatUserBubbleText : s.chatModelBubbleText }]}>
                    {m.text}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={sessions}
      keyExtractor={item => item.id}
      renderItem={renderSession}
      style={styles.root}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 6 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyTitle: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  emptyDesc: { fontSize: 13, textAlign: 'center' },
  retry: { paddingHorizontal: 16, paddingVertical: 8, marginTop: 6 },
  retryText: { fontSize: 14, fontWeight: '700' },
  list: { padding: 16, gap: 12 },
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  cardIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardMeta: { fontSize: 12 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  thread: { borderTopWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
  bubble: { maxWidth: '85%', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 16 },
  bubbleUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  bubbleModel: { alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
});

export default StylistChatHistory;
