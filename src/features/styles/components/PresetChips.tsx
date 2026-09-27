import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useRequest from '@hooks/useRequest';
import useStylesTheme from '@hooks/useStylesTheme';
import { Wand2Icon } from '@assets/icons';
import { fetchPromptPresets, PresetFlow } from '../api/presetsApi';

interface Props {
  flow: PresetFlow;
  /** Current text of the box — marks which preset is loaded. */
  value: string;
  onSelect: (body: string) => void;
  disabled?: boolean;
  /** Tone of the active chip (defaults to the brand accent). */
  activeColor?: string;
}

/**
 * zena's PresetSelector as a single scrollable row of titles: the full text
 * lands in the box on tap, where it is read and edited. Renders nothing when
 * the backoffice has no presets for this flow.
 */
function PresetChips({ flow, value, onSelect, disabled, activeColor }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const { data } = useRequest(fetchPromptPresets);
  const presets = data?.[flow] ?? [];

  if (presets.length === 0) return null;

  const tone = activeColor ?? s.buttonPrimary;

  const choose = (body: string) => {
    const current = value.trim();
    // Own text about to be lost → ask first, like zena's replace warning.
    if (current && !presets.some(p => p.body.trim() === current)) {
      Alert.alert(t('styles.presetsLabel'), t('styles.presetReplace'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('styles.presetReplaceConfirm'), onPress: () => onSelect(body) },
      ]);
      return;
    }
    onSelect(body);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Wand2Icon size={13} color={s.modalSubtitle} />
        <Text style={[styles.label, { color: s.modalSubtitle }]}>{t('styles.presetsLabel')}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {presets.map(preset => {
          const active = preset.body.trim() === value.trim();
          return (
            <Touchable
              key={preset.key}
              onPress={() => choose(preset.body)}
              disabled={disabled}
              borderRadius={16}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: tone, borderColor: tone }
                  : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                disabled && styles.disabled,
              ]}
            >
              <Text
                style={[styles.chipText, { color: active ? s.toneOnColor : s.choiceText }]}
                numberOfLines={1}
              >
                {preset.title}
              </Text>
            </Touchable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { gap: 6, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 220,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default PresetChips;
