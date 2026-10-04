import React, { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet, { BottomSheetHandle } from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import { BotIcon, StarIcon } from '@assets/icons';
import useScheduleTheme from '@hooks/useScheduleTheme';

interface Props {
  onChooseAi: () => void;
  onChooseSaved: () => void;
  onClose: () => void;
}

/**
 * zena `AddToCalendarChoiceModal`: before adding a look to a day, choose
 * between asking the stylist for one or picking a saved outfit.
 */
function AddOutfitChoiceSheet({ onChooseAi, onChooseSaved, onClose }: Props) {
  const { t } = useTranslation();
  const s = useScheduleTheme().schedule;
  const sheetRef = useRef<BottomSheetHandle>(null);

  const options = [
    { key: 'ai', Icon: BotIcon, color: s.choiceAiIcon, onPress: onChooseAi },
    { key: 'saved', Icon: StarIcon, color: s.choiceSavedIcon, onPress: onChooseSaved },
  ];

  return (
    <BottomSheet ref={sheetRef} onClose={onClose} backgroundColor={s.modalBackground}>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={[styles.titleIcon, { backgroundColor: s.choiceTitleIconBackground }]}>
            <StarIcon size={20} color={s.choiceTitleIcon} />
          </View>
          <Text style={[styles.title, { color: s.modalTitle }]}>{t('schedule.addChoiceTitle')}</Text>
        </View>
        <Text style={[styles.subtitle, { color: s.modalSubtitle }]}>{t('schedule.addChoiceSubtitle')}</Text>

        {options.map(({ key, Icon, color, onPress }) => (
          <Touchable
            key={key}
            onPress={() => sheetRef.current?.close(onPress)}
            borderRadius={16}
            style={[styles.option, { backgroundColor: s.choiceCardBackground, borderColor: s.choiceCardBorder }]}
          >
            <View style={[styles.optionIcon, { backgroundColor: s.choiceIconBackground }]}>
              <Icon size={24} color={color} />
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, { color: s.modalTitle }]}>
                {t(`schedule.addChoice_${key}_title`)}
              </Text>
              <Text style={[styles.optionDesc, { color: s.modalSubtitle }]}>
                {t(`schedule.addChoice_${key}_desc`)}
              </Text>
            </View>
          </Touchable>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 24, paddingBottom: 12, gap: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  titleIcon: { padding: 8, borderRadius: 12 },
  title: { fontSize: 20, fontWeight: '700', flex: 1 },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  optionIcon: { padding: 12, borderRadius: 12, marginRight: 16 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: '700' },
  optionDesc: { fontSize: 12, marginTop: 2 },
});

export default AddOutfitChoiceSheet;
