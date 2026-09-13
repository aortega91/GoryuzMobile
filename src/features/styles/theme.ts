import commonColors from '@theme/commonColors';
import { Theme, getCommonTheme } from '@theme/index';
import { BrandPalette, withAlpha } from '@theme/palettes';

export interface StylesTheme extends Theme {
  styles: {
    background: string;
    headerTitle: string;
    headerSubtitle: string;

    tabBackground: string;
    tabActive: string;
    tabActiveText: string;
    tabInactiveText: string;
    tabBorder: string;

    bottomBarBackground: string;
    bottomBarBorder: string;
    bottomBarActive: string;
    bottomBarInactive: string;

    outfitCardBackground: string;
    outfitCardBorder: string;
    outfitCardName: string;
    outfitCardMosaicBackground: string;
    outfitCardSourceBadge: string;
    outfitCardSourceText: string;
    outfitCardAIBadge: string;
    outfitCardAIText: string;

    starFilled: string;
    starEmpty: string;

    tagBackground: string;
    tagText: string;
    tagActiveBackground: string;
    tagActiveText: string;

    // Small tag chip overlaid on outfit-card thumbnails (pale accent badge)
    cardTagChipBackground: string;
    cardTagChipText: string;

    emptyIcon: string;
    emptyText: string;
    emptySubtitle: string;

    closetCategoryText: string;
    closetItemBackground: string;
    closetItemBorder: string;
    closetItemSelectedBorder: string;
    closetItemSelectedBadge: string;
    closetItemSelectedCheck: string;

    creatorPreviewBackground: string;
    creatorPreviewBorder: string;
    creatorPreviewEmpty: string;
    creatorPreviewEmptyText: string;
    creatorInputBackground: string;
    creatorInputBorder: string;
    creatorInputText: string;
    creatorInputLabel: string;
    creatorInputPlaceholder: string;

    buttonPrimary: string;
    buttonPrimaryText: string;
    buttonSecondary: string;
    buttonSecondaryText: string;
    buttonSecondaryBorder: string;
    buttonDanger: string;
    buttonDangerText: string;
    buttonDangerBorder: string;

    modalBackground: string;
    modalBackdrop: string;
    modalTitle: string;
    modalSubtitle: string;
    modalBorder: string;
    modalLabel: string;
    modalInputBackground: string;
    modalInputBorder: string;
    modalInputText: string;
    modalInputPlaceholder: string;

    actionIcon: string;
    actionText: string;
    actionDivider: string;
    actionDangerText: string;

    addBtnBackground: string;
    addBtnBorder: string;
    addBtnIcon: string;

    // "Create with AI" method card (create-outfit choice sheet)
    createAiBackground: string;
    createAiBorder: string;
    createAiIcon: string;
    createAiTitle: string;
    createAiDesc: string;

    // Step-1 create-choice grid — "Outfits" icon (the only one of the 4 that's
    // theme-tied in the reference; hair/makeup/nails stay fixed orange/pink/teal)
    createOutfitsIcon: string;

    fabBackground: string;
    fabIcon: string;

    filterPillBackground: string;
    filterPillBorder: string;
    filterPillText: string;
    filterPillActiveBackground: string;
    filterPillActiveBorder: string;
    filterPillActiveText: string;

    // Essence tab
    essenceSectionBackground: string;
    essenceSectionBorder: string;
    essenceInputBackground: string;
    essenceInputBorder: string;
    essenceInputText: string;
    essenceInputPlaceholder: string;
    essenceIconIndigo: string;
    essenceIconPurple: string;
    essenceIconEmerald: string;
    essenceAnalysisBackground: string;
    essenceAnalysisBorder: string;
    essenceAnalysisText: string;
    essenceHeroBg: string;
    essenceHeroBorder: string;
    essenceHeroTitle: string;
    essenceHeroSubtitle: string;
    essenceCardSkyBg: string;
    essenceCardSkyBorder: string;
    essenceCardSkyTitle: string;
    essenceCardPurpleBg: string;
    essenceCardPurpleBorder: string;
    essenceCardPurpleTitle: string;
    essenceCardEmeraldBg: string;
    essenceCardEmeraldBorder: string;
    essenceCardEmeraldTitle: string;
    essenceCardAlertBg: string;
    essenceCardAlertBorder: string;
    essenceCardAlertTitle: string;
    essenceCardBody: string;
    essenceToggleActive: string;
    essenceToggleInactive: string;
    essenceGemsBadgeBackground: string;
    essenceGemsBadgeBorder: string;
    essenceGemsBadgeText: string;
    essenceVipOverlay: string;
  };
}

