import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';

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
      <TouchableOpacity
        onPress={onMenuPress}
        style={styles.iconButton}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <MenuIcon size={22} color={t.topBarIcon} />
      </TouchableOpacity>

      {/* Center — location */}
      {location ? (
        <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
          <MapPinIcon size={14} color={t.topBarIcon} />
          <Text
            style={[styles.locationText, { color: t.topBarText }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.locationRow} />
      )}

      {/* Right — gem counter + message + bell + avatar */}
      <View style={styles.rightRow}>
        {/* Gem badge */}
        <TouchableOpacity
          onPress={onGemPress}
          style={[
            styles.gemBadge,
            {
              backgroundColor: t.gemBadgeBg,
              borderColor: t.gemBadgeBorder,
            },
          ]}
          activeOpacity={0.8}
        >
          <GemIcon size={14} color={t.gemBadgeText} strokeWidth={2} />
          <Text style={[styles.gemCount, { color: t.gemBadgeText }]}>
            {gemCount}
          </Text>
        </TouchableOpacity>

        {/* Message */}
        <TouchableOpacity
          onPress={onMessagePress}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <MessageIcon size={20} color={t.topBarIcon} />
        </TouchableOpacity>

        {/* Bell */}
        <TouchableOpacity
          onPress={onNotificationPress}
          style={styles.iconButton}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <BellIcon size={20} color={t.topBarIcon} />
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          onPress={onAvatarPress}
          activeOpacity={0.8}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: t.gemBadgeBg },
              ]}
            />
          )}
        </TouchableOpacity>
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
  locationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginHorizontal: 8,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    opacity: 0.4,
  },
});

export default TopBar;
