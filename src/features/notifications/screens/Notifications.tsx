import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useNotificationsTheme from '@hooks/useNotificationsTheme';
import { BellIcon, CloseIcon } from '@assets/icons';
import { AppDispatch, RootState } from '@utilities/store';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  AppNotification,
} from '../notificationsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(isoString: string, t: ReturnType<typeof useTranslation>['t']): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return t('notifications.justNow');
  if (minutes < 60) return t('notifications.minutesAgo', { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('notifications.hoursAgo', { count: hours });
  const days = Math.floor(hours / 24);
  return t('notifications.daysAgo', { count: days });
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface ItemProps {
  item: AppNotification;
  onRead: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof useNotificationsTheme>['notifications'];
}

function NotificationItem({ item, onRead, onDelete, colors }: ItemProps) {
  const { t } = useTranslation();
  return (
    <Touchable
      onPress={onRead}
      borderRadius={16}
      style={[
        styles.item,
        {
          backgroundColor: item.read ? colors.itemBackground : colors.itemUnreadBackground,
          borderColor: colors.itemBorder,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: item.read ? 'transparent' : colors.unreadDot }]} />
      <View style={styles.itemBody}>
        <Text style={[styles.itemText, { color: colors.text }]}>{item.text}</Text>
        <Text style={[styles.itemTime, { color: colors.timestamp }]}>
          {relativeTime(item.timestamp, t)}
        </Text>
      </View>
      <Touchable onPress={onDelete} hitSlop={8} borderRadius={16} style={styles.deleteBtn}>
        <CloseIcon size={16} color={colors.deleteIcon} />
      </Touchable>
    </Touchable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
}

function Notifications({ onClose }: Props) {
  const { t } = useTranslation();
  const theme = useNotificationsTheme();
  const c = theme.notifications;
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => state.notifications.items);

  const unreadCount = items.filter(n => !n.read).length;

  return (
    <View style={[styles.root, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.headerBorder }]}>
        <Touchable onPress={onClose} hitSlop={8} borderRadius={20} style={styles.backBtn}>
          <CloseIcon size={20} color={c.headerTitle} />
        </Touchable>
        <Text style={[styles.headerTitle, { color: c.headerTitle }]}>
          {t('notifications.title')}
        </Text>
        {unreadCount > 0 ? (
          <Touchable onPress={() => dispatch(markAllAsRead())} hitSlop={8} borderRadius={8} style={styles.markAllBtn}>
            <Text style={[styles.markAllText, { color: c.markAllText }]}>
              {t('notifications.markAllRead')}
            </Text>
          </Touchable>
        ) : (
          <View style={styles.markAllBtn} />
        )}
      </View>

      {/* List */}
      <FlatList
        data={items}
        keyExtractor={n => n.id}
        contentContainerStyle={[styles.list, items.length === 0 && styles.listEmpty]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            colors={c}
            onRead={() => dispatch(markAsRead(item.id))}
            onDelete={() => dispatch(deleteNotification(item.id))}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <BellIcon size={56} color={c.emptyIcon} strokeWidth={1.25} />
            <Text style={[styles.emptyText, { color: c.emptyText }]}>
              {t('notifications.empty')}
            </Text>
            <Text style={[styles.emptySubtext, { color: c.emptySubtext }]}>
              {t('notifications.emptyDesc')}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  backBtn: { padding: 2 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  markAllBtn: { minWidth: 80, alignItems: 'flex-end' },
  markAllText: { fontSize: 13, fontWeight: '600' },

  list: { padding: 16, gap: 10 },
  listEmpty: { flex: 1 },

  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  itemBody: { flex: 1, gap: 4 },
  itemText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  itemTime: { fontSize: 12 },
  deleteBtn: { padding: 2, marginTop: 2 },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyText: { fontSize: 17, fontWeight: '700', textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

export default Notifications;
