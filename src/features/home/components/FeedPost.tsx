import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
} from 'react-native';

import Touchable from '@components/Touchable';
import {
  FlameIcon,
  MessageIcon,
  BookmarkIcon,
  Share2Icon,
  SparklesIcon,
  ZapIcon,
  CloseIcon,
} from '@assets/icons';
import { FeedPost as FeedPostType } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const GEM_STYLE_DISCOVER = 3;
const GEM_MARKET_SCAN = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCount(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ActionBtnProps {
  children: React.ReactNode;
  count?: number;
  onPress: () => void;
}

function ActionBtn({ children, count, onPress }: ActionBtnProps) {
  return (
    <Touchable style={styles.actionItem} onPress={onPress} borderRadius={22}>
      <View style={styles.actionIconBg}>{children}</View>
      {count !== undefined && (
        <Text style={styles.actionCount}>{formatCount(count)}</Text>
      )}
    </Touchable>
  );
}

interface GemBtnProps {
  children: React.ReactNode;
  gemCost: number;
  label: string;
  onPress: () => void;
}

function GemBtn({ children, gemCost, label, onPress }: GemBtnProps) {
  return (
    <Touchable style={styles.actionItem} onPress={onPress} borderRadius={22}>
      <View style={styles.actionIconBg}>{children}</View>
      <View style={styles.gemBadge}>
        <Text style={styles.gemBadgeText}>{gemCost}</Text>
      </View>
      <Text style={styles.actionCount} numberOfLines={1}>{label}</Text>
    </Touchable>
  );
}

// ─── Style Discover Overlay ───────────────────────────────────────────────────

interface StyleOverlayProps {
  post: FeedPostType;
  onClose: () => void;
}

function StyleDiscoverOverlay({ post, onClose }: StyleOverlayProps) {
  const keywords = post.categories ?? [];
  return (
    <View style={styles.aiOverlay}>
      <View style={styles.aiSheet}>
        <View style={styles.aiSheetHeader}>
          <View style={styles.aiSheetTitleRow}>
            <SparklesIcon size={16} color="#818CF8" strokeWidth={2} />
            <Text style={styles.aiSheetTitle}>Descubrir Estilo</Text>
          </View>
          <Touchable onPress={onClose} borderRadius={14} hitSlop={10}>
            <CloseIcon size={18} color="rgba(255,255,255,0.6)" strokeWidth={2} />
          </Touchable>
        </View>

        {keywords.length > 0 && (
          <View style={styles.aiChips}>
            {keywords.map(k => (
              <View key={k} style={styles.aiChip}>
                <Text style={styles.aiChipText}>#{k}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.aiBody}>
          {post.aiPrompt ?? 'Análisis de estilo no disponible.'}
        </Text>

        <View style={styles.aiCopyRow}>
          <SparklesIcon size={12} color="#818CF8" strokeWidth={2} />
          <Text style={styles.aiCopyHint}>Prompt copiado al portapapeles</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Market Scan Overlay ──────────────────────────────────────────────────────

function MarketScanOverlay({ post, onClose }: StyleOverlayProps) {
  const pieces = [
    ...(post.clothingItems ?? []),
    ...(post.accessories ?? []),
  ];
  return (
    <View style={styles.aiOverlay}>
      <View style={styles.aiSheet}>
        <View style={styles.aiSheetHeader}>
          <View style={styles.aiSheetTitleRow}>
            <ZapIcon size={16} color="#F59E0B" strokeWidth={2} />
            <Text style={styles.aiSheetTitle}>Análisis Market IA</Text>
          </View>
          <Touchable onPress={onClose} borderRadius={14} hitSlop={10}>
            <CloseIcon size={18} color="rgba(255,255,255,0.6)" strokeWidth={2} />
          </Touchable>
        </View>

        <Text style={styles.aiSubtitle}>Prendas identificadas en este look:</Text>

        <ScrollView style={styles.piecesList} showsVerticalScrollIndicator={false}>
          {pieces.length > 0 ? (
            pieces.map(item => (
              <View key={item} style={styles.pieceItem}>
                <View style={styles.pieceDot} />
                <Text style={styles.pieceText}>{item}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.aiBody}>No se encontraron prendas identificables.</Text>
          )}
        </ScrollView>
      </View>
    </View>
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
  const [activeOverlay, setActiveOverlay] = useState<'style' | 'market' | null>(null);

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

      {/* Bottom gradient overlay */}
      <View style={styles.gradientOverlay} pointerEvents="none">
        <View style={styles.gradientStep1} />
        <View style={styles.gradientStep2} />
        <View style={styles.gradientStep3} />
        <View style={styles.gradientStep4} />
      </View>

      {/* Right: action buttons */}
      <View style={styles.rightActions}>
        <Image source={{ uri: post.user.avatarUrl }} style={styles.userAvatarSmall} />

        <ActionBtn count={likeCount} onPress={handleLike}>
          <FlameIcon size={22} color={isLiked ? '#FF6B35' : '#ffffff'} strokeWidth={2} />
        </ActionBtn>

        <ActionBtn count={post.comments} onPress={() => {}}>
          <MessageIcon size={22} color="#ffffff" strokeWidth={2} />
        </ActionBtn>

        <ActionBtn count={saveCount} onPress={handleSave}>
          <BookmarkIcon size={22} color={isSaved ? '#818CF8' : '#ffffff'} strokeWidth={2} />
        </ActionBtn>

        <ActionBtn onPress={() => {}}>
          <Share2Icon size={22} color="#ffffff" strokeWidth={2} />
        </ActionBtn>

        {!post.isOwn && (
          <>
            <GemBtn
              gemCost={GEM_STYLE_DISCOVER}
              label="Estilo"
              onPress={() => setActiveOverlay('style')}
            >
              <SparklesIcon size={20} color="#ffffff" strokeWidth={2} />
            </GemBtn>

            <GemBtn
              gemCost={GEM_MARKET_SCAN}
              label="Market"
              onPress={() => setActiveOverlay('market')}
            >
              <ZapIcon size={20} color="#ffffff" strokeWidth={2} />
            </GemBtn>
          </>
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

      {/* AI overlays */}
      {activeOverlay === 'style' && (
        <StyleDiscoverOverlay post={post} onClose={() => setActiveOverlay(null)} />
      )}
      {activeOverlay === 'market' && (
        <MarketScanOverlay post={post} onClose={() => setActiveOverlay(null)} />
      )}
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
    flexDirection: 'column',
  },
  gradientStep1: { flex: 1, backgroundColor: 'rgba(0,0,0,0.00)' },
  gradientStep2: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  gradientStep3: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' },
  gradientStep4: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  // Right action column
  rightActions: {
    position: 'absolute',
    right: 12,
    bottom: 110,
    alignItems: 'center',
    gap: 2,
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
    marginVertical: 3,
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
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    maxWidth: 50,
    textAlign: 'center',
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
  // AI overlays
  aiOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  aiSheet: {
    backgroundColor: 'rgba(15,20,40,0.97)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    gap: 12,
    maxHeight: '60%',
  },
  aiSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiSheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiSheetTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  aiSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '500',
  },
  aiChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  aiChip: {
    backgroundColor: 'rgba(99,102,241,0.25)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.50)',
  },
  aiChipText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '600',
  },
  aiBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 22,
  },
  aiCopyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiCopyHint: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '500',
  },
  // Market scan
  piecesList: {
    maxHeight: 200,
  },
  pieceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pieceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  pieceText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
  },
});

export default FeedPost;
