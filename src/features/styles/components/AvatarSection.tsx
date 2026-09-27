import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import AuthedImage from '@components/AuthedImage';
import Touchable from '@components/Touchable';
import useStylesTheme from '@hooks/useStylesTheme';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  CameraIcon,
  CheckIcon,
  CloseIcon,
  GemIcon,
  ImageIcon,
  LockIcon,
  PersonStandingIcon,
  SmileIcon,
  TrashIcon,
  UserIcon,
  Wand2Icon,
} from '@assets/icons';
import { UserProfile } from '@features/home/api/profileApi';
import { UpdateProfilePayload } from '@features/profile/api/profileUpdateApi';
import { loadProfile, updateProfileLocally } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import { AppDispatch } from '@utilities/store';
import {
  asDataUrl,
  generateAvatarImage,
  generateFaceAvatar,
  toBase64Image,
  validateBodyPhoto,
} from '../api/stylesGenerateApi';

interface Props {
  profile: UserProfile | null;
  avatarPrompt: string;
  onChangeAvatarPrompt: (value: string) => void;
  /** Persists a profile patch (POST /profile) and syncs Redux. */
  onSaveProfile: (patch: UpdateProfilePayload) => Promise<void>;
  onUpgrade: () => void;
}

type PhotoTarget = 'body' | 'face';

/** zena GEM_COSTS.generateAvatar / generateFaceAvatar. */
const AVATAR_GEM_COST = 10;

/**
 * Avatar submodule (zena StylistView "avatar" tab). Two avatars, two paths:
 * the BODY avatar wears the outfits and can come from a photo, a description
 * or both; the FACE avatar is the close-up canvas for hair, beard and makeup
 * and only comes from a photo. The uploaded photos are raw material and are
 * never shown — only the generated result is.
 */
