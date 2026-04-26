import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import {
  FlameIcon,
  MessageIcon,
  BookmarkIcon,
  Share2Icon,
  ShirtIcon,
} from '@assets/icons';
import { FeedPost as FeedPostType } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GEM_STYLE_DISCOVER = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActionBtnProps {
  children: React.ReactNode;
  count?: number;
  onPress: () => void;
}

function ActionBtn({ children, count, onPress }: ActionBtnProps) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIconBg}>{children}</View>
      {count !== undefined && (
        <Text style={styles.actionCount}>{formatCount(count)}</Text>
      )}
    </TouchableOpacity>
  );
}

interface GemBtnProps {
  children: React.ReactNode;
  gemCost: number;
  onPress: () => void;
}

function GemBtn({ children, gemCost, onPress }: GemBtnProps) {
  return (
    <TouchableOpacity style={styles.actionItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.actionIconBg}>{children}</View>
      <View style={styles.gemBadge}>
        <Text style={styles.gemBadgeText}>{gemCost}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface FeedPostProps {
  post: FeedPostType;
  height: number;
}

function FeedPost({ post, height }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [saveCount, setSaveCount] = useState(post.saves);

  const handleLike = () => {
    setLikeCount(c => (isLiked ? c - 1 : c + 1));
    setIsLiked(v => !v);
  };

  const handleSave = () => {
    setSaveCount(c => (isSaved ? c - 1 : c + 1));
    setIsSaved(v => !v);
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Background image */}
      <Image
        source={{ uri: post.imageUrl }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />

      {/* Bottom gradient overlay (stair-stepped approximation) */}
      <View style={styles.gradientOverlay} pointerEvents="none">
        <View style={styles.gradientStep1} />
        <View style={styles.gradientStep2} />
        <View style={styles.gradientStep3} />
        <View style={styles.gradientStep4} />
      </View>

      {/* Right: action buttons */}
      <View style={styles.rightActions}>
        {/* User mini-avatar */}
        <Image source={{ uri: post.user.avatarUrl }} style={styles.userAvatarSmall} />

        <ActionBtn count={likeCount} onPress={handleLike}>
          <FlameIcon size={22} color={isLiked ? '#FF6B35' : '#ffffff'} strokeWidth={2} filled={isLiked} />
        </ActionBtn>

        <ActionBtn count={post.comments} onPress={() => {}}>
          <MessageIcon size={22} color="#ffffff" strokeWidth={2} />
        </ActionBtn>

        <ActionBtn count={saveCount} onPress={handleSave}>
          <BookmarkIcon size={22} color={isSaved ? '#818CF8' : '#ffffff'} strokeWidth={2} filled={isSaved} />
        </ActionBtn>

        <ActionBtn onPress={() => {}}>
          <Share2Icon size={22} color="#ffffff" strokeWidth={2} />
        </ActionBtn>

        {!post.isOwn && (
          <GemBtn gemCost={GEM_STYLE_DISCOVER} onPress={() => {}}>
            <ShirtIcon size={22} color="#ffffff" strokeWidth={2} />
          </GemBtn>
        )}
      </View>

      {/* Bottom: user info + caption */}
      <View style={styles.bottomInfo}>
        <View style={styles.userRow}>
          <Image source={{ uri: post.user.avatarUrl }} style={styles.userAvatarBottom} />
          <Text style={styles.handle}>@{post.user.handle}</Text>
          <Text style={styles.timestamp}>{post.timestamp}</Text>
        </View>
        <Text style={styles.caption} numberOfLines={2}>
          {post.caption}
        </Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  // Stair-stepped bottom overlay simulating a gradient
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
    flexDirection: 'column',
  },
  gradientStep1: { flex: 1, backgroundColor: 'rgba(0,0,0,0.00)' },
  gradientStep2: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  gradientStep3: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  gradientStep4: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)' },
  // Right action column
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 4,
  },
  userAvatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginBottom: 8,
  },
  actionItem: {
    alignItems: 'center',
    marginVertical: 4,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCount: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gemBadge: {
    backgroundColor: 'rgba(99,102,241,0.85)',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 2,
  },
  gemBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  // Bottom user info
  bottomInfo: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 72,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  userAvatarBottom: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  handle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
  },
  caption: {
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default FeedPost;
