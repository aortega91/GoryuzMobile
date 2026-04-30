import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';
import { ChevronRightIcon } from '@assets/icons';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
  /** When true, renders with the CTA (indigo) accent style */
  isCta?: boolean;
}

function ActionCard({ icon, title, description, onPress, isCta = false }: ActionCardProps) {
  const theme = useHomeTheme();
  const t = theme.home;

  const bgColor = isCta ? t.ctaCardBackground : t.cardBackground;
  const borderColor = isCta ? t.ctaCardBorder : t.cardBorder;
  const iconColor = isCta ? t.ctaCardIcon : t.cardIcon;

  return (
    <Touchable
      onPress={onPress}
      borderRadius={12}
      style={[
        styles.card,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        isCta && styles.ctaCard,
      ]}
    >
      {/* Left accent bar for CTA */}
      {isCta && (
        <View style={[styles.ctaAccentBar, { backgroundColor: t.ctaCardBorder }]} />
      )}

      {/* Icon */}
      <View style={[styles.iconWrapper, isCta ? styles.iconWrapperCta : styles.iconWrapperDefault]}>
        {React.isValidElement(icon)
          ? React.cloneElement(icon as React.ReactElement<{ color?: string }>, {
              color: iconColor,
            })
          : icon}
      </View>

      {/* Text */}
      <View style={styles.textWrapper}>
        <Text
          style={[styles.title, { color: t.cardTitle }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[styles.description, { color: t.cardDescription }]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Arrow */}
      <ChevronRightIcon size={18} color={t.cardArrow} strokeWidth={2.5} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    overflow: 'hidden',
  },
  ctaCard: {
    paddingLeft: 20,
  },
  ctaAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperDefault: {
    opacity: 0.85,
  },
  iconWrapperCta: {
    opacity: 1,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ActionCard;
