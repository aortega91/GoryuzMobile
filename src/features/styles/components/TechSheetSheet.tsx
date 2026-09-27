import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import BottomSheet from '@components/BottomSheet';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { FileTextIcon, GemIcon, SparklesIcon } from '@assets/icons';
import { Outfit, TechSheet } from '../types';
import { TECH_SHEET_GEM_COST } from '../beautyOptions';

interface Props {
  outfit: Outfit;
  onClose: () => void;
  /** Generates the sheet with AI; resolves `null` when the call failed. */
  onGenerate: (outfit: Outfit) => Promise<TechSheet | null>;
}

/**
 * A beauty design's salon sheet (port of zena OutfitTechSheetModal): what to
 * show the hairdresser, manicurist or make-up artist to reproduce the look.
 * Normally generated on save; if that failed it can be retried here.
 */
function TechSheetSheet({ outfit, onClose, onGenerate }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const [sheet, setSheet] = useState<TechSheet | null>(outfit.techSheet);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await onGenerate(outfit);
      if (result) setSheet(result);
    } finally {
      setIsGenerating(false);
    }
  };

  const sectionTitle = (key: string) => (
    <Text style={[styles.sectionTitle, { color: s.modalSubtitle }]}>{t(key)}</Text>
  );

  return (
    <BottomSheet onClose={onClose} backgroundColor={s.modalBackground} backdropColor={s.modalBackdrop}>
      <View style={styles.header}>
        <FileTextIcon size={20} color={s.toneTechSheet} />
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: s.modalTitle }]}>{t('styles.techSheetTitle')}</Text>
          <Text style={[styles.subtitle, { color: s.modalSubtitle }]} numberOfLines={1}>{outfit.name}</Text>
        </View>
      </View>

      {!sheet ? (
        <View style={styles.empty}>
          <FileTextIcon size={40} color={s.emptyIcon} />
          <Text style={[styles.emptyText, { color: s.modalSubtitle }]}>{t('styles.techSheetEmpty')}</Text>
          <Touchable
            onPress={handleGenerate}
            disabled={isGenerating}
            borderRadius={12}
            style={[styles.generateBtn, { backgroundColor: s.buttonPrimary }, isGenerating && styles.disabled]}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color={s.buttonPrimaryText} />
            ) : (
              <SparklesIcon size={16} color={s.buttonPrimaryText} />
            )}
            <Text style={[styles.generateText, { color: s.buttonPrimaryText }]}>
              {isGenerating ? t('styles.techSheetGenerating') : t('styles.techSheetGenerate')}
            </Text>
            {!isGenerating && (
              <>
                <GemIcon size={12} color={s.buttonPrimaryText} />
                <Text style={[styles.generateText, { color: s.buttonPrimaryText }]}>{TECH_SHEET_GEM_COST}</Text>
              </>
            )}
          </Touchable>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text
            style={[
              styles.summary,
              { color: s.modalTitle, backgroundColor: s.techSheetSummaryBackground, borderColor: s.techSheetSummaryBorder },
            ]}
          >
            {sheet.summary}
          </Text>

          <View style={styles.section}>
            {sectionTitle('styles.techSheetSpecs')}
            <View style={[styles.specs, { borderColor: s.modalBorder }]}>
              {sheet.specs.map((spec, index) => (
                <View
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${spec.label}-${index}`}
                  style={[
                    styles.specRow,
                    { backgroundColor: s.techSheetRowBackground, borderTopColor: s.modalBorder },
                    index === 0 && styles.specRowFirst,
                  ]}
                >
                  <Text style={[styles.specLabel, { color: s.modalSubtitle }]}>{spec.label}</Text>
                  <Text style={[styles.specValue, { color: s.modalTitle }]}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            {sectionTitle('styles.techSheetSteps')}
            {sheet.steps.map((step, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <View key={index} style={styles.stepRow}>
                <View style={[styles.stepBadge, { backgroundColor: s.techSheetStepBadge }]}>
                  <Text style={[styles.stepNumber, { color: s.modalSubtitle }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.body, { color: s.modalTitle }]}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            {sectionTitle('styles.techSheetProducts')}
            <View style={styles.products}>
              {sheet.products.map((product, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Text key={index} style={[styles.product, { color: s.tagText, backgroundColor: s.tagBackground }]}>
                  {product}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            {sectionTitle('styles.techSheetCare')}
            <Text style={[styles.body, { color: s.modalTitle }]}>{sheet.care}</Text>
          </View>

          {outfit.designPrompt ? (
            <View style={[styles.section, styles.promptSection, { borderTopColor: s.modalBorder }]}>
              {sectionTitle('styles.techSheetPrompt')}
              <Text style={[styles.prompt, { color: s.modalSubtitle }]}>“{outfit.designPrompt}”</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingBottom: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12 },
  empty: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  generateText: { fontSize: 14, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 20, gap: 18 },
  summary: { fontSize: 14, lineHeight: 20, padding: 14, borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  specs: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  specRowFirst: { borderTopWidth: 0 },
  specLabel: { fontSize: 12, fontWeight: '600' },
  specValue: { fontSize: 13, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  stepRow: { flexDirection: 'row', gap: 10 },
  stepBadge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  stepNumber: { fontSize: 11, fontWeight: '700' },
  body: { flex: 1, fontSize: 14, lineHeight: 20 },
  products: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  product: { fontSize: 12, fontWeight: '500', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  promptSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 14 },
  prompt: { fontSize: 12, fontStyle: 'italic', lineHeight: 18 },
  disabled: { opacity: 0.6 },
});

export default TechSheetSheet;