// ─── Light-structural variant — used by natural/moderno/elegancia ─────────────

function buildStylesLight(palette: BrandPalette): StylesTheme {
  const accent600 = palette.accent[600];
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    styles: {
      background: commonColors.offWhite,
      headerTitle: palette.primary,
      headerSubtitle: commonColors.grayDark,

      tabBackground: commonColors.white,
      tabActive: accent600,
      tabActiveText: commonColors.white,
      tabInactiveText: commonColors.gray,
      tabBorder: commonColors.grayLight,

      bottomBarBackground: commonColors.white,
      bottomBarBorder: commonColors.grayLight,
      bottomBarActive: accent600,
      bottomBarInactive: commonColors.gray,

      outfitCardBackground: commonColors.white,
      outfitCardBorder: commonColors.grayLight,
      outfitCardName: palette.primary,
      outfitCardMosaicBackground: commonColors.offWhite,
      outfitCardSourceBadge: commonColors.grayLight,
      outfitCardSourceText: commonColors.grayDark,
      outfitCardAIBadge: accent600,
      outfitCardAIText: commonColors.white,

      starFilled: accent600,
      starEmpty: commonColors.grayLight,

      tagBackground: commonColors.grayLight,
      tagText: commonColors.grayDark,
      tagActiveBackground: accent600,
      tagActiveText: commonColors.white,

      cardTagChipBackground: palette.accent[50],
      cardTagChipText: palette.accent[700],

      emptyIcon: commonColors.grayLight,
      emptyText: palette.primary,
      emptySubtitle: commonColors.gray,

      closetCategoryText: palette.primary,
      closetItemBackground: commonColors.white,
      closetItemBorder: commonColors.grayLight,
      closetItemSelectedBorder: accent600,
      closetItemSelectedBadge: accent600,
      closetItemSelectedCheck: commonColors.white,

      creatorPreviewBackground: commonColors.white,
      creatorPreviewBorder: commonColors.grayLight,
      creatorPreviewEmpty: commonColors.offWhite,
      creatorPreviewEmptyText: commonColors.gray,
      creatorInputBackground: commonColors.offWhite,
      creatorInputBorder: commonColors.grayLight,
      creatorInputText: palette.primary,
      creatorInputLabel: commonColors.grayDark,
      creatorInputPlaceholder: commonColors.gray,

      buttonPrimary: accent600,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.offWhite,
      buttonSecondaryText: palette.primary,
      buttonSecondaryBorder: commonColors.grayLight,
      buttonDanger: '#FEF2F2',
      buttonDangerText: commonColors.errorRed,
      buttonDangerBorder: '#FECACA',

      modalBackground: commonColors.white,
      modalBackdrop: commonColors.overlayDark,
      modalTitle: palette.primary,
      modalSubtitle: commonColors.grayDark,
      modalBorder: commonColors.grayLight,
      modalLabel: commonColors.grayDark,
      modalInputBackground: commonColors.offWhite,
      modalInputBorder: commonColors.grayLight,
      modalInputText: palette.primary,
      modalInputPlaceholder: commonColors.gray,

      actionIcon: palette.primary,
      actionText: palette.primary,
      actionDivider: commonColors.grayLight,
      actionDangerText: commonColors.errorRed,

      // Fixed violet accent (not theme-tied), matching the reference's ad hoc
      // "add" button styling elsewhere in the app.
      addBtnBackground: '#EDE9FE',
      addBtnBorder: '#C4B5FD',
      addBtnIcon: accent400,

      // "Create with AI" card — the reference ties this to the active theme's
      // accent (bg-accent-50, border-accent-200, text-accent-600/900/700).
      createAiBackground: palette.accent[100],
      createAiBorder: palette.accent[200],
      createAiIcon: accent600,
      createAiTitle: palette.accent[900],
      createAiDesc: palette.accent[700],

      createOutfitsIcon: palette.accent[500],

      fabBackground: accent600,
      fabIcon: commonColors.white,

      filterPillBackground: commonColors.white,
      filterPillBorder: commonColors.grayLight,
      filterPillText: commonColors.grayDark,
      filterPillActiveBackground: accent600,
      filterPillActiveBorder: accent600,
      filterPillActiveText: commonColors.white,

      essenceSectionBackground: commonColors.white,
      essenceSectionBorder: commonColors.grayLight,
      essenceInputBackground: '#F9FAFB',
      essenceInputBorder: commonColors.grayLight,
      essenceInputText: palette.primary,
      essenceInputPlaceholder: commonColors.gray,
      essenceIconIndigo: accent600,
      essenceIconPurple: '#7C3AED',
      essenceIconEmerald: '#059669',
      essenceAnalysisBackground: '#F9FAFB',
      essenceAnalysisBorder: commonColors.grayLight,
      essenceAnalysisText: commonColors.grayDark,
      essenceHeroBg: '#FFFBEB',
      essenceHeroBorder: '#FDE68A',
      essenceHeroTitle: palette.primary,
      essenceHeroSubtitle: commonColors.grayDark,
      essenceCardSkyBg: '#F0F9FF',
      essenceCardSkyBorder: '#BAE6FD',
      essenceCardSkyTitle: '#0C4A6E',
      essenceCardPurpleBg: '#FAF5FF',
      essenceCardPurpleBorder: '#DDD6FE',
      essenceCardPurpleTitle: '#4C1D95',
      essenceCardEmeraldBg: '#ECFDF5',
      essenceCardEmeraldBorder: '#A7F3D0',
      essenceCardEmeraldTitle: '#064E3B',
      essenceCardAlertBg: '#FFF7ED',
      essenceCardAlertBorder: '#FED7AA',
      essenceCardAlertTitle: '#7C2D12',
      essenceCardBody: '#374151',
      essenceToggleActive: accent600,
      essenceToggleInactive: '#D1D5DB',
      essenceGemsBadgeBackground: '#F5F3FF',
      essenceGemsBadgeBorder: '#DDD6FE',
      essenceGemsBadgeText: '#6D28D9',
      essenceVipOverlay: 'rgba(250,245,255,0.85)',
    },
  };
}

