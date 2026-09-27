import React, { useEffect } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import { ArrowLeftIcon, ShieldCheckIcon } from '@assets/icons';
import useProfileTheme from '@hooks/useProfileTheme';
import { LEGAL_DOCUMENT_LANGUAGE, LegalBlock, LegalDocument } from '../legal';

// Native port of zena `src/components/LegalDocumentView.tsx`. The text lives in
// `../legal` and exists only in Spanish — the binding version — so when the
// app runs in another language we say so instead of showing an unsigned
// translation.

interface LegalDocumentViewProps {
  document: LegalDocument;
  /** Header title; the document's own title is shown inside the content. */
  headerTitle: string;
  onBack: () => void;
}

type Colors = ReturnType<typeof useProfileTheme>['profile'];

const BACK_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 };

function Blocks({ blocks, colors, italic }: { blocks: LegalBlock[]; colors: Colors; italic?: boolean }) {
  return (
    <>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === 'p') {
          return (
            <Text
              key={key}
              style={[
                styles.paragraph,
                { color: italic ? colors.legalInfoText : colors.legalBody },
                italic && styles.italic,
              ]}
            >
              {block.text}
            </Text>
          );
        }
        return (
          <View key={key} style={styles.list}>
            {block.items.map((item, itemIndex) => (
              // eslint-disable-next-line react/no-array-index-key
              <View key={itemIndex} style={styles.listItem}>
                <Text style={[styles.paragraph, { color: colors.legalBody }]}>•</Text>
                <Text style={[styles.paragraph, styles.listText, { color: colors.legalBody }]}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

function LegalDocumentView({ document, headerTitle, onBack }: LegalDocumentViewProps) {
  const { profile: colors } = useProfileTheme();
  const { t, i18n } = useTranslation();
  const isTranslated = (i18n.language ?? 'es').slice(0, 2) !== LEGAL_DOCUMENT_LANGUAGE;

  // Android hardware back closes the document instead of leaving the module.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => sub.remove();
  }, [onBack]);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.legalDocBackground }]}>
      <View style={[styles.header, { borderBottomColor: colors.legalDocHeaderBorder }]}>
        <Touchable
          style={styles.backButton}
          onPress={onBack}
          borderRadius={20}
          hitSlop={BACK_HIT_SLOP}
          accessibilityLabel={t('profile.legalBack')}
        >
          <ArrowLeftIcon size={24} color={colors.legalIcon} />
        </Touchable>
        <Text style={[styles.headerTitle, { color: colors.legalHeading }]} numberOfLines={1}>
          {headerTitle}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.infoCard,
            { backgroundColor: colors.legalInfoBackground, borderColor: colors.legalInfoBorder },
          ]}
        >
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: colors.legalInfoIconBackground }]}>
              <ShieldCheckIcon size={28} color={colors.legalInfoAccent} />
            </View>
            <View style={styles.infoTextCol}>
              <Text style={[styles.infoEyebrow, { color: colors.legalInfoAccent }]}>
                {t('profile.legalCurrentVersion')}
              </Text>
              <Text style={[styles.infoDate, { color: colors.legalInfoText }]}>
                {t('profile.legalLastUpdate', { date: document.lastUpdated })}
              </Text>
              <Text style={[styles.infoContact, { color: colors.legalInfoMuted }]}>
                {t('profile.legalContact')}
              </Text>
            </View>
          </View>

          {isTranslated && (
            <View style={[styles.infoDivider, { borderTopColor: colors.legalInfoBorder }]}>
              <Text style={[styles.paragraph, { color: colors.legalInfoText }]}>
                {t('profile.legalOriginalLanguageNotice')}
              </Text>
            </View>
          )}

          {document.intro.length > 0 && (
            <View style={[styles.infoDivider, styles.blockGap, { borderTopColor: colors.legalInfoBorder }]}>
              <Blocks blocks={document.intro} colors={colors} italic />
            </View>
          )}
        </View>

        <Text style={[styles.docTitle, { color: colors.legalHeading }]}>{document.title}</Text>

        {document.sections.map((section, index) => (
          <View
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            style={[
              styles.section,
              section.isSubsection && [
                styles.subsection,
                { borderLeftColor: colors.legalSubsectionBorder },
              ],
            ]}
          >
            {section.title ? (
              <Text
                style={[
                  section.isSubsection ? styles.subsectionTitle : styles.sectionTitle,
                  { color: colors.legalHeading },
                ]}
              >
                {section.title}
              </Text>
            ) : null}
            <View style={styles.blockGap}>
              <Blocks blocks={section.blocks} colors={colors} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    paddingBottom: 48,
    gap: 24,
  },
  infoCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIcon: {
    padding: 10,
    borderRadius: 12,
  },
  infoTextCol: {
    flex: 1,
    gap: 2,
  },
  infoEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  infoDate: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoContact: {
    fontSize: 12,
  },
  infoDivider: {
    borderTopWidth: 1,
    paddingTop: 14,
  },
  docTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  subsection: {
    paddingLeft: 14,
    borderLeftWidth: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  subsectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  blockGap: {
    gap: 10,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
  },
  italic: {
    fontStyle: 'italic',
  },
  list: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    gap: 8,
    paddingLeft: 4,
  },
  listText: {
    flex: 1,
  },
});

export default LegalDocumentView;
