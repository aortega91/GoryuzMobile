import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Touchable from '@components/Touchable';
import useHomeTheme from '@hooks/useHomeTheme';

type IconComponent = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

interface ActionCardProps {
  Icon: IconComponent;
  title: string;
  onPress: () => void;
}

/**
 * Inicio shortcut tile — port of zena `HomeView`'s `ActionCard`: accent icon
 * over a short title, laid out in a single row that splits the width evenly.
 */
function ActionCard({ Icon, title, onPress }: ActionCardProps) {
  const h = useHomeTheme().home;

  return (
    <View style={styles.wrapper}>
      <Touchable
        onPress={onPress}
        borderRadius={8}
        style={[styles.card, { backgroundColor: h.cardBackground, borderColor: h.checklistBorder }]}
      >
        <Icon size={24} color={h.cardIcon} />
        <Text style={[styles.title, { color: h.cardTitle }]} numberOfLines={2}>
          {title}
        </Text>
      </Touchable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default ActionCard;
