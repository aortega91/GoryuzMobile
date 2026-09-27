import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { CheckIcon, TagIcon } from '@assets/icons';

interface TagSheetProps {
  /** Name of the creation being tagged — shown under the title. */
  outfitName: string;
  currentTags: string[];
  /** Tags the user created in the Tags submodule. */
  allTags: string[];
  loading: boolean;
  onClose: () => void;
  onSave: (tags: string[]) => void;
  /** Jumps to the Tags submodule when none exist yet. */
  onGoToTags: () => void;
}

/**
 * Assigns any number of the already-created tags to a creation (zena
 * OutfitTagsModal). Tags are created only in the Tags submodule, so there is
 * no free-text input here — just the list to toggle.
 */
function TagSheet({ outfitName, currentTags, allTags, loading, onClose, onSave, onGoToTags }: TagSheetProps) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const [selected, setSelected] = useState<string[]>(currentTags);

  const toggle = (tag: string) =>
    setSelected(prev => (prev.includes(tag) ? prev.filter(x => x !== tag) : [...prev, tag]));

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.7}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TagIcon size={18} color={s.toneTags} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: s.modalTitle }]}>{t('styles.tagsTitle')}</Text>
            <Text style={[styles.subtitle, { color: s.modalSubtitle }]} numberOfLines={1}>{outfitName}</Text>
          </View>
        </View>

        {allTags.length === 0 ? (
          <View style={styles.empty}>
            <TagIcon size={36} color={s.emptyIcon} />
            <Text style={[styles.emptyText, { color: s.modalSubtitle }]}>{t('styles.tagsAssignEmpty')}</Text>
            <Touchable
              onPress={onGoToTags}
              borderRadius={12}
              style={[styles.goBtn, { backgroundColor: s.buttonPrimary }]}
            >
              <Text style={[styles.goBtnText, { color: s.buttonPrimaryText }]}>{t('styles.tagsGoCreate')}</Text>
            </Touchable>
          </View>
        ) : (
          <>
            <Text style={[styles.hint, { color: s.modalSubtitle }]}>{t('styles.tagsAssignHint')}</Text>
            <View style={styles.tagsWrap}>
              {allTags.map(tag => {
                const isOn = selected.includes(tag);
                return (
                  <Touchable
                    key={tag}
                    onPress={() => toggle(tag)}
                    disabled={loading}
                    borderRadius={16}
                    style={[
                      styles.tag,
                      isOn
                        ? { backgroundColor: s.tagActiveBackground, borderColor: s.tagActiveBackground }
                        : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                      loading && styles.disabled,
                    ]}
                  >
                    {isOn && <CheckIcon size={12} color={s.tagActiveText} />}
                    <Text style={[styles.tagText, { color: isOn ? s.tagActiveText : s.choiceText }]}>{tag}</Text>
                  </Touchable>
                );
              })}
            </View>

            <Touchable
              onPress={() => onSave(selected)}
              borderRadius={12}
              disabled={loading}
              style={[styles.saveBtn, { backgroundColor: s.buttonPrimary }, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color={s.buttonPrimaryText} size="small" />
              ) : (
                <Text style={[styles.saveBtnText, { color: s.buttonPrimaryText }]}>{t('styles.tagsSave')}</Text>
              )}
            </Touchable>
          </>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 12 },
  hint: { fontSize: 12, marginBottom: 12 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagText: { fontSize: 12, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 16, gap: 10 },
  emptyText: { fontSize: 13, textAlign: 'center' },
  goBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12 },
  goBtnText: { fontSize: 13, fontWeight: '700' },
  saveBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 18 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default TagSheet;
