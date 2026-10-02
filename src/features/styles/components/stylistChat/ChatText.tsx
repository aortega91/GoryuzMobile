import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  text: string;
  color: string;
}

/** `**bold**` and `*italic*` spans of one line, as nested Text. */
function renderInline(line: string, keyPrefix: string) {
  return line
    .split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      const key = `${keyPrefix}-${i}`;
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <Text key={key} style={styles.bold}>
            {part.slice(2, -2)}
          </Text>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <Text key={key} style={styles.italic}>
            {part.slice(1, -1)}
          </Text>
        );
      }
      return part;
    });
}

/**
 * The stylist answers in light Markdown (zena renders it with ReactMarkdown):
 * paragraphs, bullet / numbered lists and bold or italic spans. This covers
 * that subset without pulling in a Markdown dependency.
 */
function ChatText({ text, color }: Props) {
  const blocks = text.split(/\n{2,}/);
  return (
    <View style={styles.root}>
      {blocks.map((block, b) => {
        const lines = block.split('\n').filter(l => l.trim().length > 0);
        return (
          // eslint-disable-next-line react/no-array-index-key
          <View key={b} style={styles.block}>
            {lines.map((line, l) => {
              const key = `${b}-${l}`;
              const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
              const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
              if (bullet || numbered) {
                return (
                  <View key={key} style={styles.listItem}>
                    <Text style={[styles.text, { color }]}>{bullet ? '•' : `${numbered![1]}.`}</Text>
                    <Text style={[styles.text, styles.listText, { color }]}>
                      {renderInline(bullet ? bullet[1] : numbered![2], key)}
                    </Text>
                  </View>
                );
              }
              return (
                <Text key={key} style={[styles.text, { color }]}>
                  {renderInline(line, key)}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 8 },
  block: { gap: 4 },
  text: { fontSize: 15, lineHeight: 22 },
  bold: { fontWeight: '800' },
  italic: { fontStyle: 'italic' },
  listItem: { flexDirection: 'row', gap: 6, paddingLeft: 4 },
  listText: { flex: 1 },
});

export default ChatText;
