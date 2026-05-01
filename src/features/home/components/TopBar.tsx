import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';

import Touchable from '@components/Touchable';
import { getImageSource } from '@api/client';

import useHomeTheme from '@hooks/useHomeTheme';
import {
  MenuIcon,
  MapPinIcon,
  GemIcon,
  MessageIcon,
  BellIcon,
} from '@assets/icons';

interface TopBarProps {
  onMenuPress: () => void;
  location?: string;
  gemCount?: number;
  onGemPress?: () => void;
  onMessagePress?: () => void;
  onNotificationPress?: () => void;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
  unreadMessages?: number;
}

function TopBar({
  onMenuPress,
  location,
  gemCount = 0,
  onGemPress,
  onMessagePress,
  onNotificationPress,
  avatarUrl,
  onAvatarPress,
  unreadMessages = 0,
}: TopBarProps) {
  const theme = useHomeTheme();
  const t = theme.home;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: t.topBarBackground,
          borderBottomColor: t.topBarBorder,
        },
      ]}
    >
      {/* Left — hamburger */}
      <Touchable onPress={onMenuPress} style={styles.iconButton}>
        <MenuIcon size={22} color={t.topBarIcon} />
      </Touchable>

      {/* Center — location pill */}
      {location ? (
        <Touchable
          style={[
            styles.locationPill,
            {
              backgroundColor: t.locationPillBg,
              borderColor: t.locationPillBorder,
            },
          ]}
          borderRadius={20}
        >
          <MapPinIcon size={13} color={t.locationPinColor} />
          <Text
            style={[styles.locationText, { color: t.topBarText }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </Touchable>
      ) : (
        <View style={styles.locationPill} />
      )}

      {/* Right — gem counter + message + bell + avatar */}
      <View style={styles.rightRow}>
        {/* Gem badge */}
        <Touchable
          onPress={onGemPress}
          style={[
            styles.gemBadge,
            {
              backgroundColor: t.gemBadgeBg,
              borderColor: t.gemBadgeBorder,
            },
          ]}
          borderRadius={20}
        >
          <GemIcon size={14} color={t.gemBadgeText} strokeWidth={2} />
          <Text style={[styles.gemCount, { color: t.gemBadgeText }]}>
            {gemCount}
          </Text>
        </Touchable>

        {/* Message */}
        <Touchable
          onPress={onMessagePress}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <MessageIcon size={20} color={t.topBarIcon} />
          {unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadMessages > 9 ? '9+' : String(unreadMessages)}
              </Text>
            </View>
          )}
        </Touchable>

        {/* Bell */}
        <Touchable
          onPress={onNotificationPress}
          style={styles.iconButton}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <BellIcon size={20} color={t.topBarIcon} />
        </Touchable>

        {/* Avatar */}
        <Touchable
          onPress={onAvatarPress}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          borderRadius={16}
        >
          {avatarUrl ? (
            <Image source={getImageSource(avatarUrl)} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: t.gemBadgeBg },
              ]}
            />
          )}
        </Touchable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    padding: 4,
  },
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    maxWidth: 160,
    alignSelf: 'center',
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  gemCount: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  avatarPlaceholder: {
    opacity: 0.4,
  },
});

export default TopBar;
