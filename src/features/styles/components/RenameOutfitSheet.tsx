import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';

interface RenameOutfitSheetProps {
  currentName: string;
  loading: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
}

function RenameOutfitSheet({
  currentName,
  loading,
  onClose,
  onSave,
}: RenameOutfitSheetProps) {
  const { t } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;

  const [name, setName] = useState(currentName);

  const handleSave = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) {
      onSave(trimmed);
    }
  };

  return (
    <BottomSheet
      onClose={onClose}
      backgroundColor={s.modalBackground}
      backdropColor={s.modalBackdrop}
      maxHeightRatio={0.5}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: s.modalTitle }]}>{t('styles.renameTitle')}</Text>

        <Text style={[styles.label, { color: s.modalLabel }]}>{t('styles.renameLabel')}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: s.modalInputBackground,
              borderColor: s.modalInputBorder,
              color: s.modalInputText,
            },
          ]}
          value={name}
          onChangeText={setName}
          placeholder={t('styles.renamePlaceholder')}
          placeholderTextColor={s.modalInputPlaceholder}
          editable={!loading}
          maxLength={80}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        <Touchable
          onPress={handleSave}
          borderRadius={14}
          disabled={loading || name.trim().length === 0}
          style={[
            styles.saveBtn,
            { backgroundColor: s.buttonPrimary },
            (loading || name.trim().length === 0) && styles.btnDisabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={s.buttonPrimaryText} size="small" />
          ) : (
            <Text style={[styles.saveBtnText, { color: s.buttonPrimaryText }]}>
              {t('styles.renameSave')}
            </Text>
          )}
        </Touchable>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  label: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
  },
  saveBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 15, fontWeight: '700' },
});

export default RenameOutfitSheet;
