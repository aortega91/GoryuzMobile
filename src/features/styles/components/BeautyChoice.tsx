import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';

export interface ChoiceOption {
  id: string;
  label: string;
}

interface Props {
  step: number;
  title: string;
  hint?: string;
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** Optional questions can be left unanswered — tapping the active chip clears it. */
  optional?: boolean;
  tone: string;
  disabled?: boolean;
}

/** One question of a beauty questionnaire (zena `beauty/BeautyChoice`), as chips. */
function BeautyChoice({ step, title, hint, options, value, onChange, optional, tone, disabled }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View style={[styles.stepBadge, { backgroundColor: tone }]}>
          <Text style={[styles.stepText, { color: s.toneOnColor }]}>{step}</Text>
        </View>
        <Text style={[styles.title, { color: s.modalTitle }]}>{title}</Text>
        {optional && (
          <Text style={[styles.optional, { color: s.choiceHint }]}>{t('styles.beautyOptional')}</Text>
        )}
      </View>
      {hint ? <Text style={[styles.hint, { color: s.choiceHint }]}>{hint}</Text> : null}
      <View style={styles.options}>
        {options.map(option => {
          const active = value === option.id;
          return (
            <Touchable
              key={option.id}
              disabled={disabled}
              onPress={() => onChange(active && optional ? null : option.id)}
              borderRadius={14}
              style={[
                styles.chip,
                active
                  ? { backgroundColor: tone, borderColor: tone }
                  : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                disabled && styles.disabled,
              ]}
            >
              <Text style={[styles.chipText, { color: active ? s.toneOnColor : s.choiceText }]}>
                {option.label}
              </Text>
            </Touchable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 11, fontWeight: '800' },
  title: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  optional: { fontSize: 11, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 16 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 14, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '600' },
  disabled: { opacity: 0.6 },
});

export default BeautyChoice;