// ─── Dark-structural variant — used only by `boutique` ────────────────────────

function buildStylesDark(palette: BrandPalette): StylesTheme {
  const { accentDefault } = palette;
  const accent400 = palette.accent[400];

  return {
    ...getCommonTheme(palette),
    styles: {
      background: commonColors.darkSurface,
      headerTitle: commonColors.offWhite,
      headerSubtitle: commonColors.gray,

      tabBackground: commonColors.darkCard,
      tabActive: accentDefault,
      tabActiveText: commonColors.white,
      tabInactiveText: commonColors.gray,
      tabBorder: commonColors.darkBorder,

      bottomBarBackground: commonColors.darkCard,
      bottomBarBorder: commonColors.darkBorder,
      bottomBarActive: accentDefault,
      bottomBarInactive: 'rgba(255,255,255,0.40)',

      outfitCardBackground: commonColors.darkCard,
      outfitCardBorder: commonColors.darkBorder,
      outfitCardName: commonColors.offWhite,
      outfitCardMosaicBackground: commonColors.darkCard,
      outfitCardSourceBadge: commonColors.darkCard,
      outfitCardSourceText: commonColors.gray,
      outfitCardAIBadge: accentDefault,
      outfitCardAIText: commonColors.white,

      starFilled: accentDefault,
      starEmpty: commonColors.darkBorder,

      tagBackground: commonColors.darkCard,
      tagText: commonColors.gray,
      tagActiveBackground: accentDefault,
      tagActiveText: commonColors.white,

      cardTagChipBackground: withAlpha(accentDefault, 0.4),
      cardTagChipText: palette.accent[300],

      emptyIcon: commonColors.darkBorder,
      emptyText: commonColors.offWhite,
      emptySubtitle: commonColors.gray,

      closetCategoryText: commonColors.offWhite,
      closetItemBackground: commonColors.darkCard,
      closetItemBorder: commonColors.darkBorder,
      closetItemSelectedBorder: accentDefault,
      closetItemSelectedBadge: accentDefault,
      closetItemSelectedCheck: commonColors.white,

      creatorPreviewBackground: commonColors.darkCard,
      creatorPreviewBorder: commonColors.darkBorder,
      creatorPreviewEmpty: commonColors.darkCard,
      creatorPreviewEmptyText: commonColors.gray,
      creatorInputBackground: commonColors.darkCard,
      creatorInputBorder: commonColors.darkBorder,
      creatorInputText: commonColors.offWhite,
      creatorInputLabel: commonColors.gray,
      creatorInputPlaceholder: commonColors.grayDark,

      buttonPrimary: accent400,
      buttonPrimaryText: commonColors.white,
      buttonSecondary: commonColors.darkCard,
      buttonSecondaryText: commonColors.offWhite,
      buttonSecondaryBorder: commonColors.darkBorder,
      buttonDanger: '#2D1515',
      buttonDangerText: '#E05A5E',
      buttonDangerBorder: '#5C1A1A',

      modalBackground: commonColors.darkCard,
      modalBackdrop: 'rgba(0,0,0,0.80)',
      modalTitle: commonColors.offWhite,
      modalSubtitle: commonColors.gray,
      modalBorder: commonColors.darkBorder,
      modalLabel: commonColors.gray,
      modalInputBackground: commonColors.darkCard,
      modalInputBorder: commonColors.darkBorder,
      modalInputText: commonColors.offWhite,
      modalInputPlaceholder: commonColors.grayDark,

      actionIcon: commonColors.offWhite,
      actionText: commonColors.offWhite,
      actionDivider: commonColors.darkBorder,
      actionDangerText: '#E05A5E',

      // These were literally `rgba(99,102,241,...)` / `#818CF8` in the
      // reference — indigoLight's own rgb values re-expressed as translucent
      // overlays for dark surfaces, so they follow the same accent[400] swap.
      addBtnBackground: withAlpha(accent400, 0.15),
      addBtnBorder: withAlpha(accent400, 0.35),
      addBtnIcon: accent400,

      createAiBackground: withAlpha(accentDefault, 0.3),
      createAiBorder: withAlpha(accentDefault, 0.5),
      createAiIcon: accent400,
      createAiTitle: palette.accent[200],
      createAiDesc: palette.accent[300],

      createOutfitsIcon: palette.accent[500],

      fabBackground: accentDefault,
      fabIcon: commonColors.white,

      filterPillBackground: commonColors.darkCard,
      filterPillBorder: commonColors.darkBorder,
      filterPillText: commonColors.gray,
      filterPillActiveBackground: accentDefault,
      filterPillActiveBorder: accentDefault,
      filterPillActiveText: commonColors.white,

      essenceSectionBackground: commonColors.darkCard,
      essenceSectionBorder: commonColors.darkBorder,
      essenceInputBackground: commonColors.darkSurface,
      essenceInputBorder: commonColors.darkBorder,
      essenceInputText: commonColors.offWhite,
      essenceInputPlaceholder: commonColors.grayDark,
      essenceIconIndigo: accent400,
      essenceIconPurple: '#A78BFA',
      essenceIconEmerald: '#34D399',
      essenceAnalysisBackground: commonColors.darkSurface,
      essenceAnalysisBorder: commonColors.darkBorder,
      essenceAnalysisText: commonColors.gray,
      essenceHeroBg: 'rgba(120,53,15,0.25)',
      essenceHeroBorder: 'rgba(180,83,9,0.3)',
      essenceHeroTitle: commonColors.offWhite,
      essenceHeroSubtitle: commonColors.gray,
      essenceCardSkyBg: 'rgba(12,74,110,0.25)',
      essenceCardSkyBorder: 'rgba(14,116,144,0.3)',
      essenceCardSkyTitle: '#BAE6FD',
      essenceCardPurpleBg: 'rgba(76,29,149,0.2)',
      essenceCardPurpleBorder: 'rgba(109,40,217,0.3)',
      essenceCardPurpleTitle: '#DDD6FE',
      essenceCardEmeraldBg: 'rgba(6,78,59,0.2)',
      essenceCardEmeraldBorder: 'rgba(16,185,129,0.3)',
      essenceCardEmeraldTitle: '#A7F3D0',
      essenceCardAlertBg: 'rgba(124,45,18,0.2)',
      essenceCardAlertBorder: 'rgba(234,88,12,0.3)',
      essenceCardAlertTitle: '#FED7AA',
      essenceCardBody: '#D1D5DB',
      essenceToggleActive: accent400,
      essenceToggleInactive: '#374151',
      essenceGemsBadgeBackground: 'rgba(76,29,149,0.2)',
      essenceGemsBadgeBorder: 'rgba(109,40,217,0.3)',
      essenceGemsBadgeText: '#A78BFA',
      essenceVipOverlay: 'rgba(30,18,60,0.85)',
    },
  };
}

export function getStylesTheme(palette: BrandPalette): StylesTheme {
  return palette.dark ? buildStylesDark(palette) : buildStylesLight(palette);
}
