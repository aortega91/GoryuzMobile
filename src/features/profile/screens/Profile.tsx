import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

import Touchable from '@components/Touchable';
import PermissionModal from '@components/PermissionModal';
import { RootState, AppDispatch } from '@utilities/store';
import { logError } from '@utilities/crashlytics';
import { clearSession } from '@features/auth/sessionSlice';
import { updateProfileLocally, loadProfile } from '@features/home/profileSlice';
import { setThemePreference, AppThemePreference } from '@utilities/appThemeSlice';
import useCameraPermission from '@hooks/useCameraPermission';
import {
  ArrowLeftIcon,
  CameraIcon,
  CheckIcon,
  CrownIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  GemIcon,
  TrashIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
} from '@assets/icons';

import { getImageSource } from '@api/client';
import useProfileTheme from '@hooks/useProfileTheme';
import { updateProfile, deleteAccount } from '../api/profileUpdateApi';

// ─── Option types ─────────────────────────────────────────────────────────────

interface PickerOption {
  value: string;
  label: string;
}

type ActivePicker = 'gender' | 'language' | 'currency' | null;
type ActiveConfirm = 'cancelSubscription' | 'deleteAccount' | null;

// ─── Plan helpers ─────────────────────────────────────────────────────────────

function getPlanName(plan: string, t: (key: string) => string): string {
  if (plan === 'premium') return t('profile.planPremium');
  return t('profile.planFree');
}

// ─── PickerModal ──────────────────────────────────────────────────────────────

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: ReturnType<typeof useProfileTheme>['profile'];
}

function PickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
  colors,
}: PickerModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[pickerStyles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[pickerStyles.container, { backgroundColor: colors.modalBackground }]}>
              <View style={[pickerStyles.header, { borderBottomColor: colors.divider }]}>
                <Text style={[pickerStyles.title, { color: colors.sectionTitle }]}>
                  {title}
                </Text>
              </View>
              {options.map(opt => (
                <Touchable
                  key={opt.value}
                  style={[
                    pickerStyles.option,
                    selected === opt.value && {
                      backgroundColor: colors.pickerActiveBackground,
                    },
                  ]}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  borderRadius={8}
                >
                  <Text
                    style={[
                      pickerStyles.optionText,
                      { color: selected === opt.value ? colors.primary : colors.textPrimary },
                      selected === opt.value
                        ? pickerStyles.optionTextSelected
                        : pickerStyles.optionTextDefault,
                    ]}
                  >
                    {opt.label}
                  </Text>
                  {selected === opt.value && (
                    <CheckIcon size={16} color={colors.primary} />
                  )}
                </Touchable>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const pickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 15,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
  optionTextDefault: {
    fontWeight: '400',
  },
});

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  colors: ReturnType<typeof useProfileTheme>['profile'];
}

function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDanger,
  onConfirm,
  onCancel,
  colors,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={[pickerStyles.backdrop, { backgroundColor: colors.modalBackdrop }]}>
          <TouchableWithoutFeedback>
            <View style={[confirmStyles.container, { backgroundColor: colors.modalBackground }]}>
              <Text
                style={[
                  confirmStyles.title,
                  { color: isDanger ? colors.danger : colors.sectionTitle },
                ]}
              >
                {title}
              </Text>
              <Text style={[confirmStyles.desc, { color: colors.textSecondary }]}>
                {description}
              </Text>
              <View style={confirmStyles.buttons}>
                <Touchable
                  style={[
                    confirmStyles.btn,
                    confirmStyles.btnSecondary,
                    {
                      borderColor: colors.divider,
                      backgroundColor: colors.buttonSecondaryBackground,
                    },
                  ]}
                  onPress={onCancel}
                  borderRadius={12}
                >
                  <Text style={[confirmStyles.btnText, { color: colors.textPrimary }]}>
                    {cancelLabel}
                  </Text>
                </Touchable>
                <Touchable
                  style={[
                    confirmStyles.btn,
                    {
                      backgroundColor: isDanger
                        ? colors.dangerButtonBackground
                        : colors.primary,
                    },
                  ]}
                  onPress={onConfirm}
                  borderRadius={12}
                >
                  <Text style={[confirmStyles.btnText, { color: colors.white }]}>
                    {confirmLabel}
                  </Text>
                </Touchable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const confirmStyles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnSecondary: {
    borderWidth: 1,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

// ─── SectionCard ──────────────────────────────────────────────────────────────

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useProfileTheme>['profile'];
  style?: object;
}

