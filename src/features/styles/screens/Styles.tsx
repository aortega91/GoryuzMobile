import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import Touchable from '@components/Touchable';
import BottomSheet from '@components/BottomSheet';
import UpgradeModal, { RequiredPlan } from '@components/UpgradeModal';
import SubmodulesCoachMark from '@components/SubmodulesCoachMark';
import useStylesTheme from '@hooks/useStylesTheme';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  BotIcon,
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  HandIcon,
  LayersIcon,
  LayoutGridIcon,
  LightbulbIcon,
  PaletteIcon,
  PersonStandingIcon,
  PlusIcon,
  ScissorsIcon,
  ShirtIcon,
  SmileIcon,
  StarIcon,
  TagIcon,
  ApparelIcon,
  CommentIcon,
  FramePersonIcon,
} from '@assets/icons';
import { updateProfile, UpdateProfilePayload } from '@features/profile/api/profileUpdateApi';
import { updateProfileLocally, loadProfile } from '@features/home/profileSlice';
import { logError } from '@utilities/crashlytics';
import toast from '@utilities/toast';
import { AppDispatch, RootState } from '@utilities/store';
import { addCalendarEvent } from '@features/schedule/api/calendarApi';
import { loadCollection } from '@features/collection/collectionSlice';
import {
  asDataUrl,
  combineOutfit,
  generateHaircut,
  generateMakeup,
  generateNails,
  generateTechSheet,
  toBase64Image,
} from '../api/stylesGenerateApi';
import {
  loadOutfits,
  addOutfit,
  editOutfit,
  removeOutfit,
  clearCreateChoiceRequest,
  openStylistChat,
} from '../stylesSlice';
import { BeautyKind, Outfit, OutfitKind, TechSheet } from '../types';
import OutfitCard from '../components/OutfitCard';
import OutfitDetailSheet from '../components/OutfitDetailSheet';
import TagSheet from '../components/TagSheet';
import TechSheetSheet from '../components/TechSheetSheet';
import ScheduleOutfitSheet from '../components/ScheduleOutfitSheet';
import ManualOutfitCreator from '../components/ManualOutfitCreator';
import BeautyDesignCreator from '../components/BeautyDesignCreator';
import OutfitIdeasCreator from '../components/OutfitIdeasCreator';
import MixCreator from '../components/MixCreator';
import AvatarSection from '../components/AvatarSection';
import PresetChips from '../components/PresetChips';
import ColorimetrySection from '../components/colorimetry/ColorimetrySection';
import ColorimetryWizard from '../components/colorimetry/ColorimetryWizard';
import { seasonLabel } from '../colorimetry/labels';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StylesTab = 'looks' | 'prompt' | 'body' | 'colorimetry' | 'tags';
type Tab = StylesTab;

interface StylesProps {
  /** Tab to open on mount — used by Home's shortcuts and checklist tasks. */
  initialTab?: StylesTab;
  /** Colour results' "see my closet" link; hidden while the host doesn't pass it. */
  onGoToCloset?: () => void;
}
type Sheet = 'detail' | 'tags' | 'schedule' | 'techSheet' | null;
type KindFilter = OutfitKind | 'all';
type Creator = 'manual' | 'ai' | 'ideas' | 'mix' | BeautyKind | null;
type IconCmp = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

const BOTTOM_TAB_HEIGHT = 56;
const TRY_ON_GEM_COST = 10;
const RATINGS = [1, 2, 3, 4, 5];