function AvatarSection({ profile, avatarPrompt, onChangeAvatarPrompt, onSaveProfile, onUpgrade }: Props) {
  const { t } = useTranslation();
  const { styles: s } = useStylesTheme();
  const dispatch = useDispatch<AppDispatch>();
  const { openCamera, openGallery } = useCameraPermission();

  const [validating, setValidating] = useState<PhotoTarget | null>(null);
  const [isGeneratingBody, setIsGeneratingBody] = useState(false);
  const [isGeneratingFace, setIsGeneratingFace] = useState(false);

  const isVip = profile?.plan === 'vip';
  // `useAvatarGeneration` arrives null until touched: only an explicit true counts.
  const useAvatarInOutfits = isVip && profile?.useAvatarGeneration === true;
  const busy = validating != null || isGeneratingBody || isGeneratingFace;

  const showError = (title: string, message: string) => Alert.alert(title, message);

  const uploadPhoto = async (target: PhotoTarget, source: 'camera' | 'gallery') => {
    const res = source === 'camera' ? await openCamera() : await openGallery();
    if (res.status !== 'success') return;
    const asset = res.response.assets?.[0];
    if (!asset?.base64 || !asset.type) return;

    setValidating(target);
    try {
      // Same check for both: the only thing that invalidates a photo is more
      // than one person in it, or none.
      const validation = await validateBodyPhoto({ imageBase64: asset.base64, mimeType: asset.type });
      if (!validation.isValid) {
        showError(t('styles.avatarPhotoInvalidTitle'), `${validation.reason}\n\n${t('styles.avatarPhotoInvalidHint')}`);
        return;
      }
      const dataUri = `data:${asset.type};base64,${asset.base64}`;
      await onSaveProfile(target === 'body' ? { bodyImage: dataUri } : { faceImage: dataUri });
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), `styles/avatar.${target}Photo`);
      showError(t('styles.avatarPhotoInvalidTitle'), t('styles.bodyPhotoError'));
    } finally {
      setValidating(null);
    }
  };

  const pickPhoto = (target: PhotoTarget) => {
    Alert.alert(
      target === 'face' ? t('styles.avatarFacePhotoUpload') : t('styles.avatarPhotoUpload'),
      target === 'face' ? t('styles.avatarFaceHint') : t('styles.avatarBodyHint'),
      [
        { text: t('styles.photoFromCamera'), onPress: () => uploadPhoto(target, 'camera') },
        { text: t('styles.photoFromGallery'), onPress: () => uploadPhoto(target, 'gallery') },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  };

  const handleGenerateBody = async () => {
    const description = avatarPrompt.trim();
    // Either ingredient is enough: the photo alone gives likeness, the text
    // alone an invented avatar, and together is when it comes out best.
    if (!description && !profile?.bodyImage) return;
    setIsGeneratingBody(true);
    try {
      const ref = profile?.bodyImage ? await toBase64Image(profile.bodyImage) : null;
      const result = await generateAvatarImage({
        description,
        referenceImageBase64: ref?.base64,
        mimeType: ref?.mimeType,
      });
      // The endpoint already stores avatarImage + avatarDescription.
      dispatch(updateProfileLocally({ avatarImage: result.avatarUrl || result.avatarImage, avatarPrompt: description }));
      dispatch(loadProfile());
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'styles/avatar.generateBody');
      showError(t('styles.avatarGenerationErrorTitle'), t('styles.essenceAvatarError'));
    } finally {
      setIsGeneratingBody(false);
    }
  };

  /** The face takes no description: without a photo there's nothing to portray. */
  const handleGenerateFace = async () => {
    if (!profile?.faceImage) return;
    setIsGeneratingFace(true);
    try {
      const ref = await toBase64Image(profile.faceImage);
      if (!ref) throw new Error('Face photo unreadable');
      const image = await generateFaceAvatar(ref);
      dispatch(loadProfile());
      // Unlike the body avatar, this endpoint doesn't persist — save it.
      await onSaveProfile({ faceAvatarImage: asDataUrl(image, 'image/jpeg') });
    } catch (err) {
      logError(err instanceof Error ? err : new Error(String(err)), 'styles/avatar.generateFace');
      showError(t('styles.avatarGenerationErrorTitle'), t('styles.essenceAvatarError'));
    } finally {
      setIsGeneratingFace(false);
    }
  };

  const gated = (action: () => void) => () => (isVip ? action() : onUpgrade());

  const renderPhotoRow = (target: PhotoTarget) => {
    const hasPhoto = target === 'body' ? !!profile?.bodyImage : !!profile?.faceImage;
    const isValidating = validating === target;
    const bg = target === 'body' ? s.bodyReadyBackground : s.faceReadyBackground;
    const border = target === 'body' ? s.bodyReadyBorder : s.faceReadyBorder;
    const text = target === 'body' ? s.bodyReadyText : s.faceReadyText;
    const tone = target === 'body' ? s.toneBody : s.toneFace;

    if (hasPhoto) {
      return (
        <View style={[styles.readyRow, { backgroundColor: bg, borderColor: border }]}>
          <CheckIcon size={16} color={tone} />
          <Text style={[styles.readyText, { color: text }]}>
            {target === 'body' ? t('styles.avatarPhotoReady') : t('styles.avatarFacePhotoReady')}
          </Text>
          <Touchable onPress={() => pickPhoto(target)} disabled={busy} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }} borderRadius={8}>
            <Text style={[styles.readyLink, { color: text }]}>{t('styles.avatarPhotoChange')}</Text>
          </Touchable>
          <Touchable
            onPress={() => onSaveProfile(target === 'body' ? { bodyImage: '' } : { faceImage: '' })}
            disabled={busy}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            borderRadius={12}
            accessibilityLabel={t('styles.avatarPhotoRemove')}
          >
            <CloseIcon size={16} color={tone} />
          </Touchable>
        </View>
      );
    }
    return (
      <Touchable
        onPress={() => pickPhoto(target)}
        disabled={busy}
        borderRadius={12}
        style={[styles.uploadBtn, { borderColor: s.avatarFrameBorder, backgroundColor: s.essenceSectionBackground }, busy && styles.disabled]}
      >
        {isValidating ? <ActivityIndicator size="small" color={tone} /> : <CameraIcon size={18} color={s.modalTitle} />}
        <Text style={[styles.uploadText, { color: s.modalTitle }]}>
          {isValidating
            ? t('styles.avatarPhotoValidating')
            : target === 'body'
            ? t('styles.avatarPhotoUpload')
            : t('styles.avatarFacePhotoUpload')}
        </Text>
      </Touchable>
    );
  };

  const renderGenerateButton = (
    label: string,
    tone: string,
    loading: boolean,
    disabled: boolean,
    onPress: () => void,
  ) => (
    <Touchable
      onPress={gated(onPress)}
      disabled={isVip && (disabled || busy)}
      borderRadius={12}
      style={[styles.generateBtn, { backgroundColor: tone }, isVip && (disabled || busy) && styles.disabled]}
    >
      {loading ? <ActivityIndicator size="small" color={s.toneOnColor} /> : <Wand2Icon size={16} color={s.toneOnColor} />}
      <Text style={[styles.generateText, { color: s.toneOnColor }]}>{label}</Text>
      {isVip ? (
        <>
          <GemIcon size={12} color={s.toneOnColor} />
          <Text style={[styles.generateText, { color: s.toneOnColor }]}>{AVATAR_GEM_COST}</Text>
        </>
      ) : (
        <LockIcon size={13} color={s.toneOnColor} />
      )}
    </Touchable>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.intro}>
        <Text style={[styles.introTitle, { color: s.modalTitle }]}>{t('styles.tabBodyFull')}</Text>
        <Text style={[styles.introText, { color: s.modalSubtitle }]}>{t('styles.avatarIntro')}</Text>
      </View>

      {/* ── Body ───────────────────────────────────────────────── */}
      <View style={[styles.card, { borderColor: s.essenceSectionBorder, backgroundColor: s.essenceSectionBackground }]}>
        <View style={styles.cardHeader}>
          <PersonStandingIcon size={18} color={s.toneBody} />
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: s.modalTitle }]}>{t('styles.avatarBodyTitle')}</Text>
            <Text style={[styles.cardHint, { color: s.modalSubtitle }]}>{t('styles.avatarBodyHint')}</Text>
          </View>
        </View>

        {/* The result rules: no empty frame until there's something to see. */}
        {(profile?.avatarImage || isGeneratingBody) && (
          <View style={[styles.bodyFrame, { borderColor: s.avatarFrameBorder, backgroundColor: s.avatarFrameBackground }]}>
            {profile?.avatarImage ? (
              <AuthedImage data={profile.avatarImage} style={StyleSheet.absoluteFill} resizeMode="contain" />
            ) : null}
            {isGeneratingBody && (
              <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: s.imageLoadingOverlay }]}>
                <ActivityIndicator color={s.buttonPrimary} />
                <Text style={[styles.overlayText, { color: s.buttonPrimary }]}>{t('styles.avatarGenerating')}</Text>
              </View>
            )}
          </View>
        )}

        {profile?.avatarImage ? (
          <Touchable
            onPress={() => {
              onChangeAvatarPrompt('');
              onSaveProfile({ avatarImage: '', avatarDescription: '', avatarPrompt: '' });
            }}
            disabled={busy}
            borderRadius={8}
            style={styles.deleteBtn}
          >
            <TrashIcon size={14} color={s.actionDangerText} />
            <Text style={[styles.deleteText, { color: s.actionDangerText }]}>{t('styles.avatarDelete')}</Text>
          </Touchable>
        ) : null}

        {renderPhotoRow('body')}

        <TextInput
          value={avatarPrompt}
          onChangeText={onChangeAvatarPrompt}
          multiline
          editable={!busy}
          textAlignVertical="top"
          placeholder={t('styles.essenceAvatarDescPlaceholder')}
          placeholderTextColor={s.essenceInputPlaceholder}
          style={[
            styles.textarea,
            { backgroundColor: s.essenceInputBackground, borderColor: s.essenceInputBorder, color: s.essenceInputText },
            busy && styles.disabled,
          ]}
        />

        {renderGenerateButton(
          profile?.avatarImage ? t('styles.avatarRecreate') : t('styles.avatarCreate'),
          s.buttonPrimary,
          isGeneratingBody,
          !avatarPrompt.trim() && !profile?.bodyImage,
          handleGenerateBody,
        )}
      </View>

      {/* ── Face ───────────────────────────────────────────────── */}
      <View style={[styles.card, { borderColor: s.essenceSectionBorder, backgroundColor: s.essenceSectionBackground }]}>
        <View style={styles.cardHeader}>
          <SmileIcon size={18} color={s.toneFace} />
          <View style={styles.cardHeaderText}>
            <Text style={[styles.cardTitle, { color: s.modalTitle }]}>{t('styles.avatarFaceTitle')}</Text>
            <Text style={[styles.cardHint, { color: s.modalSubtitle }]}>{t('styles.avatarFaceHint')}</Text>
          </View>
        </View>

        {(profile?.faceAvatarImage || isGeneratingFace) && (
          <View style={[styles.faceFrame, { borderColor: s.avatarFrameBorder, backgroundColor: s.avatarFrameBackground }]}>
            {profile?.faceAvatarImage ? (
              <AuthedImage data={profile.faceAvatarImage} style={StyleSheet.absoluteFill} resizeMode="contain" />
            ) : null}
            {isGeneratingFace && (
              <View style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: s.imageLoadingOverlay }]}>
                <ActivityIndicator color={s.toneFace} />
                <Text style={[styles.overlayText, { color: s.toneFace }]}>{t('styles.avatarGenerating')}</Text>
              </View>
            )}
          </View>
        )}

        {profile?.faceAvatarImage ? (
          <Touchable
            onPress={() => onSaveProfile({ faceAvatarImage: '' })}
            disabled={busy}
            borderRadius={8}
            style={styles.deleteBtn}
          >
            <TrashIcon size={14} color={s.actionDangerText} />
            <Text style={[styles.deleteText, { color: s.actionDangerText }]}>{t('styles.avatarFaceDelete')}</Text>
          </Touchable>
        ) : null}

        {renderPhotoRow('face')}

        {renderGenerateButton(
          profile?.faceAvatarImage ? t('styles.avatarFaceRecreate') : t('styles.avatarFaceCreate'),
          s.toneFace,
          isGeneratingFace,
          !profile?.faceImage,
          handleGenerateFace,
        )}
      </View>

      {/* The switch closes the path: it only makes sense once an avatar exists. */}
      {profile?.avatarImage ? (
        <View style={[styles.toggleRow, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
          <View style={[styles.toggleIcon, { backgroundColor: s.essenceInputBackground }]}>
            {useAvatarInOutfits ? (
              <UserIcon size={18} color={s.toneTechSheet} />
            ) : (
              <ImageIcon size={18} color={s.modalSubtitle} />
            )}
          </View>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleTitle, { color: s.modalTitle }]}>{t('styles.avatarUseInOutfits')}</Text>
            <Text style={[styles.toggleHint, { color: s.modalSubtitle }]}>{t('styles.avatarUseInOutfitsHint')}</Text>
          </View>
          <Touchable
            onPress={gated(() => onSaveProfile({ useAvatarGeneration: !useAvatarInOutfits }))}
            borderRadius={12}
            accessibilityLabel={t('styles.avatarUseInOutfits')}
            style={[
              styles.switch,
              { backgroundColor: useAvatarInOutfits ? s.essenceToggleActive : s.essenceToggleInactive },
            ]}
          >
            <View
              style={[
                styles.switchKnob,
                { backgroundColor: s.toneOnColor },
                useAvatarInOutfits ? styles.switchKnobOn : styles.switchKnobOff,
              ]}
            />
          </Touchable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  intro: { gap: 4 },
  introTitle: { fontSize: 18, fontWeight: '700' },
  introText: { fontSize: 13, lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  cardHeaderText: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 14, fontWeight: '700' },
  cardHint: { fontSize: 12, lineHeight: 16 },
  bodyFrame: {
    width: '100%',
    maxWidth: 280,
    alignSelf: 'center',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  faceFrame: {
    width: 200,
    alignSelf: 'center',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 3,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  overlay: { alignItems: 'center', justifyContent: 'center', gap: 6 },
  overlayText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'center', padding: 4 },
  deleteText: { fontSize: 12, fontWeight: '700' },
  readyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  readyText: { flex: 1, fontSize: 14, fontWeight: '600' },
  readyLink: { fontSize: 12, fontWeight: '700' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadText: { fontSize: 14, fontWeight: '700' },
  textarea: { height: 96, borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 14, lineHeight: 20 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  generateText: { fontSize: 14, fontWeight: '700' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, borderWidth: 1 },
  toggleIcon: { padding: 8, borderRadius: 12 },
  toggleText: { flex: 1, gap: 2 },
  toggleTitle: { fontSize: 13, fontWeight: '700' },
  toggleHint: { fontSize: 11 },
  switch: { width: 48, height: 24, borderRadius: 12, justifyContent: 'center' },
  switchKnob: { width: 16, height: 16, borderRadius: 8, position: 'absolute', top: 4 },
  switchKnobOn: { left: 28 },
  switchKnobOff: { left: 4 },
  disabled: { opacity: 0.6 },
});

export default AvatarSection;
