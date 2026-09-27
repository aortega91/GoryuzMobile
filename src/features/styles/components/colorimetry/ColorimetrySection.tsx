import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { ChevronDownIcon, PaletteIcon } from '@assets/icons';

interface Props {
  title: string;
  description: string;
  /** zena shows the saved season here (`profile.colorSeason`). */
  badge?: string | null;
  children: React.ReactNode;
}

/** zena's CollapsibleSection wrapping the palette tool, open by default. */
function ColorimetrySection({ title, description, badge, children }: Props) {
  const c = useStylesTheme().colorimetry;
  const [open, setOpen] = useState(true);

  return (
    <View style={[styles.card, { backgroundColor: c.cardBackground, borderColor: c.cardBorder }]}>
      <Touchable onPress={() => setOpen(o => !o)} borderRadius={16} style={styles.head}>
        <PaletteIcon size={18} color={c.welcomeIconColor} />
        <View style={styles.headText}>
          <Text style={[styles.title, { color: c.cardTitle }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.description, { color: c.cardHint }]} numberOfLines={1}>
            {description}
          </Text>
        </View>
        {badge ? (
          <View style={[styles.badge, { backgroundColor: c.badgeBackground }]}>
            <Text style={[styles.badgeText, { color: c.badgeText }]}>{badge}</Text>
          </View>
        ) : null}
        <View style={open ? styles.chevronOpen : undefined}>
          <ChevronDownIcon size={18} color={c.cardChevron} />
        </View>
      </Touchable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  headText: { flex: 1, minWidth: 0 },
  title: { fontSize: 14, fontWeight: '700' },
  description: { fontSize: 12 },
  badge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  body: { paddingHorizontal: 16, paddingBottom: 16 },
});

export default ColorimetrySection;
