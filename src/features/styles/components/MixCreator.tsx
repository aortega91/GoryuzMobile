import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import { ArrowLeftIcon, CheckIcon, GemIcon, LayersIcon, SparklesIcon, Wand2Icon } from '@assets/icons';
import { UserProfile } from '@features/home/api/profileApi';
import { loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import { asDataUrl, completeMix, mixLook, toBase64Image } from '../api/stylesGenerateApi';
import { addOutfit } from '../stylesSlice';
import { Outfit, OutfitKind } from '../types';

interface Props {
  outfits: Outfit[];
  profile: UserProfile | null;
  onClose: () => void;
  onSaved: () => void;
  onGoToAvatar: () => void;
}

type SlotKind = Exclude<OutfitKind, 'mix'>;

/** A mix's slots — to styles what categories are to the closet. */
const SLOTS: { kind: SlotKind; labelKey: string }[] = [
  { kind: 'outfit', labelKey: 'styles.kindOutfit' },
  { kind: 'hair', labelKey: 'styles.kindHair' },
  { kind: 'makeup', labelKey: 'styles.kindMakeup' },
  { kind: 'nails', labelKey: 'styles.kindNails' },
];

/** zena GEM_COSTS defaults. */
const MIX_GEM_COST = 20;
const COMPLETE_MIX_GEM_COST = 5;

/**
 * "Mezclar creaciones" — one saved creation per style slot, rendered together
 * on the body avatar (port of zena MixCreatorModal).
 */
function MixCreator({ outfits, profile, onClose, onSaved, onGoToAvatar }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();

  const [selection, setSelection] = useState<Partial<Record<SlotKind, Outfit>>>({});
  const [occasion, setOccasion] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMixing, setIsMixing] = useState(false);
  const [isAdvising, setIsAdvising] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const busy = isMixing || isAdvising || isSaving;
  const avatarImage = profile?.avatarImage || profile?.bodyImage || null;

  /** Only creations with an image can be handed to the model. */
  const byKind = useMemo(() => {
    const map: Partial<Record<SlotKind, Outfit[]>> = {};
    outfits.forEach(outfit => {
      if (!outfit.imageData || outfit.kind === 'mix') return;
      const kind = outfit.kind as SlotKind;
      (map[kind] ??= []).push(outfit);
    });
    return map;
  }, [outfits]);

  const chosen = SLOTS.map(slot => selection[slot.kind]).filter(Boolean) as Outfit[];
  const hasAnything = Object.values(byKind).some(list => (list?.length ?? 0) > 0);

  const handleAdvise = async () => {
    const candidates = SLOTS.filter(slot => !selection[slot.kind]).flatMap(slot =>
      (byKind[slot.kind] ?? []).map(o => ({ id: o.id, name: o.name, kind: slot.kind })),
    );
    if (candidates.length === 0) return;
    setIsAdvising(true);
    setError(null);
    try {
      const advice = await completeMix({
        occasion: occasion.trim() || t('styles.mixOccasionLabel'),
        chosen: chosen.map(o => ({ name: o.name, kind: o.kind })),
        candidates,
      });
      dispatch(loadProfile());
      setSelection(current => {
        const next = { ...current };
        advice.ids.forEach(id => {
          const found = outfits.find(o => o.id === id);
          // Advice fills gaps; it never overrides what the user picked.
          if (found && found.kind !== 'mix' && !next[found.kind as SlotKind]) {
            next[found.kind as SlotKind] = found;
          }
        });
        return next;
      });
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'MixCreator.advise');
      setError(t('styles.mixAdviseError'));
    } finally {
      setIsAdvising(false);
    }
  };

  const handleMix = async () => {
    if (!avatarImage || chosen.length === 0) return;
    setIsMixing(true);
    setError(null);
    try {
      const avatar = await toBase64Image(avatarImage);
      if (!avatar) throw new Error('Avatar unreadable');
      const pieces = (
        await Promise.all(
          chosen.map(async o => {
            const image = await toBase64Image(o.imageData!);
            return image ? { ...image, label: `${o.name} (${o.kind})` } : null;
          }),
        )
      ).filter(Boolean) as { base64: string; mimeType: string; label: string }[];
      if (pieces.length === 0) throw new Error('No readable creations');
      const { imageData } = await mixLook({ avatar, pieces });
      setResult(asDataUrl(imageData));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'MixCreator.mix');
      setError(t('styles.mixError'));
    } finally {
      setIsMixing(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    setError(null);
    try {
      await dispatch(
        addOutfit({
          name: `${t('styles.createMix')} ${new Date().toLocaleDateString()}`,
          itemIds: [],
          imageData: result,
          kind: 'mix',
          source: 'ai',
        }),
      ).unwrap();
      onSaved();
      onClose();
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'MixCreator.save');
      setError(t('styles.generatorSaveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={busy ? undefined : onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: s.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { borderBottomColor: s.modalBorder }]}>
          <Touchable onPress={onClose} disabled={busy} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} borderRadius={20}>
            <ArrowLeftIcon size={22} color={s.headerTitle} />
          </Touchable>
          <LayersIcon size={20} color={s.toneMix} />
          <Text style={[styles.headerTitle, { color: s.headerTitle }]}>{t('styles.createMix')}</Text>
        </View>

        {!hasAnything ? (
          <View style={styles.empty}>
            <LayersIcon size={40} color={s.emptyIcon} />
            <Text style={[styles.emptyText, { color: s.emptySubtitle }]}>{t('styles.mixNoCreations')}</Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Preview: the result, else the avatar it will be applied to */}
              <View style={[styles.preview, { backgroundColor: s.avatarFrameBackground, borderColor: s.avatarFrameBorder }]}>
                {result ? (
                  <Image source={{ uri: result }} style={StyleSheet.absoluteFill} resizeMode="contain" />
                ) : avatarImage ? (
                  <AuthedImage data={avatarImage} style={StyleSheet.absoluteFill} resizeMode="contain" />
                ) : (
                  <View style={styles.previewEmpty}>
                    <Text style={[styles.previewEmptyText, { color: s.modalSubtitle }]}>{t('styles.mixNeedsAvatar')}</Text>
                    <Touchable onPress={onGoToAvatar} borderRadius={10} style={styles.linkBtn}>
                      <Text style={[styles.linkText, { color: s.buttonPrimary }]}>{t('styles.avatarCreate')}</Text>
                    </Touchable>
                  </View>
                )}
                {isMixing && (
                  <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: s.imageLoadingOverlay }]}>
                    <ActivityIndicator color={s.toneMix} />
                    <Text style={[styles.overlayText, { color: s.toneMix }]}>{t('styles.avatarGenerating')}</Text>
                  </View>
                )}
              </View>

              <View style={styles.block}>
                <Text style={[styles.label, { color: s.modalTitle }]}>{t('styles.mixOccasionLabel')}</Text>
                <TextInput
                  value={occasion}
                  onChangeText={setOccasion}
                  maxLength={200}
                  editable={!busy}
                  placeholder={t('styles.ideasOccasionPlaceholder')}
                  placeholderTextColor={s.creatorInputPlaceholder}
                  style={[
                    styles.input,
                    { backgroundColor: s.creatorInputBackground, borderColor: s.creatorInputBorder, color: s.creatorInputText },
                    busy && styles.disabled,
                  ]}
                />
              </View>

              {SLOTS.map(slot => {
                const options = byKind[slot.kind] ?? [];
                if (options.length === 0) return null;
                const picked = selection[slot.kind];
                return (
                  <View key={slot.kind} style={styles.block}>
                    <View style={styles.slotHeader}>
                      <Text style={[styles.slotLabel, { color: s.modalSubtitle }]}>{t(slot.labelKey)}</Text>
                      {picked && (
                        <Touchable
                          onPress={() => setSelection(c => ({ ...c, [slot.kind]: undefined }))}
                          disabled={busy}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          borderRadius={8}
                        >
                          <Text style={[styles.slotClear, { color: s.cardMeta }]}>{t('styles.mixEmptySlot')}</Text>
                        </Touchable>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slotRow}>
                      {options.map(option => {
                        const active = picked?.id === option.id;
                        return (
                          <Touchable
                            key={option.id}
                            disabled={busy}
                            onPress={() => setSelection(c => ({ ...c, [slot.kind]: active ? undefined : option }))}
                            borderRadius={12}
                            accessibilityLabel={option.name}
                            style={[
                              styles.slotItem,
                              { borderColor: active ? s.toneMix : s.modalBorder, backgroundColor: s.modalBackground },
                              busy && styles.disabled,
                            ]}
                          >
                            <AuthedImage data={option.imageData!} style={styles.slotImage} resizeMode="cover" />
                            {active && (
                              <View style={[styles.slotCheck, { backgroundColor: s.toneMix }]}>
                                <CheckIcon size={12} color={s.toneOnColor} />
                              </View>
                            )}
                          </Touchable>
                        );
                      })}
                    </ScrollView>
                  </View>
                );
              })}

              {error && <Text style={[styles.error, { color: s.actionDangerText }]}>{error}</Text>}
            </ScrollView>

            <View style={[styles.footer, { borderTopColor: s.modalBorder }]}>
              <Touchable
                onPress={handleAdvise}
                disabled={busy}
                borderRadius={14}
                style={[styles.secondaryBtn, { borderColor: s.buttonSecondaryBorder }, busy && styles.disabled]}
              >
                {isAdvising ? <ActivityIndicator size="small" color={s.buttonSecondaryText} /> : <Wand2Icon size={16} color={s.buttonSecondaryText} />}
                <Text style={[styles.btnText, { color: s.buttonSecondaryText }]}>{t('styles.mixAutocomplete')}</Text>
                <GemIcon size={12} color={s.buttonSecondaryText} />
                <Text style={[styles.btnText, { color: s.buttonSecondaryText }]}>{COMPLETE_MIX_GEM_COST}</Text>
              </Touchable>
              {result ? (
                <Touchable
                  onPress={handleSave}
                  disabled={busy}
                  borderRadius={14}
                  style={[styles.primaryBtn, { backgroundColor: s.buttonPrimary }, busy && styles.disabled]}
                >
                  {isSaving ? <ActivityIndicator size="small" color={s.buttonPrimaryText} /> : <CheckIcon size={16} color={s.buttonPrimaryText} />}
                  <Text style={[styles.btnText, { color: s.buttonPrimaryText }]}>{t('styles.generatorSave')}</Text>
                </Touchable>
              ) : (
                <Touchable
                  onPress={handleMix}
                  disabled={busy || chosen.length === 0 || !avatarImage}
                  borderRadius={14}
                  style={[
                    styles.primaryBtn,
                    { backgroundColor: s.toneMix },
                    (busy || chosen.length === 0 || !avatarImage) && styles.disabled,
                  ]}
                >
                  <SparklesIcon size={16} color={s.toneOnColor} />
                  <Text style={[styles.btnText, { color: s.toneOnColor }]}>{t('styles.mixGenerate')}</Text>
                  <GemIcon size={12} color={s.toneOnColor} />
                  <Text style={[styles.btnText, { color: s.toneOnColor }]}>{MIX_GEM_COST}</Text>
                </Touchable>
              )}
            </View>
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyText: { fontSize: 14, textAlign: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 18, paddingBottom: 32 },
  preview: {
    width: '70%',
    alignSelf: 'center',
    aspectRatio: 3 / 4,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewEmpty: { padding: 16, alignItems: 'center', gap: 8 },
  previewEmptyText: { fontSize: 13, textAlign: 'center' },
  linkBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  linkText: { fontSize: 14, fontWeight: '700' },
  overlay: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  overlayText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  block: { gap: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  input: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  slotHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  slotLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  slotClear: { fontSize: 11, fontWeight: '700' },
  slotRow: { gap: 8 },
  slotItem: { width: 80, height: 96, borderRadius: 12, borderWidth: 2, overflow: 'hidden' },
  slotImage: { width: '100%', height: '100%' },
  slotCheck: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { fontSize: 13, textAlign: 'center' },
  footer: { padding: 16, gap: 10, borderTopWidth: StyleSheet.hairlineWidth },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
  },
  btnText: { fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});

export default MixCreator;
