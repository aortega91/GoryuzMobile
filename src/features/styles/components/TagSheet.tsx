import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { PlusCircleIcon, CloseIcon } from '@assets/icons';

interface TagSheetProps {
  currentTags: string[];
  allTags: string[];
  loading: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
}

function TagSheet({ currentTags, allTags, loading, onClose, onSave }: TagSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const [selected, setSelected] = useState<string[]>(currentTags);
  const [input, setInput] = useState('');

  const suggestions = allTags.filter(
    tag => !selected.includes(tag) && tag.toLowerCase().includes(input.toLowerCase()),
  );

  const toggleTag = (tag: string) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t2 => t2 !== tag) : [...prev, tag],
    );
  };

  const addCustomTag = () => {
    const tag = input.trim();
    if (tag.length > 0 && !selected.includes(tag)) {
      setSelected(prev => [...prev, tag]);
    }
    setInput('');
  };

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.7}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: s.modalTitle }]}>{t('styles.tagsTitle')}</Text>

        {/* Input row */}
        <View style={[styles.inputRow, { borderColor: s.modalInputBorder, backgroundColor: s.modalInputBackground }]}>
          <TextInput
            style={[styles.input, { color: s.modalInputText }]}
            value={input}
            onChangeText={setInput}
            placeholder={t('styles.tagsPlaceholder')}
            placeholderTextColor={s.modalInputPlaceholder}
            editable={!loading}
            returnKeyType="done"
            onSubmitEditing={addCustomTag}
          />
          {input.trim().length > 0 && (
            <Touchable onPress={addCustomTag} hitSlop={8} borderRadius={20}>
              <PlusCircleIcon size={22} color={s.buttonPrimary} />
            </Touchable>
          )}
        </View>

        {/* Selected tags */}
        {selected.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: s.modalLabel }]}>
              {t('styles.tagsSelected')}
            </Text>
            <View style={styles.tagsWrap}>
              {selected.map(tag => (
                <Touchable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  borderRadius={20}
                  style={[styles.tag, { backgroundColor: s.tagActiveBackground }]}
                >
                  <Text style={[styles.tagText, { color: s.tagActiveText }]}>{tag}</Text>
                  <CloseIcon size={12} color={s.tagActiveText} />
                </Touchable>
              ))}
            </View>
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: s.modalLabel }]}>
              {t('styles.tagsSuggestions')}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsRow}
            >
              {suggestions.map(tag => (
                <Touchable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  borderRadius={20}
                  style={[styles.tag, { backgroundColor: s.tagBackground }]}
                >
                  <Text style={[styles.tagText, { color: s.tagText }]}>{tag}</Text>
                </Touchable>
              ))}
            </ScrollView>
          </View>
        )}

        <Touchable
          onPress={() => onSave(selected)}
          borderRadius={14}
          disabled={loading}
          style={[styles.saveBtn, { backgroundColor: s.buttonPrimary }, loading && styles.btnDisabled]}
        >
          {loading ? (
            <ActivityIndicator color={s.buttonPrimaryText} size="small" />
          ) : (
            <Text style={[styles.saveBtnText, { color: s.buttonPrimaryText }]}>
              {t('styles.tagsSave')}
            </Text>
          )}
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 20,
    gap: 8,
  },
  input: { flex: 1, fontSize: 14, paddingVertical: 10 },
  section: { marginBottom: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestionsRow: { gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});

export default TagSheet;