/** Kind filter row at the top of the grid, same order as zena. */
const KIND_TABS: { id: KindFilter; Icon: IconCmp; labelKey: string }[] = [
  { id: 'all', Icon: LayoutGridIcon, labelKey: 'styles.kindAll' },
  { id: 'outfit', Icon: ShirtIcon, labelKey: 'styles.kindOutfit' },
  { id: 'hair', Icon: ScissorsIcon, labelKey: 'styles.kindHair' },
  { id: 'nails', Icon: HandIcon, labelKey: 'styles.kindNails' },
  { id: 'makeup', Icon: SmileIcon, labelKey: 'styles.kindMakeup' },
  { id: 'mix', Icon: LayersIcon, labelKey: 'styles.kindMix' },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

function Styles({ initialTab = 'looks', onGoToCloset }: StylesProps) {
  const { t, i18n } = useTranslation();
  const theme = useStylesTheme();
  const s = theme.styles;
  const dispatch = useDispatch<AppDispatch>();
  const insets = useSafeAreaInsets();

  const outfits = useSelector((state: RootState) => state.styles.outfits);
  const outfitsStatus = useSelector((state: RootState) => state.styles.outfitsStatus);
  const createChoiceRequested = useSelector((state: RootState) => state.styles.createChoiceRequested);
  const closetItems = useSelector((state: RootState) => state.collection.items);
  const closetStatus = useSelector((state: RootState) => state.collection.status);
  const profile = useSelector((state: RootState) => state.profile.data);

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [sheetLoading, setSheetLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Grid filters
  const [kindFilter, setKindFilter] = useState<KindFilter>('all');
  const [openFilter, setOpenFilter] = useState<'rating' | 'tags' | null>(null);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Creation
  const [showCreate, setShowCreate] = useState(false);
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [creator, setCreator] = useState<Creator>(null);
  const [creatorSaving, setCreatorSaving] = useState(false);
  const [dressingOutfitId, setDressingOutfitId] = useState<string | null>(null);
  const [upgradePlan, setUpgradePlan] = useState<RequiredPlan | null>(null);

  // ─── Load data ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (outfitsStatus === 'idle') dispatch(loadOutfits());
    if (closetStatus === 'idle') dispatch(loadCollection());
  }, [dispatch, outfitsStatus, closetStatus]);

  // Arriving from the Closet shortcut: open straight on the outfit-method
  // step — there it was already decided that an outfit is what's wanted.
  useEffect(() => {
    if (!createChoiceRequested) return;
    setActiveTab('looks');
    setCreateStep(2);
    setShowCreate(true);
    dispatch(clearCreateChoiceRequest());
  }, [createChoiceRequested, dispatch]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(loadOutfits());
    setRefreshing(false);
  }, [dispatch]);

  // ─── Derived ─────────────────────────────────────────────────────────────────

  const availableTags = useMemo(() => profile?.availableTags ?? [], [profile?.availableTags]);
  const isVip = profile?.plan === 'vip';

  const kindCounts = useMemo(() => {
    const counts: Record<KindFilter, number> = { all: outfits.length, outfit: 0, hair: 0, nails: 0, makeup: 0, mix: 0 };
    outfits.forEach(o => {
      counts[o.kind] += 1;
    });
    return counts;
  }, [outfits]);

  // Tags accumulate: an outfit matches if it has ANY of the chosen tags.
  const visibleOutfits = useMemo(
    () =>
      outfits.filter(o => {
        if (kindFilter !== 'all' && o.kind !== kindFilter) return false;
        if (selectedRatings.length > 0 && !selectedRatings.includes(o.rating ?? 0)) return false;
        if (selectedTags.length > 0 && !selectedTags.some(tag => o.tags.includes(tag))) return false;
        return true;
      }),
    [outfits, kindFilter, selectedRatings, selectedTags],
  );

  const closetIds = useMemo(() => new Set(closetItems.map(i => i.id)), [closetItems]);
  const hasMissingItems = useCallback(
    (outfit: Outfit) =>
      closetStatus === 'succeeded' && outfit.items.some(item => !closetIds.has(item.id)),
    [closetIds, closetStatus],
  );

  const activeFilterCount = selectedRatings.length + selectedTags.length;
  const bottomBarTotalHeight = BOTTOM_TAB_HEIGHT + insets.bottom;

  // ─── Profile helpers ─────────────────────────────────────────────────────────

  const saveProfile = useCallback(
    async (patch: UpdateProfilePayload) => {
      try {
        const updated = await updateProfile(patch);
        dispatch(updateProfileLocally(updated));
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), 'styles/saveProfile');
        toast.error(t('styles.profileSaveError'));
      }
    },
    [dispatch, t],
  );

  // ─── Sheet handlers ──────────────────────────────────────────────────────────

  const openSheet = useCallback((sheet: Sheet, outfit: Outfit) => {
    setSelectedOutfit(outfit);
    setActiveSheet(sheet);
  }, []);

  const closeSheet = useCallback(() => {
    setActiveSheet(null);
    setSelectedOutfit(null);
    setSheetLoading(false);
  }, []);

  const handleDetailSave = async ({ name, rating }: { name: string; rating: number | null }) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    const patch = name === selectedOutfit.name ? { rating } : { name, rating };
    await dispatch(editOutfit({ id: selectedOutfit.id, ...patch }));
    closeSheet();
  };

  const handleTagsSave = async (tags: string[]) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    await dispatch(editOutfit({ id: selectedOutfit.id, tags }));
    closeSheet();
  };

  const handleSchedule = async (date: string) => {
    if (!selectedOutfit) return;
    setSheetLoading(true);
    try {
      await addCalendarEvent({ date, outfitId: selectedOutfit.id });
    } finally {
      closeSheet();
    }
  };

  const requestSchedule = useCallback(
    (outfit: Outfit) => {
      if (!isVip) {
        setUpgradePlan('vip');
        return;
      }
      openSheet('schedule', outfit);
    },
    [isVip, openSheet],
  );

  const requestDelete = useCallback(
    (outfit: Outfit) => {
      Alert.alert(t('styles.confirmDeleteTitle'), t('styles.confirmDeleteMessage'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('styles.actionDelete'), style: 'destructive', onPress: () => dispatch(removeOutfit(outfit.id)) },
      ]);
    },
    [dispatch, t],
  );

  const showMissingItems = useCallback(() => {
    Alert.alert(t('styles.missingItemTitle'), t('styles.missingItemMessage'));
  }, [t]);

  /** Generates a saved design's tech sheet — its image lives in R2 by now. */
  const handleGenerateTechSheet = useCallback(
    async (outfit: Outfit): Promise<TechSheet | null> => {
      const { kind } = outfit;
      if (!outfit.imageData || (kind !== 'hair' && kind !== 'nails' && kind !== 'makeup')) return null;
      try {
        const image = await toBase64Image(outfit.imageData);
        if (!image) return null;
        const techSheet = await generateTechSheet({
          kind,
          prompt: outfit.designPrompt || outfit.name,
          image,
          language: i18n.language,
        });
        dispatch(loadProfile());
        await dispatch(editOutfit({ id: outfit.id, techSheet })).unwrap();
        return techSheet;
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), 'styles/techSheet');
        toast.error(t('styles.techSheetError'));
        return null;
      }
    },
    [dispatch, i18n.language, t],
  );

  // ─── Try on the avatar ───────────────────────────────────────────────────────

  /**
   * Redoes the creation on the user's body (outfit) or face (beauty design)
   * and stores it as its new preview. A design created without an avatar can
   * be "claimed" this way once there is one.
   */
  const handleTryOn = useCallback(
    async (outfit: Outfit) => {
      const avatarImage = profile?.bodyImage || profile?.avatarImage;
      if (!avatarImage) return;
      setDressingOutfitId(outfit.id);
      try {
        let b64: string;
        if (outfit.kind === 'outfit' || outfit.kind === 'mix') {
          b64 = await combineOutfit({ items: outfit.items, avatarImage });
        } else {
          const avatar = await toBase64Image(avatarImage);
          if (!avatar) throw new Error('Avatar unreadable');
          const req = { prompt: outfit.designPrompt!, avatar };
          b64 =
            outfit.kind === 'hair'
              ? await generateHaircut(req)
              : outfit.kind === 'makeup'
              ? await generateMakeup(req)
              // Shape and target weren't stored with the design: redo it with
              // the nails flow's defaults, like zena.
              : await generateNails({ ...req, shape: 'almond', target: 'hands' });
        }
        dispatch(loadProfile());
        await dispatch(editOutfit({ id: outfit.id, imageData: asDataUrl(b64) })).unwrap();
      } catch (err) {
        logError(err instanceof Error ? err : new Error(String(err)), 'styles/tryOnAvatar');
        toast.error(t('styles.tryOnError'));
      } finally {
        setDressingOutfitId(null);
      }
    },
    [dispatch, profile?.avatarImage, profile?.bodyImage, t],
  );

  /** Before spending: without an avatar or the original prompt there is nothing to redo. */
  const requestTryOn = useCallback(
    (outfit: Outfit) => {
      if (!profile?.bodyImage && !profile?.avatarImage) {
        Alert.alert(t('styles.avatarMissingTitle'), t('styles.avatarMissingMessage'), [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('styles.avatarCreate'), onPress: () => setActiveTab('body') },
        ]);
        return;
      }
      if (outfit.kind === 'outfit' && outfit.items.length === 0) return;
      if (outfit.kind === 'mix') {
        Alert.alert(t('styles.tryOnAvatarAction'), t('styles.tryOnMixUnsupported'));
        return;
      }
      if (outfit.kind !== 'outfit' && !outfit.designPrompt) {
        Alert.alert(t('styles.tryOnAvatarAction'), t('styles.tryOnNoPrompt'));
        return;
      }
      Alert.alert(
        t('styles.tryOnConfirmTitle'),
        `${outfit.kind === 'outfit' ? t('styles.tryOnConfirmOutfit') : t('styles.tryOnConfirmDesign')}\n\n${t(
          'styles.tryOnCost',
          { count: TRY_ON_GEM_COST },
        )}`,
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('styles.tryOnAvatarAction'), onPress: () => handleTryOn(outfit) },
        ],
      );
    },
    [handleTryOn, profile?.avatarImage, profile?.bodyImage, t],
  );

  // ─── Creation handlers ───────────────────────────────────────────────────────

  const startCreate = () => {
    setCreateStep(1);
    setShowCreate(true);
  };

  const openCreator = (next: Creator) => {
    setShowCreate(false);
    setCreateStep(1);
    // zena: "Consultar a tu estilista" opens the stylist chat (mounted by Home).
    if (next === 'ai') {
      dispatch(openStylistChat());
      return;
    }
    setCreator(next);
  };

  const handleCreatorSaved = () => {
    setActiveTab('looks');
    setKindFilter('all');
  };

  const handleOutfitSave = async (name: string, itemIds: string[], source: 'manual' | 'ai') => {
    setCreatorSaving(true);
    try {
      await dispatch(addOutfit({ name, itemIds, source })).unwrap();
      setCreator(null);
      handleCreatorSaved();
    } catch {
      // addOutfit.rejected already logs to Crashlytics
      toast.error(t('styles.generatorSaveError'));
    } finally {
      setCreatorSaving(false);
    }
  };

  // ─── Style prompt / avatar prompt (auto-saved) ───────────────────────────────

  const [stylePrompt, setStylePrompt] = useState(profile?.stylePrompt ?? '');
  const [avatarPrompt, setAvatarPrompt] = useState(profile?.avatarPrompt ?? '');
  const [newTagInput, setNewTagInput] = useState('');
  const profileSynced = useRef(false);
  const skipNextSave = useRef(true);

  // Sync local state once the profile arrives after mount
  useEffect(() => {
    if (profile && !profileSynced.current) {
      profileSynced.current = true;
      skipNextSave.current = true;
      setStylePrompt(profile.stylePrompt ?? '');
      setAvatarPrompt(profile.avatarPrompt ?? '');
    }
  }, [profile]);

  // Auto-save with a 1.5s debounce
  useEffect(() => {
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return undefined;
    }
    const timer = setTimeout(() => {
      saveProfile({ stylePrompt, avatarPrompt });
    }, 1500);
    return () => clearTimeout(timer);
  }, [stylePrompt, avatarPrompt, saveProfile]);

  const handleAddTag = () => {
    const tag = newTagInput.trim();
    setNewTagInput('');
    if (!tag || availableTags.includes(tag)) return;
    saveProfile({ availableTags: [...availableTags, tag] });
  };

  const handleDeleteTag = (tag: string) => {
    saveProfile({ availableTags: availableTags.filter(existing => existing !== tag) });
  };

  const toggleIn = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) =>
    setter(prev => (prev.includes(value) ? prev.filter(x => x !== value) : [...prev, value]));

  // ─── Render: Outfits ─────────────────────────────────────────────────────────

  const renderSetupBanner = () =>
    profile && !profile.avatarDescription && !profile.avatarImage ? (
      <Touchable
        onPress={() => setActiveTab('body')}
        borderRadius={10}
        style={[styles.banner, { backgroundColor: s.setupBannerBackground, borderLeftColor: s.setupBannerBorder }]}
      >
        <AlertTriangleIcon size={18} color={s.setupBannerBorder} />
        <Text style={[styles.bannerText, { color: s.headerTitle }]}>{t('styles.setupAvatar')}</Text>
        <ArrowRightIcon size={16} color={s.setupBannerBorder} />
      </Touchable>
    ) : null;

  const renderFilters = () => (
    <>
      <View style={[styles.kindRow, { borderBottomColor: s.outfitCardBorder }]}>
        {KIND_TABS.map(tab => {
          const isActive = kindFilter === tab.id;
          const count = kindCounts[tab.id];
          return (
            <Touchable
              key={tab.id}
              onPress={() => setKindFilter(tab.id)}
              borderRadius={8}
              accessibilityLabel={`${t(tab.labelKey)} (${count})`}
              style={[styles.kindTab, isActive ? { borderBottomColor: s.kindTabActive } : styles.kindTabIdle]}
            >
              <View>
                <tab.Icon size={21} color={isActive ? s.kindTabActive : s.kindTabInactive} />
                <View
                  style={[
                    styles.kindCount,
                    { backgroundColor: isActive ? s.kindCountActiveBackground : s.kindCountBackground },
                  ]}
                >
                  <Text style={[styles.kindCountText, { color: isActive ? s.kindCountActiveText : s.kindCountText }]}>
                    {count}
                  </Text>
                </View>
              </View>
            </Touchable>
          );
        })}
      </View>

      <View style={styles.filterRow}>
        {(['rating', 'tags'] as const).map(id => {
          const count = id === 'rating' ? selectedRatings.length : selectedTags.length;
          const isOpen = openFilter === id;
          const active = count > 0 || isOpen;
          const color = active ? s.kindCountActiveText : s.filterPillText;
          const Icon = id === 'rating' ? StarIcon : TagIcon;
          return (
            <Touchable
              key={id}
              onPress={() => setOpenFilter(isOpen ? null : id)}
              borderRadius={16}
              style={[
                styles.filterPill,
                active
                  ? { backgroundColor: s.kindCountActiveBackground, borderColor: s.kindTabActive }
                  : { backgroundColor: s.filterPillBackground, borderColor: s.filterPillBorder },
              ]}
            >
              <Icon size={13} color={color} />
              <Text style={[styles.filterPillText, { color }]}>
                {id === 'rating' ? t('styles.filterStars') : t('styles.filterTags')}
              </Text>
              {count > 0 && (
                <View style={[styles.filterCount, { backgroundColor: s.buttonPrimary }]}>
                  <Text style={[styles.filterCountText, { color: s.buttonPrimaryText }]}>{count}</Text>
                </View>
              )}
              <ChevronDownIcon size={13} color={color} />
            </Touchable>
          );
        })}
        <Text style={[styles.resultCount, { color: s.cardMeta }]} numberOfLines={1}>
          {t('styles.resultCount', { count: visibleOutfits.length })}
        </Text>
      </View>

      {openFilter && (
        <View style={[styles.filterPanel, { backgroundColor: s.cardInfoBackground, borderColor: s.outfitCardBorder }]}>
          {openFilter === 'rating' ? (
            <View style={styles.chipsWrap}>
              {RATINGS.map(r => {
                const isOn = selectedRatings.includes(r);
                return (
                  <Touchable
                    key={r}
                    onPress={() => toggleIn(setSelectedRatings, r)}
                    borderRadius={14}
                    style={[
                      styles.panelChip,
                      isOn
                        ? { backgroundColor: s.starFilled, borderColor: s.starFilled }
                        : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                    ]}
                  >
                    <Text style={[styles.panelChipText, { color: isOn ? s.toneOnColor : s.choiceText }]}>{r}</Text>
                    <StarIcon
                      size={11}
                      color={isOn ? s.toneOnColor : s.choiceText}
                      fill={isOn ? s.toneOnColor : 'none'}
                      strokeWidth={isOn ? 0 : 2}
                    />
                  </Touchable>
                );
              })}
            </View>
          ) : availableTags.length === 0 ? (
            <Touchable onPress={() => setActiveTab('tags')} borderRadius={8}>
              <Text style={[styles.panelLink, { color: s.buttonPrimary }]}>{t('styles.tagsGoCreate')}</Text>
            </Touchable>
          ) : (
            <View style={styles.chipsWrap}>
              {availableTags.map(tag => {
                const isOn = selectedTags.includes(tag);
                return (
                  <Touchable
                    key={tag}
                    onPress={() => toggleIn(setSelectedTags, tag)}
                    borderRadius={14}
                    style={[
                      styles.panelChip,
                      isOn
                        ? { backgroundColor: s.buttonPrimary, borderColor: s.buttonPrimary }
                        : { backgroundColor: s.choiceBackground, borderColor: s.choiceBorder },
                    ]}
                  >
                    {isOn && <CheckIcon size={11} color={s.buttonPrimaryText} />}
                    <Text style={[styles.panelChipText, { color: isOn ? s.buttonPrimaryText : s.choiceText }]}>{tag}</Text>
                  </Touchable>
                );
              })}
            </View>
          )}
          {activeFilterCount > 0 && (
            <Touchable
              onPress={() => {
                setSelectedRatings([]);
                setSelectedTags([]);
              }}
              borderRadius={8}
              style={styles.clearFilters}
            >
              <Text style={[styles.clearFiltersText, { color: s.cardMeta }]}>{t('styles.filtersClear')}</Text>
            </Touchable>
          )}
        </View>
      )}
    </>
  );

  const renderLooksTab = () => {
    if (outfitsStatus === 'loading' && outfits.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={s.buttonPrimary} />
        </View>
      );
    }

    if (outfits.length === 0) {
      return (
        <View style={[styles.emptyContainer, { paddingBottom: bottomBarTotalHeight + 16 }]}>
          {renderSetupBanner()}
          <View style={[styles.dashedBox, { borderColor: s.emptyIcon }]}>
            <Text style={[styles.emptySub, { color: s.emptySubtitle }]}>{t('styles.noOutfitsSaved')}</Text>
            <Touchable onPress={startCreate} borderRadius={10} style={[styles.emptyBtn, { backgroundColor: s.buttonPrimary }]}>
              <Text style={[styles.emptyBtnText, { color: s.buttonPrimaryText }]}>{t('styles.createFirstOutfit')}</Text>
            </Touchable>
          </View>
        </View>
      );
    }

    return (
      <FlatList
        style={styles.tabContent}
        data={visibleOutfits}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={[styles.gridContent, { paddingBottom: bottomBarTotalHeight + 16 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {renderSetupBanner()}
            {renderFilters()}
          </View>
        }
        ListEmptyComponent={
          <View style={[styles.noMatches, { borderColor: s.outfitCardBorder }]}>
            <Text style={[styles.emptySub, { color: s.cardMeta }]}>{t('styles.noMatches')}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.gridCell}>
            <OutfitCard
              outfit={item}
              hasMissingItems={hasMissingItems(item)}
              isDressing={dressingOutfitId === item.id}
              scheduleLocked={!isVip}
              onOpen={() => openSheet('detail', item)}
              onTags={() => openSheet('tags', item)}
              onTechSheet={() => openSheet('techSheet', item)}
              onSchedule={() => requestSchedule(item)}
              onTryOn={() => requestTryOn(item)}
              onDelete={() => requestDelete(item)}
              onMissingItems={showMissingItems}
            />
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    );
  };

  // ─── Render: other submodules ────────────────────────────────────────────────

  const renderScroll = (children: React.ReactNode) => (
    <ScrollView
      style={styles.tabContent}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomBarTotalHeight + 32 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );

  const renderSectionTitle = (title: string, subtitle: string) => (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, { color: s.modalTitle }]}>{title}</Text>
      <Text style={[styles.sectionSub, { color: s.modalSubtitle }]}>{subtitle}</Text>
    </View>
  );

  const renderPromptTab = () => (
    renderScroll(<>
      {renderSectionTitle(t('styles.tabPromptFull'), t('styles.stylePromptDescription'))}
      <PresetChips flow="style" value={stylePrompt} onSelect={setStylePrompt} />
      <TextInput
        value={stylePrompt}
        onChangeText={setStylePrompt}
        multiline
        textAlignVertical="top"
        placeholder={t('styles.essenceStylePlaceholder')}
        placeholderTextColor={s.essenceInputPlaceholder}
        style={[
          styles.promptInput,
          { backgroundColor: s.essenceInputBackground, borderColor: s.essenceInputBorder, color: s.essenceInputText },
        ]}
      />
    </>)
  );

  const renderBodyTab = () => (
    renderScroll(<AvatarSection
        profile={profile}
        avatarPrompt={avatarPrompt}
        onChangeAvatarPrompt={setAvatarPrompt}
        onSaveProfile={saveProfile}
        onUpgrade={() => setUpgradePlan('vip')}
      />)
  );

  const renderColorimetryTab = () => {
    const savedSeason = (profile as { colorimetryProfile?: { season?: string } | null } | null)?.colorimetryProfile
      ?.season;
    const badge = profile?.colorSeason
      ? savedSeason
        ? seasonLabel(t, savedSeason, profile.colorSeason)
        : profile.colorSeason
      : null;

    return (
      renderScroll(<>
        {renderSectionTitle(t('styles.colorimetryTitle'), t('styles.colorimetryDesc'))}
        <ColorimetrySection
          title={t('styles.colorimetry.sectionTitle')}
          description={t('styles.colorimetry.sectionHint')}
          badge={badge}
        >
          <ColorimetryWizard
            profile={profile}
            closet={closetItems}
            onGoToCloset={onGoToCloset}
            onUpgrade={setUpgradePlan}
          />
        </ColorimetrySection>
      </>)
    );
  };

  const renderTagsTab = () => (
    renderScroll(<>
      {renderSectionTitle(t('styles.tabTags'), t('styles.tagsSubtitle'))}
      <View style={[styles.tagInputWrap, { backgroundColor: s.essenceSectionBackground, borderColor: s.essenceSectionBorder }]}>
        <TextInput
          value={newTagInput}
          onChangeText={setNewTagInput}
          placeholder={t('styles.tagsNewPlaceholder')}
          placeholderTextColor={s.essenceInputPlaceholder}
          returnKeyType="done"
          onSubmitEditing={handleAddTag}
          style={[styles.tagInput, { color: s.essenceInputText }]}
        />
        <Touchable
          onPress={handleAddTag}
          disabled={!newTagInput.trim()}
          borderRadius={10}
          accessibilityLabel={t('styles.tagsCreate')}
          style={[styles.tagAddBtn, { backgroundColor: s.buttonPrimary }, !newTagInput.trim() && styles.faded]}
        >
          <PlusIcon size={18} color={s.buttonPrimaryText} />
        </Touchable>
      </View>

      {availableTags.length === 0 ? (
        <Text style={[styles.tagsEmpty, { color: s.cardMeta }]}>{t('styles.tagsManageEmpty')}</Text>
      ) : (
        <View style={styles.chipsWrap}>
          {availableTags.map(tag => (
            <View key={tag} style={[styles.manageChip, { backgroundColor: s.tagsChipBackground, borderColor: s.tagsChipBorder }]}>
              <Text style={[styles.manageChipText, { color: s.tagsChipText }]}>{tag}</Text>
              <Touchable
                onPress={() => handleDeleteTag(tag)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                borderRadius={10}
                accessibilityLabel={`${t('styles.actionDelete')}: ${tag}`}
              >
                <CloseIcon size={12} color={s.tagsChipRemove} />
              </Touchable>
            </View>
          ))}
        </View>
      )}
    </>)
  );

  // ─── Submodule bar ───────────────────────────────────────────────────────────

  // Short labels for the bar, full ones for the coach mark — same split as
  // zena's `label` / `shortLabel`.
  const TABS: { key: Tab; label: string; fullLabel: string; hintKey: string; Icon: IconCmp }[] = [
    { key: 'looks', label: t('styles.tabLooks'), fullLabel: t('styles.tabLooks'), hintKey: 'styles.hintLooks', Icon: ApparelIcon },
    { key: 'prompt', label: t('styles.tabPrompt'), fullLabel: t('styles.tabPromptFull'), hintKey: 'styles.hintPrompt', Icon: CommentIcon },
    { key: 'body', label: t('styles.tabBody'), fullLabel: t('styles.tabBodyFull'), hintKey: 'styles.hintBody', Icon: FramePersonIcon },
    { key: 'colorimetry', label: t('styles.tabColorimetry'), fullLabel: t('styles.tabColorimetryFull'), hintKey: 'styles.hintColorimetry', Icon: PaletteIcon },
    { key: 'tags', label: t('styles.tabTags'), fullLabel: t('styles.tabTags'), hintKey: 'styles.hintTags', Icon: TagIcon },
  ];

  // ─── Creation sheet options ──────────────────────────────────────────────────

  const beautyOptions: { key: BeautyKind; label: string; Icon: IconCmp; color: string }[] = [
    { key: 'hair', label: t('styles.createHaircuts'), Icon: ScissorsIcon, color: s.toneHair },
    { key: 'makeup', label: t('styles.createMakeup'), Icon: SmileIcon, color: s.toneMakeup },
    { key: 'nails', label: t('styles.createNails'), Icon: HandIcon, color: s.toneNails },
  ];

  const methodOptions: {
    key: Creator;
    title: string;
    desc: string;
    Icon: IconCmp;
    iconColor: string;
    bg: string;
    border: string;
    titleColor: string;
    descColor: string;
  }[] = [
    {
      key: 'manual',
      title: t('styles.createManual'),
      desc: t('styles.createManualDesc'),
      Icon: ShirtIcon,
      iconColor: s.modalTitle,
      bg: s.outfitCardMosaicBackground,
      border: s.modalBorder,
      titleColor: s.modalTitle,
      descColor: s.modalSubtitle,
    },
    {
      key: 'ai',
      title: t('styles.createAI'),
      desc: t('styles.createAIDesc'),
      Icon: BotIcon,
      iconColor: s.createAiIcon,
      bg: s.createAiBackground,
      border: s.createAiBorder,
      titleColor: s.createAiTitle,
      descColor: s.createAiDesc,
    },
    {
      key: 'ideas',
      title: t('styles.createIdeas'),
      desc: t('styles.createIdeasDesc'),
      Icon: LightbulbIcon,
      iconColor: s.toneIdeas,
      bg: s.createIdeasBackground,
      border: s.createIdeasBorder,
      titleColor: s.createIdeasTitle,
      descColor: s.createIdeasDesc,
    },
  ];

  const beautyCreator: BeautyKind | null =
    creator === 'hair' || creator === 'makeup' || creator === 'nails' ? creator : null;

  return (
    <View style={[styles.root, { backgroundColor: s.background }]}>
      {/* Header — the create action lives next to the title, like Closet */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: s.headerTitle }]}>{t('styles.title')}</Text>
          <Text style={[styles.headerSubtitle, { color: s.headerSubtitle }]} numberOfLines={1}>
            {t('styles.subtitle')}
          </Text>
        </View>
        <Touchable
          onPress={startCreate}
          borderRadius={22}
          accessibilityLabel={t('styles.createDesign')}
          style={[styles.createBtn, { backgroundColor: s.fabBackground }]}
        >
          <PlusIcon size={22} color={s.fabIcon} />
        </Touchable>
      </View>

      {activeTab === 'looks' && renderLooksTab()}
      {activeTab === 'prompt' && renderPromptTab()}
      {activeTab === 'body' && renderBodyTab()}
      {activeTab === 'colorimetry' && renderColorimetryTab()}
      {activeTab === 'tags' && renderTagsTab()}

      {/* Creation sheet */}
      {showCreate && (
        <BottomSheet
          onClose={() => {
            setShowCreate(false);
            setCreateStep(1);
          }}
          backgroundColor={s.modalBackground}
          backdropColor={s.modalBackdrop}
        >
          <View style={[styles.sheetHeader, { borderBottomColor: s.modalBorder }]}>
            {createStep === 2 && (
              <Touchable
                onPress={() => setCreateStep(1)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                borderRadius={20}
                style={styles.sheetBack}
              >
                <ArrowLeftIcon size={20} color={s.modalTitle} />
              </Touchable>
            )}
            <Text
              style={[
                styles.sheetTitle,
                { color: s.modalTitle },
                createStep === 1 ? styles.sheetTitleCenter : styles.sheetTitleLeft,
              ]}
            >
              {createStep === 1 ? t('styles.createTitle') : t('styles.createOutfitTitle')}
            </Text>
          </View>

          {createStep === 1 && (
            <View style={styles.createGrid}>
              <Touchable
                onPress={() => setCreateStep(2)}
                borderRadius={20}
                style={[styles.createCard, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}
              >
                <View style={[styles.createIconCircle, { backgroundColor: s.modalBackground }]}>
                  <ShirtIcon size={28} color={s.createOutfitsIcon} />
                </View>
                <Text style={[styles.createCardLabel, { color: s.modalTitle }]}>{t('styles.createOutfits')}</Text>
              </Touchable>
              {beautyOptions.map(opt => (
                <Touchable
                  key={opt.key}
                  onPress={() => openCreator(opt.key)}
                  borderRadius={20}
                  style={[styles.createCard, { backgroundColor: s.outfitCardMosaicBackground, borderColor: s.modalBorder }]}
                >
                  <View style={[styles.createIconCircle, { backgroundColor: s.modalBackground }]}>
                    <opt.Icon size={28} color={opt.color} />
                  </View>
                  <Text style={[styles.createCardLabel, { color: s.modalTitle }]}>{opt.label}</Text>
                </Touchable>
              ))}
              {/* Full width and last: it isn't another category, it gathers the existing ones */}
              <Touchable
                onPress={() => openCreator('mix')}
                borderRadius={20}
                style={[styles.createMix, { backgroundColor: s.createMixBackground, borderColor: s.createMixBorder }]}
              >
                <View style={[styles.createMixIcon, { backgroundColor: s.modalBackground }]}>
                  <PersonStandingIcon size={22} color={s.toneMix} />
                </View>
                <Text style={[styles.createMixLabel, { color: s.createMixTitle }]}>{t('styles.createMix')}</Text>
              </Touchable>
            </View>
          )}

          {createStep === 2 && (
            <View style={styles.createMethods}>
              <Text style={[styles.createMethodsHint, { color: s.modalSubtitle }]}>{t('styles.createChooseMethod')}</Text>
              {methodOptions.map(opt => (
                <Touchable
                  key={String(opt.key)}
                  onPress={() => openCreator(opt.key)}
                  borderRadius={16}
                  style={[styles.createMethod, { backgroundColor: opt.bg, borderColor: opt.border }]}
                >
                  <View style={[styles.createMethodIcon, { backgroundColor: s.modalBackground }]}>
                    <opt.Icon size={22} color={opt.iconColor} />
                  </View>
                  <View style={styles.createMethodText}>
                    <Text style={[styles.createMethodTitle, { color: opt.titleColor }]}>{opt.title}</Text>
                    <Text style={[styles.createMethodDesc, { color: opt.descColor }]}>{opt.desc}</Text>
                  </View>
                </Touchable>
              ))}
            </View>
          )}
        </BottomSheet>
      )}

      {/* Submodule bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: s.bottomBarBackground,
            borderTopColor: s.bottomBarBorder,
            height: bottomBarTotalHeight,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.key;
          const color = isActive ? s.bottomBarActive : s.bottomBarInactive;
          return (
            <Touchable key={tab.key} onPress={() => setActiveTab(tab.key)} borderRadius={8} style={styles.bottomTabItem}>
              <tab.Icon size={22} color={color} strokeWidth={isActive ? 2.5 : 1.75} />
              <Text style={[styles.bottomTabLabel, { color }]} numberOfLines={1}>
                {tab.label}
              </Text>
            </Touchable>
          );
        })}
      </View>

      <SubmodulesCoachMark
        viewId="stylist"
        barHeight={bottomBarTotalHeight}
        items={TABS.map(tab => ({ id: tab.key, Icon: tab.Icon, label: tab.fullLabel, hint: t(tab.hintKey) }))}
      />

      {/* Sheets */}
      {activeSheet === 'detail' && selectedOutfit && (
        <OutfitDetailSheet
          outfit={selectedOutfit}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleDetailSave}
          onSchedule={
            selectedOutfit.kind === 'outfit'
              ? () => {
                  if (!isVip) {
                    closeSheet();
                    setUpgradePlan('vip');
                    return;
                  }
                  setActiveSheet('schedule');
                }
              : undefined
          }
        />
      )}

      {activeSheet === 'tags' && selectedOutfit && (
        <TagSheet
          outfitName={selectedOutfit.name}
          currentTags={selectedOutfit.tags}
          allTags={availableTags}
          loading={sheetLoading}
          onClose={closeSheet}
          onSave={handleTagsSave}
          onGoToTags={() => {
            closeSheet();
            setActiveTab('tags');
          }}
        />
      )}

      {activeSheet === 'techSheet' && selectedOutfit && (
        <TechSheetSheet outfit={selectedOutfit} onClose={closeSheet} onGenerate={handleGenerateTechSheet} />
      )}

      {activeSheet === 'schedule' && selectedOutfit && (
        <ScheduleOutfitSheet
          outfit={selectedOutfit}
          loading={sheetLoading}
          onClose={closeSheet}
          onSchedule={handleSchedule}
        />
      )}

      {/* Creators */}
      {beautyCreator && (
        <BeautyDesignCreator
          kind={beautyCreator}
          profile={profile}
          outfits={outfits}
          onClose={() => setCreator(null)}
          onSaved={handleCreatorSaved}
        />
      )}
      {creator === 'ideas' && <OutfitIdeasCreator onClose={() => setCreator(null)} />}
      {creator === 'mix' && (
        <MixCreator
          outfits={outfits}
          profile={profile}
          onClose={() => setCreator(null)}
          onSaved={handleCreatorSaved}
          onGoToAvatar={() => {
            setCreator(null);
            setActiveTab('body');
          }}
        />
      )}
      <ManualOutfitCreator
        visible={creator === 'manual'}
        closetItems={closetItems}
        closetLoading={closetStatus === 'loading'}
        saving={creatorSaving}
        onClose={() => setCreator(null)}
        onSave={(name, itemIds) => handleOutfitSave(name, itemIds, 'manual')}
      />
      <UpgradeModal
        visible={upgradePlan !== null}
        requiredPlan={upgradePlan ?? 'vip'}
        onUpgrade={() => setUpgradePlan(null)}
        onClose={() => setUpgradePlan(null)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, lineHeight: 20 },
  createBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  tabContent: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },

  // Setup banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderRadius: 10,
  },
  bannerText: { flex: 1, fontSize: 13, fontWeight: '700' },

  // Kind tabs + filters
  listHeader: { gap: 10, paddingBottom: 12 },
  kindRow: { flexDirection: 'row', borderBottomWidth: StyleSheet.hairlineWidth },
  kindTab: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderBottomWidth: 3 },
  kindTabIdle: { borderBottomColor: 'transparent' },
  kindCount: {
    position: 'absolute',
    top: -7,
    right: -11,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindCountText: { fontSize: 9, fontWeight: '700' },
  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '700' },
  filterCount: { minWidth: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  filterCountText: { fontSize: 10, fontWeight: '700' },
  resultCount: { flex: 1, textAlign: 'right', fontSize: 12 },
  filterPanel: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 10 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  panelChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  panelChipText: { fontSize: 12, fontWeight: '700' },
  panelLink: { fontSize: 12, fontWeight: '700' },
  clearFilters: { alignSelf: 'flex-start' },
  clearFiltersText: { fontSize: 12, fontWeight: '700' },

  // Grid — two columns
  gridContent: { paddingHorizontal: 16, paddingTop: 4 },
  gridRow: { gap: 12, marginBottom: 12 },
  gridCell: { flex: 1, maxWidth: '50%' },
  noMatches: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
  },

  // Empty / loading
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyContainer: { flex: 1, padding: 16, gap: 12 },
  dashedBox: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  emptyBtnText: { fontSize: 15, fontWeight: '600' },

  // Submodules
  sectionHead: { gap: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionSub: { fontSize: 13, lineHeight: 18 },
  promptInput: {
    minHeight: 220,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 12,
  },
  primaryBtnText: { fontSize: 14, fontWeight: '700' },
  errorText: { fontSize: 13, textAlign: 'center' },
  tagInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingLeft: 14,
    paddingRight: 6,
  },
  tagInput: { flex: 1, fontSize: 14, paddingVertical: 12 },
  tagAddBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tagsEmpty: { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  manageChipText: { fontSize: 12, fontWeight: '700' },

  // Creation sheet
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetBack: { marginRight: 8 },
  sheetTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  sheetTitleCenter: { textAlign: 'center' },
  sheetTitleLeft: { textAlign: 'left' },
  createGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12 },
  createCard: {
    width: '47%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  createIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createCardLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  createMix: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  createMixIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  createMixLabel: { fontSize: 14, fontWeight: '700' },
  createMethods: { padding: 16, gap: 12 },
  createMethodsHint: { fontSize: 13, textAlign: 'center', marginBottom: 4 },
  createMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
  },
  createMethodIcon: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  createMethodText: { flex: 1, gap: 3 },
  createMethodTitle: { fontSize: 15, fontWeight: '700' },
  createMethodDesc: { fontSize: 12, lineHeight: 17 },

  // Submodule bar
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  bottomTabItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 6 },
  bottomTabLabel: { fontSize: 10, fontWeight: '600', paddingHorizontal: 2 },

  disabled: { opacity: 0.6 },
  faded: { opacity: 0.3 },
});

export default Styles;
