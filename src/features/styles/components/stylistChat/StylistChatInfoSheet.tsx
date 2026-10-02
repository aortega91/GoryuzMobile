import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import { BotIcon, GemIcon, MessageIcon, ShirtIcon, SparklesIcon } from '@assets/icons';
import useStylesTheme from '@hooks/useStylesTheme';
import { COMBINE_OUTFIT_GEM_COST, STYLIST_CHAT_GEM_COST } from '../../api/stylistChatApi';

interface Props {
  aiName: string;
  onClose: () => void;
}

const EXAMPLE_KEYS = ['example1', 'example2', 'example3', 'example4'];

/** zena `ChatInfoModal`: what the stylist can do and what each step costs. */
function StylistChatInfoSheet({ aiName, onClose }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();

  const steps = [
    { key: 'talk', Icon: MessageIcon, cost: STYLIST_CHAT_GEM_COST },
    { key: 'look', Icon: SparklesIcon, cost: COMBINE_OUTFIT_GEM_COST },
    { key: 'save', Icon: ShirtIcon, cost: 0 },
  ];

  return (
    <BottomSheet onClose={onClose} backgroundColor={s.chatBackground}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.botIcon, { backgroundColor: s.chatBotBackground }]}>
          <BotIcon size={24} color={s.chatBotIcon} />
        </View>
        <Text style={[styles.title, { color: s.chatTitle }]}>
          {t('styles.stylistChat.infoTitle', { name: aiName })}
        </Text>
        <Text style={[styles.body, { color: s.chatSubtitle }]}>{t('styles.stylistChat.infoDesc')}</Text>

        <View style={styles.steps}>
          {steps.map(({ key, Icon, cost }) => (
            <View
              key={key}
              style={[styles.step, { backgroundColor: s.chatHistoryCardBackground, borderColor: s.chatHistoryCardBorder }]}
            >
              <View style={[styles.stepIcon, { backgroundColor: s.chatBotSmallBackground }]}>
                <Icon size={18} color={s.chatBotSmallIcon} />
              </View>
              <View style={styles.stepText}>
                <View style={styles.stepHead}>
                  <Text style={[styles.stepTitle, { color: s.chatTitle }]}>
                    {t(`styles.stylistChat.step_${key}_title`)}
                  </Text>
                  <View style={styles.cost}>
                    {cost > 0 && <GemIcon size={12} color={s.chatGemIcon} />}
                    <Text style={[styles.costText, { color: s.chatGemValue }]}>
                      {cost > 0 ? cost : t('styles.stylistChat.free')}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.stepBody, { color: s.chatSubtitle }]}>
                  {t(`styles.stylistChat.step_${key}_body`)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.examplesTitle, { color: s.chatSuggestionLabel }]}>
          {t('styles.stylistChat.examplesTitle')}
        </Text>
        {EXAMPLE_KEYS.map(key => (
          <Text key={key} style={[styles.example, { color: s.chatModelBubbleText, backgroundColor: s.chatModelBubble }]}>
            {t(`styles.stylistChat.${key}`)}
          </Text>
        ))}

        <Text style={[styles.footer, { color: s.chatSubtitle }]}>{t('styles.stylistChat.infoFooter')}</Text>

        <Touchable onPress={onClose} borderRadius={16} style={[styles.button, { backgroundColor: s.chatSendBackground }]}>
          <Text style={[styles.buttonText, { color: s.chatSendIcon }]}>{t('styles.stylistChat.understood')}</Text>
        </Touchable>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingBottom: 12 },
  botIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  body: { fontSize: 13, lineHeight: 19 },
  steps: { gap: 10, marginTop: 16 },
  step: { flexDirection: 'row', gap: 12, padding: 12, borderRadius: 16, borderWidth: 1 },
  stepIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1, gap: 4 },
  stepHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stepTitle: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  cost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { fontSize: 12, fontWeight: '700' },
  stepBody: { fontSize: 12, lineHeight: 17 },
  examplesTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
    marginBottom: 8,
  },
  example: { fontSize: 13, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, marginBottom: 6, overflow: 'hidden' },
  footer: { fontSize: 12, lineHeight: 17, marginTop: 12 },
  button: { marginTop: 16, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontSize: 15, fontWeight: '700' },
});

export default StylistChatInfoSheet;