function SectionCard({ title, children, colors, style }: SectionCardProps) {
  return (
    <View
      style={[
        sectionStyles.card,
        { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
        style,
      ]}
    >
      <Text style={[sectionStyles.title, { color: colors.sectionTitle }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
});

// ─── PickerRow ────────────────────────────────────────────────────────────────

interface PickerRowProps {
  label: string;
  value: string;
  onPress: () => void;
  colors: ReturnType<typeof useProfileTheme>['profile'];
}

function PickerRow({ label, value, onPress, colors }: PickerRowProps) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={[fieldStyles.label, { color: colors.fieldLabel }]}>{label}</Text>
      <Touchable
        style={[
          fieldStyles.pickerRow,
          { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
        ]}
        onPress={onPress}
        borderRadius={10}
      >
        <Text style={[fieldStyles.pickerValue, { color: colors.textPrimary }]}>
          {value}
        </Text>
        <ChevronDownIcon size={16} color={colors.iconSecondary} />
      </Touchable>
    </View>
  );
}

// ─── ReadonlyField ────────────────────────────────────────────────────────────

interface ReadonlyFieldProps {
  label: string;
  value: string;
  hint?: string;
  colors: ReturnType<typeof useProfileTheme>['profile'];
}

function ReadonlyField({ label, value, hint, colors }: ReadonlyFieldProps) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={[fieldStyles.label, { color: colors.fieldLabel }]}>{label}</Text>
      <View
        style={[
          fieldStyles.readonlyBox,
          {
            backgroundColor: colors.fieldReadonlyBackground,
            borderColor: colors.inputBorder,
          },
        ]}
      >
        <Text style={[fieldStyles.readonlyText, { color: colors.fieldReadonlyText }]}>
          {value}
        </Text>
      </View>
      {hint ? (
        <Text style={[fieldStyles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerValue: {
    flex: 1,
    fontSize: 15,
  },
  readonlyBox: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  readonlyText: {
    fontSize: 15,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
});

// ─── Main component ────────────────────────────────────────────────────────────

function Profile() {
  const theme = useProfileTheme();
  const pt = theme.profile;
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const profile = useSelector((state: RootState) => state.profile.data);
  const user = useSelector((state: RootState) => state.session.user);
  const themePreference = useSelector((state: RootState) => state.appTheme.preference);

  // Editable local state
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [gender, setGender] = useState(profile?.gender ?? 'neutral');
  const [aiName, setAiName] = useState(profile?.aiName ?? 'GORYUZ');
  const [language, setLanguage] = useState(profile?.language ?? 'es');
  const [currency, setCurrency] = useState(profile?.currency || 'USD');
  const [outfitRepetitionDays, setOutfitRepetitionDays] = useState(
    profile?.outfitRepetitionDays ?? 7,
  );
  const [frequencyText, setFrequencyText] = useState(
    String(profile?.outfitRepetitionDays ?? 7),
  );
  const [localAvatarUri, setLocalAvatarUri] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Sync editable fields when profile loads (profile may arrive after first render)
  const profileId = profile?.id;
  useEffect(() => {
    if (!profile) return;
    setNickname(profile.nickname ?? '');
    setPhone(profile.phone ?? '');
    setGender(profile.gender ?? 'neutral');
    setAiName(profile.aiName ?? 'GORYUZ');
    setLanguage(profile.language ?? 'es');
    setCurrency(profile.currency || 'USD');
    setOutfitRepetitionDays(profile.outfitRepetitionDays ?? 7);
    setFrequencyText(String(profile.outfitRepetitionDays ?? 7));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  // UI state
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);
  const [activeConfirm, setActiveConfirm] = useState<ActiveConfirm>(null);
  const [isDangerOpen, setIsDangerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    openCamera,
    openGallery,
    blockedPermission,
    dismissPermissionModal,
    handleOpenSettings,
  } = useCameraPermission();

  const skipNextAutoSaveRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await dispatch(loadProfile());
      if (loadProfile.fulfilled.match(result)) {
        const fresh = result.payload;
        skipNextAutoSaveRef.current = true;
        setNickname(fresh.nickname ?? '');
        setPhone(fresh.phone ?? '');
        setGender(fresh.gender ?? 'neutral');
        setAiName(fresh.aiName ?? 'GORYUZ');
        setOutfitRepetitionDays(fresh.outfitRepetitionDays ?? 7);
        setFrequencyText(String(fresh.outfitRepetitionDays ?? 7));
        setLanguage(fresh.language ?? 'es');
        setCurrency(fresh.currency || 'USD');
        languageRef.current = fresh.language ?? 'es';
        currencyRef.current = fresh.currency || 'USD';
        if (fresh.language && fresh.language !== i18n.language) {
          i18n.changeLanguage(fresh.language);
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  }, [dispatch]); // eslint-disable-line react-hooks/exhaustive-deps

  // Save toast animation
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastY = useRef(new Animated.Value(-8)).current;
  const isFirstRender = useRef(true);

  // ─── Auto-save ──────────────────────────────────────────────────────────────

  const showSaveToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(toastY, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.timing(toastY, { toValue: -8, duration: 300, useNativeDriver: true }),
        ]).start();
      }, 1800);
    });
  }, [toastOpacity, toastY]);

  // Refs so debounced effect always reads latest language/currency without
  // them being in its dep array (language and currency save immediately).
  const languageRef = useRef(language);
  const currencyRef = useRef(currency);
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { currencyRef.current = currency; }, [currency]);

  // Debounced auto-save for text fields (nickname, phone, gender, aiName).
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      if (isSaving) return;
      if (skipNextAutoSaveRef.current) {
        skipNextAutoSaveRef.current = false;
        return;
      }
      setIsSaving(true);
      try {
        const updated = await updateProfile({
          nickname: nickname || undefined,
          phone,
          gender: (gender as 'male' | 'female' | 'neutral') || undefined,
          aiName,
          outfitRepetitionDays,
          language: languageRef.current,
          currency: currencyRef.current,
        });
        dispatch(updateProfileLocally(updated));
        showSaveToast();
      } catch (err) {
        logError(err, 'profile:autosave');
        Alert.alert(t('common.error'), t('profile.errorUpdate'));
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, phone, gender, aiName, outfitRepetitionDays]);

  // Immediate save for picker fields (language, currency).
  const savePickerField = useCallback(async (newLanguage: string, newCurrency: string) => {
    setIsSaving(true);
    try {
      const updated = await updateProfile({
        nickname: nickname || undefined,
        phone,
        gender: (gender as 'male' | 'female' | 'neutral') || undefined,
        aiName,
        language: newLanguage,
        currency: newCurrency,
      });
      dispatch(updateProfileLocally(updated));
      if (newLanguage !== i18n.language) {
        i18n.changeLanguage(newLanguage);
      }
      showSaveToast();
    } catch (err) {
      logError(err, 'profile:autosave');
      Alert.alert(t('common.error'), t('profile.errorUpdate'));
    } finally {
      setIsSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nickname, phone, gender, aiName, dispatch, showSaveToast, t]);

  // ─── Option lists ────────────────────────────────────────────────────────────

  const genderOptions: PickerOption[] = [
    { value: 'female', label: t('profile.genderFemale') },
    { value: 'male', label: t('profile.genderMale') },
    { value: 'neutral', label: t('profile.genderNeutral') },
  ];

  const languageOptions: PickerOption[] = [
    { value: 'es', label: t('profile.languageEs') },
    { value: 'en', label: t('profile.languageEn') },
    { value: 'pt', label: t('profile.languagePt') },
  ];

  const currencyOptions: PickerOption[] = [
    { value: 'USD', label: t('profile.currencyUSD') },
    { value: 'CAD', label: t('profile.currencyCAD') },
    { value: 'BRL', label: t('profile.currencyBRL') },
    { value: 'MXN', label: t('profile.currencyMXN') },
    { value: 'COP', label: t('profile.currencyCOP') },
    { value: 'CLP', label: t('profile.currencyCLP') },
  ];

  const getLabelForValue = (
    options: PickerOption[],
    value: string,
  ): string => options.find(o => o.value === value)?.label ?? value;

  // ─── Actions ─────────────────────────────────────────────────────────────────

  const handleConfirmDeleteAccount = useCallback(async () => {
    setActiveConfirm(null);
    try {
      await deleteAccount();
      await auth().signOut();
      dispatch(clearSession());
    } catch (err) {
      logError(err, 'profile:deleteAccount');
      Alert.alert(t('common.error'), t('profile.errorUpdate'));
    }
  }, [dispatch, t]);

  const handleConfirmCancelSubscription = useCallback(() => {
    setActiveConfirm(null);
    Alert.alert(
      t('profile.comingSoonTitle'),
      t('profile.manageOnWeb'),
    );
  }, [t]);

  // ─── Avatar upload ────────────────────────────────────────────────────────────

  const uploadAvatar = useCallback(async (base64: string, mimeType: string) => {
    const dataUri = `data:${mimeType};base64,${base64}`;
    setLocalAvatarUri(dataUri);
    setIsUploadingAvatar(true);
    try {
      const updated = await updateProfile({ avatarUrl: dataUri });
      dispatch(updateProfileLocally(updated));
    } catch (err) {
      setLocalAvatarUri(null);
      logError(err, 'profile:avatar-upload');
      Alert.alert(t('common.error'), t('profile.errorUpdate'));
    } finally {
      setIsUploadingAvatar(false);
    }
  }, [dispatch, t]);

  const handleAvatarPress = useCallback(() => {
    Alert.alert(
      t('profile.changePhoto'),
      undefined,
      [
        {
          text: t('collection.addFromCamera'),
          onPress: async () => {
            const result = await openCamera();
            if (result.status !== 'success') return;
            const asset = result.response.assets?.[0];
            if (asset?.base64) {
              uploadAvatar(asset.base64, asset.type ?? 'image/jpeg');
            }
          },
        },
        {
          text: t('collection.addFromGallery'),
          onPress: async () => {
            const result = await openGallery();
            if (result.status !== 'success') return;
            const asset = result.response.assets?.[0];
            if (asset?.base64) {
              uploadAvatar(asset.base64, asset.type ?? 'image/jpeg');
            }
          },
        },
        { text: t('common.cancel'), style: 'cancel' },
      ],
    );
  }, [t, openCamera, openGallery, uploadAvatar]);

  // ─── Derived values ───────────────────────────────────────────────────────────

  const avatarUrl = localAvatarUri ?? profile?.avatarUrl ?? user?.photoURL ?? null;
  const nameInitial = (profile?.name ?? user?.displayName ?? '?').charAt(0).toUpperCase();
  const planName = getPlanName(profile?.plan ?? 'free', t);
  const isPremium = profile?.plan && profile.plan !== 'free';
  const renewalDate = profile?.stripeCurrentPeriodEnd
    ? new Date(profile.stripeCurrentPeriodEnd).toLocaleDateString(language, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <View style={[styles.root, { backgroundColor: pt.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={pt.headerBackground}
      />

      {/* Save toast */}
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: pt.toastBackground,
            top: insets.top + 60,
            opacity: toastOpacity,
            transform: [{ translateY: toastY }],
          },
        ]}
        pointerEvents="none"
      >
        <CheckIcon size={14} color={pt.toastText} />
        <Text style={[styles.toastText, { color: pt.toastText }]}>
          {t('profile.saved')}
        </Text>
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              backgroundColor: pt.headerBackground,
              borderBottomColor: pt.headerBorder,
            },
          ]}
        >
          <Touchable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeftIcon size={22} color={pt.headerIcon} />
          </Touchable>
          <Text style={[styles.headerTitle, { color: pt.headerTitle }]}>
            {t('profile.title')}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 32 },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={pt.primary}
              />
            }
          >
            {/* ── Avatar ── */}
            <View style={styles.avatarSection}>
              <Touchable
                style={styles.avatarWrapper}
                borderRadius={52}
                onPress={handleAvatarPress}
                disabled={isUploadingAvatar}
              >
                {avatarUrl ? (
                  <Image source={getImageSource(avatarUrl)} style={styles.avatar} />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      styles.avatarPlaceholder,
                      { backgroundColor: pt.primary },
                    ]}
                  >
                    <Text style={styles.avatarInitial}>{nameInitial}</Text>
                  </View>
                )}
                <View style={[styles.avatarOverlay, isUploadingAvatar && styles.avatarOverlayLoading]}>
                  <CameraIcon size={16} color="#FFFFFF" />
                </View>
              </Touchable>

              <View
                style={[
                  styles.gemBadge,
                  { backgroundColor: pt.gemBadgeBackground, borderColor: pt.gemBadgeBorder },
                ]}
              >
                <GemIcon size={12} color={pt.gemBadgeText} strokeWidth={2} />
                <Text style={[styles.gemBadgeText, { color: pt.gemBadgeText }]}>
                  {t('profile.avatarGemCost')}
                </Text>
              </View>
              <Text style={[styles.avatarHint, { color: pt.textSecondary }]}>
                {t('profile.avatarHint')}
              </Text>
            </View>

            {/* ── Datos personales ── */}
            <SectionCard title={t('profile.personalInfo')} colors={pt}>
              <ReadonlyField
                label={t('profile.name')}
                value={profile?.name ?? user?.displayName ?? '—'}
                hint={t('profile.fieldReadonly')}
                colors={pt}
              />
              <ReadonlyField
                label={t('profile.email')}
                value={profile?.email ?? user?.email ?? '—'}
                colors={pt}
              />

              <View style={fieldStyles.wrapper}>
                <Text style={[fieldStyles.label, { color: pt.fieldLabel }]}>
                  {t('profile.username')}
                </Text>
                <View
                  style={[
                    styles.usernameRow,
                    { backgroundColor: pt.inputBackground, borderColor: pt.inputBorder },
                  ]}
                >
                  <Text style={[styles.atSign, { color: pt.iconSecondary }]}>@</Text>
                  <TextInput
                    style={[styles.textInput, { color: pt.inputText }]}
                    value={nickname}
                    onChangeText={text =>
                      setNickname(text.replace(/[^a-zA-Z0-9_]/g, ''))
                    }
                    placeholder="usuario_unico"
                    placeholderTextColor={pt.iconSecondary}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={fieldStyles.wrapper}>
                <Text style={[fieldStyles.label, { color: pt.fieldLabel }]}>
                  {t('profile.phone')}
                </Text>
                <TextInput
                  style={[
                    styles.textInputStandalone,
                    {
                      color: pt.inputText,
                      backgroundColor: pt.inputBackground,
                      borderColor: pt.inputBorder,
                    },
                  ]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+1 555 000 0000"
                  placeholderTextColor={pt.iconSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <PickerRow
                label={t('profile.gender')}
                value={getLabelForValue(genderOptions, gender)}
                onPress={() => setActivePicker('gender')}
                colors={pt}
              />

              <View style={fieldStyles.wrapper}>
                <Text style={[fieldStyles.label, { color: pt.fieldLabel }]}>
                  {t('profile.frequency')}
                </Text>
                <TextInput
                  style={[
                    styles.textInputStandalone,
                    {
                      color: pt.inputText,
                      backgroundColor: pt.inputBackground,
                      borderColor: pt.inputBorder,
                    },
                  ]}
                  value={frequencyText}
                  onChangeText={val => {
                    setFrequencyText(val);
                    const n = parseInt(val, 10);
                    if (!Number.isNaN(n) && n >= 1 && n <= 60) {
                      setOutfitRepetitionDays(n);
                    }
                  }}
                  onBlur={() => {
                    const n = parseInt(frequencyText, 10);
                    const clamped = Number.isNaN(n) || n < 1 ? 1 : Math.min(n, 60);
                    setOutfitRepetitionDays(clamped);
                    setFrequencyText(String(clamped));
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholderTextColor={pt.iconSecondary}
                />
                <Text style={[fieldStyles.hint, { color: pt.textSecondary }]}>
                  {t('profile.frequencyHint')}
                </Text>
              </View>
            </SectionCard>

            {/* ── Suscripción ── */}
            <SectionCard title={t('profile.subscription')} colors={pt}>
              <View style={styles.planRow}>
                <View
                  style={[
                    styles.planBadge,
                    {
                      backgroundColor: isPremium
                        ? pt.planBadgePremiumBackground
                        : pt.planBadgeFreeBackground,
                      borderColor: isPremium
                        ? pt.planBadgePremiumBorder
                        : pt.cardBorder,
                    },
                  ]}
                >
                  <CrownIcon
                    size={14}
                    color={isPremium ? pt.planBadgePremiumText : pt.planBadgeFreeText}
                  />
                  <Text
                    style={[
                      styles.planBadgeText,
                      {
                        color: isPremium
                          ? pt.planBadgePremiumText
                          : pt.planBadgeFreeText,
                      },
                    ]}
                  >
                    {planName}
                  </Text>
                </View>
                {renewalDate && (
                  <Text style={[styles.renewalText, { color: pt.textSecondary }]}>
                    {t('profile.renewal')}: {renewalDate}
                  </Text>
                )}
              </View>

              <View style={styles.subscriptionButtons}>
                {isPremium && (
                  <Touchable
                    style={[
                      styles.subscriptionBtn,
                      styles.subscriptionBtnDanger,
                      { borderColor: pt.danger },
                    ]}
                    onPress={() => setActiveConfirm('cancelSubscription')}
                    borderRadius={10}
                  >
                    <Text style={[styles.subscriptionBtnText, { color: pt.danger }]}>
                      {t('profile.cancelSubscription')}
                    </Text>
                  </Touchable>
                )}
                <Touchable
                  style={[
                    styles.subscriptionBtn,
                    { backgroundColor: pt.primarySoft },
                  ]}
                  onPress={() =>
                    Alert.alert(
                      t('profile.comingSoonTitle'),
                      t('profile.comingSoonMessage'),
                    )
                  }
                  borderRadius={10}
                >
                  <Text style={[styles.subscriptionBtnText, { color: pt.primary }]}>
                    {t('profile.viewPlans')}
                  </Text>
                </Touchable>
              </View>
            </SectionCard>

            {/* ── Preferencias ── */}
            <SectionCard title={t('profile.preferences')} colors={pt}>
              <View style={fieldStyles.wrapper}>
                <Text style={[fieldStyles.label, { color: pt.fieldLabel }]}>
                  {t('profile.aiName')}
                </Text>
                <TextInput
                  style={[
                    styles.textInputStandalone,
                    {
                      color: pt.inputText,
                      backgroundColor: pt.inputBackground,
                      borderColor: pt.inputBorder,
                    },
                  ]}
                  value={aiName}
                  onChangeText={setAiName}
                  placeholder="GORYUZ"
                  placeholderTextColor={pt.iconSecondary}
                />
              </View>

              <PickerRow
                label={t('profile.language')}
                value={getLabelForValue(languageOptions, language)}
                onPress={() => setActivePicker('language')}
                colors={pt}
              />

              <PickerRow
                label={t('profile.currency')}
                value={getLabelForValue(currencyOptions, currency)}
                onPress={() => setActivePicker('currency')}
                colors={pt}
              />
            </SectionCard>

            {/* ── Tema ── */}
            <SectionCard title={t('profile.appTheme')} colors={pt}>
              <Text style={[styles.themeDescription, { color: pt.textSecondary }]}>
                {t('profile.appThemeDescription')}
              </Text>
              <View style={styles.themeRow}>
                {(
                  [
                    { value: 'light', labelKey: 'profile.themeLight', Icon: SunIcon },
                    { value: 'dark',  labelKey: 'profile.themeDark',  Icon: MoonIcon },
                    { value: 'system', labelKey: 'profile.themeSystem', Icon: MonitorIcon },
                  ] as { value: AppThemePreference; labelKey: string; Icon: React.ComponentType<{ size?: number; color?: string }> }[]
                ).map(({ value, labelKey, Icon }) => {
                  const active = themePreference === value;
                  return (
                    <Touchable
                      key={value}
                      style={[
                        styles.themeBtn,
                        {
                          backgroundColor: active ? pt.primary : pt.inputBackground,
                          borderColor: active ? pt.primary : pt.inputBorder,
                        },
                      ]}
                      borderRadius={10}
                      onPress={() => dispatch(setThemePreference(value))}
                    >
                      <Icon size={18} color={active ? pt.primaryText : pt.textSecondary} />
                      <Text
                        style={[
                          styles.themeBtnLabel,
                          { color: active ? pt.primaryText : pt.textSecondary },
                        ]}
                      >
                        {t(labelKey)}
                      </Text>
                    </Touchable>
                  );
                })}
              </View>
            </SectionCard>

            {/* ── Zona de peligro ── */}
            <View
              style={[
                styles.dangerCard,
                {
                  backgroundColor: pt.dangerCardBackground,
                  borderColor: pt.dangerCardBorder,
                },
              ]}
            >
              <Touchable
                style={styles.dangerHeader}
                onPress={() => setIsDangerOpen(prev => !prev)}
                borderRadius={14}
              >
                <View style={styles.dangerHeaderLeft}>
                  <AlertTriangleIcon size={18} color={pt.dangerTitle} />
                  <Text style={[styles.dangerTitle, { color: pt.dangerTitle }]}>
                    {t('profile.dangerZone')}
                  </Text>
                </View>
                <ChevronDownIcon
                  size={18}
                  color={pt.dangerTitle}
                  strokeWidth={isDangerOpen ? 2.5 : 2}
                />
              </Touchable>

              {isDangerOpen && (
                <View style={styles.dangerBody}>
                  <Text style={[styles.dangerSubtitle, { color: pt.textSecondary }]}>
                    {t('profile.dangerZoneSubtitle')}
                  </Text>
                  <View
                    style={[
                      styles.deleteRow,
                      {
                        backgroundColor: pt.cardBackground,
                        borderColor: pt.divider,
                      },
                    ]}
                  >
                    <View style={styles.deleteRowText}>
                      <Text style={[styles.deleteTitle, { color: pt.textPrimary }]}>
                        {t('profile.deleteAccount')}
                      </Text>
                      <Text style={[styles.deleteDesc, { color: pt.textSecondary }]}>
                        {t('profile.deleteAccountDesc', {
                          handle: nickname || profile?.nickname || 'usuario',
                        })}
                      </Text>
                    </View>
                    <Touchable
                      style={[
                        styles.deleteButton,
                        { backgroundColor: pt.dangerButtonBackground },
                      ]}
                      onPress={() => setActiveConfirm('deleteAccount')}
                      borderRadius={10}
                    >
                      <TrashIcon size={16} color={pt.white} />
                      <Text style={[styles.deleteButtonText, { color: pt.white }]}>
                        {t('profile.deleteAccount')}
                      </Text>
                    </Touchable>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* ── Pickers ── */}
      <PickerModal
        visible={activePicker === 'gender'}
        title={t('profile.selectGender')}
        options={genderOptions}
        selected={gender}
        onSelect={setGender}
        onClose={() => setActivePicker(null)}
        colors={pt}
      />
      <PickerModal
        visible={activePicker === 'language'}
        title={t('profile.selectLanguage')}
        options={languageOptions}
        selected={language}
        onSelect={(val) => {
          setLanguage(val);
          savePickerField(val, currencyRef.current);
        }}
        onClose={() => setActivePicker(null)}
        colors={pt}
      />
      <PickerModal
        visible={activePicker === 'currency'}
        title={t('profile.selectCurrency')}
        options={currencyOptions}
        selected={currency}
        onSelect={(val) => {
          setCurrency(val);
          savePickerField(languageRef.current, val);
        }}
        onClose={() => setActivePicker(null)}
        colors={pt}
      />

      {/* ── Confirm modals ── */}
      <ConfirmModal
        visible={activeConfirm === 'cancelSubscription'}
        title={t('profile.cancelSubscriptionTitle')}
        description={t('profile.cancelSubscriptionDesc')}
        confirmLabel={t('profile.cancelSubscriptionConfirm')}
        cancelLabel={t('profile.keepSubscription')}
        isDanger
        onConfirm={handleConfirmCancelSubscription}
        onCancel={() => setActiveConfirm(null)}
        colors={pt}
      />
      <ConfirmModal
        visible={activeConfirm === 'deleteAccount'}
        title={t('profile.deleteAccountConfirmTitle')}
        description={t('profile.deleteAccountConfirmDesc')}
        confirmLabel={t('profile.deleteAccountConfirm')}
        cancelLabel={t('common.cancel')}
        isDanger
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setActiveConfirm(null)}
        colors={pt}
      />

      {blockedPermission && (
        <PermissionModal
          type={blockedPermission}
          onOpenSettings={handleOpenSettings}
          onDismiss={dismissPermissionModal}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerSpacer: {
    width: 30,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },
  // Avatar
  avatarSection: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlayLoading: {
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  gemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  gemBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  avatarHint: {
    fontSize: 12,
  },
  // Text inputs
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  atSign: {
    fontSize: 15,
    marginRight: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  textInputStandalone: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  // Subscription
  planRow: {
    gap: 8,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  renewalText: {
    fontSize: 12,
  },
  subscriptionButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  subscriptionBtn: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 120,
  },
  subscriptionBtnDanger: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  subscriptionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  // Danger zone
  dangerCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  dangerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  dangerBody: {
    paddingHorizontal: 18,
    paddingBottom: 18,
    gap: 12,
  },
  dangerSubtitle: {
    fontSize: 12,
  },
  deleteRow: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  deleteRowText: {
    gap: 4,
  },
  deleteTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Toast
  toast: {
    position: 'absolute',
    right: 16,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
  },
  // Theme section
  themeDescription: {
    fontSize: 12,
    marginBottom: 12,
    lineHeight: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  themeBtnLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Profile;
