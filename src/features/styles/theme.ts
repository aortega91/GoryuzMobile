import commonColors, { tailwindHues } from '@theme/commonColors';
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

    // Stylist chat (zena ChatModal)
    chatBackground: string;
    chatHeaderBorder: string;
    chatTitle: string;
    chatSubtitle: string;
    chatBotBackground: string;
    chatBotIcon: string;
    chatOnlineDot: string;
    chatOnlineDotRing: string;
    chatHeaderIcon: string;
    chatHeaderIconActive: string;
    chatGemBarBackground: string;
    chatGemBarText: string;
    chatGemIcon: string;
    chatGemValue: string;
    chatBotSmallBackground: string;
    chatBotSmallIcon: string;
    chatUserBubble: string;
    chatUserBubbleText: string;
    chatModelBubble: string;
    chatModelBubbleBorder: string;
    chatModelBubbleText: string;
    chatSuggestionLabel: string;
    chatGenerateBackground: string;
    chatGenerateText: string;
    chatSaveBackground: string;
    chatSaveBorder: string;
    chatSaveText: string;
    chatTypingDot: string;
    chatThumbPlaceholder: string;
    chatInputBackground: string;
    chatInputBorder: string;
    chatInputText: string;
    chatInputPlaceholder: string;
    chatInputIcon: string;
    chatSendBackground: string;
    chatSendDisabledBackground: string;
    chatSendIcon: string;
    chatResetText: string;
    chatHistoryCardBackground: string;
    chatHistoryCardBorder: string;
    chatHistoryIconBackground: string;
    chatHistoryIcon: string;
    chatHistoryTitle: string;
    chatHistoryMeta: string;

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

    // Creation choice + beauty flows. Each kind keeps a fixed semantic tone
    // (orange hair, pink makeup, teal nails, violet mix, amber ideas, rose
    // face) exactly like zena — they're category colours, not brand accents.
    toneHair: string;
    toneMakeup: string;
    toneNails: string;
    toneMix: string;
    toneIdeas: string;
    toneFace: string;
    toneBody: string;
    toneOnColor: string;
    toneTechSheet: string;
    toneSchedule: string;
    toneTags: string;
    createMixBackground: string;
    createMixBorder: string;
    createMixTitle: string;
    createIdeasBackground: string;
    createIdeasBorder: string;
    createIdeasTitle: string;
    createIdeasDesc: string;

    // Beauty questionnaire chips
    choiceBackground: string;
    choiceBorder: string;
    choiceText: string;
    choiceHint: string;

    // Outfits grid
    kindTabActive: string;
    kindTabInactive: string;
    kindCountBackground: string;
    kindCountText: string;
    kindCountActiveBackground: string;
    kindCountActiveText: string;
    cardInfoBackground: string;
    cardEyeBackground: string;
    cardEyeIcon: string;
    cardSourceManualBackground: string;
    cardSourceText: string;
    cardMeta: string;
    cardMissingBadge: string;
    imageLoadingOverlay: string;
    setupBannerBackground: string;
    setupBannerBorder: string;

    // Avatar submodule
    bodyReadyBackground: string;
    bodyReadyBorder: string;
    bodyReadyText: string;
    faceReadyBackground: string;
    faceReadyBorder: string;
    faceReadyText: string;
    avatarFrameBorder: string;
    avatarFrameBackground: string;

    // Tags submodule chips
    tagsChipBackground: string;
    tagsChipBorder: string;
    tagsChipText: string;
    tagsChipRemove: string;

    // Tech sheet
    techSheetSummaryBackground: string;
    techSheetSummaryBorder: string;
    techSheetRowBackground: string;
    techSheetStepBadge: string;
  };
  /** Guided colour test (port of zena components/colorimetry/*). */
  colorimetry: {
    welcomeIconBackground: string;
    welcomeIconColor: string;
    title: string;
    body: string;
    stepText: string;
    stepBadgeBackground: string;
    stepBadgeText: string;
    primaryButton: string;
    primaryButtonText: string;
    ghostButtonText: string;
    backIcon: string;
    progressTrack: string;
    progressFill: string;
    progressText: string;
    optionBackground: string;
    optionBorder: string;
    optionText: string;
    optionChosenBackground: string;
    optionChosenBorder: string;
    swatchBorder: string;
    errorBackground: string;
    errorText: string;
    errorIcon: string;
    neutralButtonBackground: string;
    neutralButtonText: string;
    cameraFrameBackground: string;
    cameraLoadingOverlay: string;
    lightNeutralBackground: string;
    ovalMask: string;
    ovalStrokeOk: string;
    ovalStrokeWarn: string;
    lightOkBackground: string;
    lightWarnBackground: string;
    lightText: string;
    darkNote: string;
    spinner: string;
    analyzingTitle: string;
    analyzingBody: string;
    heroBackground: string;
    heroBorder: string;
    heroEyebrow: string;
    heroTitle: string;
    heroVibe: string;
    heroSummary: string;
    factBackground: string;
    factBorder: string;
    factLabel: string;
    factValue: string;
    sectionHeading: string;
    favorIcon: string;
    avoidIcon: string;
    hint: string;
    swatchName: string;
    avoidChipBorder: string;
    avoidChipText: string;
    tipBullet: string;
    tipText: string;
    sheetBackground: string;
    sheetBorder: string;
    sheetBackdrop: string;
    sheetHandle: string;
    sheetName: string;
    sheetHex: string;
    matchCardBackground: string;
    matchCardBorder: string;
    matchName: string;
    emptyIcon: string;
    emptyText: string;
    link: string;
    cardBackground: string;
    cardBorder: string;
    cardTitle: string;
    cardHint: string;
    cardChevron: string;
    badgeBackground: string;
    badgeText: string;
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

      // Stylist chat (zena ChatModal)
      chatBackground: commonColors.white,
      chatHeaderBorder: tailwindHues.gray[100],
      chatTitle: tailwindHues.gray[900],
      chatSubtitle: tailwindHues.gray[500],
      chatBotBackground: accent600,
      chatBotIcon: commonColors.white,
      chatOnlineDot: tailwindHues.green[500],
      chatOnlineDotRing: commonColors.white,
      chatHeaderIcon: tailwindHues.gray[400],
      chatHeaderIconActive: accent600,
      chatGemBarBackground: tailwindHues.gray[50],
      chatGemBarText: tailwindHues.gray[500],
      chatGemIcon: tailwindHues.orange[500],
      chatGemValue: tailwindHues.gray[900],
      chatBotSmallBackground: palette.accent[100],
      chatBotSmallIcon: accent600,
      chatUserBubble: accent600,
      chatUserBubbleText: commonColors.white,
      chatModelBubble: tailwindHues.gray[100],
      chatModelBubbleBorder: withAlpha(tailwindHues.gray[200], 0.5),
      chatModelBubbleText: tailwindHues.gray[800],
      chatSuggestionLabel: tailwindHues.gray[500],
      chatGenerateBackground: accent600,
      chatGenerateText: commonColors.white,
      chatSaveBackground: commonColors.white,
      chatSaveBorder: tailwindHues.gray[200],
      chatSaveText: tailwindHues.gray[800],
      chatTypingDot: accent400,
      chatThumbPlaceholder: tailwindHues.gray[200],
      chatInputBackground: tailwindHues.gray[50],
      chatInputBorder: tailwindHues.gray[200],
      chatInputText: tailwindHues.gray[800],
      chatInputPlaceholder: tailwindHues.gray[400],
      chatInputIcon: tailwindHues.gray[400],
      chatSendBackground: accent600,
      chatSendDisabledBackground: tailwindHues.gray[200],
      chatSendIcon: commonColors.white,
      chatResetText: tailwindHues.gray[400],
      chatHistoryCardBackground: tailwindHues.gray[50],
      chatHistoryCardBorder: tailwindHues.gray[100],
      chatHistoryIconBackground: commonColors.white,
      chatHistoryIcon: palette.accent[500],
      chatHistoryTitle: tailwindHues.gray[900],
      chatHistoryMeta: tailwindHues.gray[500],

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

      toneHair: '#F97316',
      toneMakeup: '#EC4899',
      toneNails: '#14B8A6',
      toneMix: '#7C3AED',
      toneIdeas: '#F59E0B',
      toneFace: '#F43F5E',
      toneBody: '#059669',
      toneOnColor: commonColors.white,
      toneTechSheet: '#9333EA',
      toneSchedule: '#059669',
      toneTags: '#2563EB',
      createMixBackground: '#F5F3FF',
      createMixBorder: '#DDD6FE',
      createMixTitle: '#4C1D95',
      createIdeasBackground: '#FFFBEB',
      createIdeasBorder: '#FDE68A',
      createIdeasTitle: '#78350F',
      createIdeasDesc: '#B45309',

      choiceBackground: commonColors.white,
      choiceBorder: commonColors.grayLight,
      choiceText: commonColors.grayDark,
      choiceHint: commonColors.gray,

      kindTabActive: accent600,
      kindTabInactive: commonColors.gray,
      kindCountBackground: '#F3F4F6',
      kindCountText: commonColors.grayDark,
      kindCountActiveBackground: palette.accent[100],
      kindCountActiveText: palette.accent[700],
      cardInfoBackground: '#F9FAFB',
      cardEyeBackground: 'rgba(255,255,255,0.85)',
      cardEyeIcon: '#374151',
      cardSourceManualBackground: 'rgba(17,24,39,0.8)',
      cardSourceText: commonColors.white,
      cardMeta: commonColors.gray,
      cardMissingBadge: '#EF4444',
      imageLoadingOverlay: 'rgba(255,255,255,0.8)',
      setupBannerBackground: withAlpha(accent600, 0.1),
      setupBannerBorder: accent600,

      bodyReadyBackground: '#ECFDF5',
      bodyReadyBorder: '#D1FAE5',
      bodyReadyText: '#064E3B',
      faceReadyBackground: '#FFF1F2',
      faceReadyBorder: '#FFE4E6',
      faceReadyText: '#881337',
      avatarFrameBorder: commonColors.grayLight,
      avatarFrameBackground: '#F9FAFB',

      tagsChipBackground: '#EFF6FF',
      tagsChipBorder: '#DBEAFE',
      tagsChipText: '#1D4ED8',
      tagsChipRemove: '#93C5FD',

      techSheetSummaryBackground: palette.accent[50],
      techSheetSummaryBorder: palette.accent[100],
      techSheetRowBackground: commonColors.white,
      techSheetStepBadge: '#F3F4F6',
    },
    colorimetry: {
      welcomeIconBackground: tailwindHues.amber[50],
      welcomeIconColor: '#D97706',
      title: palette.primary,
      body: tailwindHues.gray[500],
      stepText: tailwindHues.gray[600],
      stepBadgeBackground: tailwindHues.gray[100],
      stepBadgeText: tailwindHues.gray[500],
      primaryButton: accent600,
      primaryButtonText: commonColors.white,
      ghostButtonText: tailwindHues.gray[600],
      backIcon: tailwindHues.gray[400],
      progressTrack: tailwindHues.gray[100],
      progressFill: accent600,
      progressText: tailwindHues.gray[400],
      optionBackground: commonColors.white,
      optionBorder: tailwindHues.gray[200],
      optionText: tailwindHues.gray[800],
      optionChosenBackground: palette.accent[50],
      optionChosenBorder: palette.accent[500],
      swatchBorder: tailwindHues.gray[200],
      errorBackground: '#FEF2F2',
      errorText: '#B91C1C',
      errorIcon: '#FB923C',
      neutralButtonBackground: tailwindHues.gray[100],
      neutralButtonText: tailwindHues.gray[700],
      cameraFrameBackground: tailwindHues.gray[900],
      cameraLoadingOverlay: withAlpha(tailwindHues.gray[900], 0.8),
      lightNeutralBackground: withAlpha(tailwindHues.gray[900], 0.7),
      ovalMask: 'rgba(0,0,0,0.55)',
      ovalStrokeOk: 'rgba(255,255,255,0.9)',
      ovalStrokeWarn: tailwindHues.amber[500],
      lightOkBackground: tailwindHues.emerald[600],
      lightWarnBackground: tailwindHues.amber[500],
      lightText: commonColors.white,
      darkNote: '#D97706',
      spinner: accent600,
      analyzingTitle: tailwindHues.gray[700],
      analyzingBody: tailwindHues.gray[400],
      heroBackground: tailwindHues.emerald[50],
      heroBorder: tailwindHues.emerald[100],
      heroEyebrow: withAlpha(tailwindHues.emerald[700], 0.7),
      heroTitle: tailwindHues.emerald[700],
      heroVibe: withAlpha('#065F46', 0.8),
      heroSummary: tailwindHues.gray[700],
      factBackground: commonColors.white,
      factBorder: tailwindHues.gray[100],
      factLabel: tailwindHues.gray[400],
      factValue: tailwindHues.gray[900],
      sectionHeading: tailwindHues.gray[900],
      favorIcon: palette.accent[500],
      avoidIcon: tailwindHues.gray[400],
      hint: tailwindHues.gray[400],
      swatchName: tailwindHues.gray[500],
      avoidChipBorder: tailwindHues.gray[200],
      avoidChipText: tailwindHues.gray[500],
      tipBullet: palette.accent[500],
      tipText: tailwindHues.gray[600],
      sheetBackground: commonColors.white,
      sheetBorder: tailwindHues.gray[100],
      sheetBackdrop: 'rgba(0,0,0,0.6)',
      sheetHandle: tailwindHues.gray[300],
      sheetName: tailwindHues.gray[900],
      sheetHex: tailwindHues.gray[400],
      matchCardBackground: tailwindHues.gray[50],
      matchCardBorder: tailwindHues.gray[100],
      matchName: tailwindHues.gray[600],
      emptyIcon: tailwindHues.gray[200],
      emptyText: tailwindHues.gray[500],
      link: accent600,
      cardBackground: commonColors.white,
      cardBorder: tailwindHues.gray[100],
      cardTitle: tailwindHues.gray[900],
      cardHint: tailwindHues.gray[500],
      cardChevron: tailwindHues.gray[400],
      badgeBackground: tailwindHues.emerald[50],
      badgeText: tailwindHues.emerald[700],
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

      // Stylist chat (zena ChatModal)
      chatBackground: commonColors.darkCard,
      chatHeaderBorder: tailwindHues.gray[700],
      chatTitle: tailwindHues.gray[100],
      chatSubtitle: tailwindHues.gray[400],
      chatBotBackground: accentDefault,
      chatBotIcon: commonColors.white,
      chatOnlineDot: tailwindHues.green[500],
      chatOnlineDotRing: commonColors.darkCard,
      chatHeaderIcon: tailwindHues.gray[400],
      chatHeaderIconActive: accentDefault,
      chatGemBarBackground: tailwindHues.slate[900],
      chatGemBarText: tailwindHues.gray[400],
      chatGemIcon: tailwindHues.orange[400],
      chatGemValue: tailwindHues.orange[50],
      chatBotSmallBackground: withAlpha(palette.accent[900], 0.3),
      chatBotSmallIcon: accentDefault,
      chatUserBubble: palette.accent[600],
      chatUserBubbleText: commonColors.white,
      chatModelBubble: withAlpha(tailwindHues.gray[700], 0.5),
      chatModelBubbleBorder: withAlpha(tailwindHues.gray[600], 0.3),
      chatModelBubbleText: tailwindHues.gray[200],
      chatSuggestionLabel: tailwindHues.gray[400],
      chatGenerateBackground: accentDefault,
      chatGenerateText: commonColors.white,
      chatSaveBackground: withAlpha(commonColors.white, 0.1),
      chatSaveBorder: withAlpha(commonColors.white, 0.2),
      chatSaveText: commonColors.white,
      chatTypingDot: accent400,
      chatThumbPlaceholder: tailwindHues.gray[800],
      chatInputBackground: withAlpha(tailwindHues.gray[900], 0.8),
      chatInputBorder: tailwindHues.gray[700],
      chatInputText: tailwindHues.gray[100],
      chatInputPlaceholder: tailwindHues.gray[500],
      chatInputIcon: tailwindHues.gray[400],
      chatSendBackground: palette.accent[600],
      chatSendDisabledBackground: tailwindHues.gray[800],
      chatSendIcon: commonColors.white,
      chatResetText: tailwindHues.gray[400],
      chatHistoryCardBackground: withAlpha(tailwindHues.gray[900], 0.3),
      chatHistoryCardBorder: tailwindHues.gray[800],
      chatHistoryIconBackground: tailwindHues.gray[800],
      chatHistoryIcon: palette.accent[500],
      chatHistoryTitle: tailwindHues.gray[100],
      chatHistoryMeta: tailwindHues.gray[400],

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

      toneHair: '#FB923C',
      toneMakeup: '#F472B6',
      toneNails: '#2DD4BF',
      toneMix: '#8B5CF6',
      toneIdeas: '#F59E0B',
      toneFace: '#FB7185',
      toneBody: '#34D399',
      toneOnColor: commonColors.white,
      toneTechSheet: '#C084FC',
      toneSchedule: '#34D399',
      toneTags: '#60A5FA',
      createMixBackground: 'rgba(76,29,149,0.2)',
      createMixBorder: 'rgba(109,40,217,0.4)',
      createMixTitle: '#DDD6FE',
      createIdeasBackground: 'rgba(120,53,15,0.2)',
      createIdeasBorder: 'rgba(146,64,14,0.4)',
      createIdeasTitle: '#FDE68A',
      createIdeasDesc: '#FCD34D',

      choiceBackground: commonColors.darkSurface,
      choiceBorder: commonColors.darkBorder,
      choiceText: commonColors.offWhite,
      choiceHint: commonColors.gray,

      kindTabActive: accentDefault,
      kindTabInactive: commonColors.gray,
      kindCountBackground: commonColors.darkCard,
      kindCountText: commonColors.gray,
      kindCountActiveBackground: withAlpha(accentDefault, 0.4),
      kindCountActiveText: palette.accent[300],
      cardInfoBackground: commonColors.darkSurface,
      cardEyeBackground: 'rgba(17,24,39,0.85)',
      cardEyeIcon: '#E5E7EB',
      cardSourceManualBackground: 'rgba(17,24,39,0.8)',
      cardSourceText: commonColors.white,
      cardMeta: commonColors.gray,
      cardMissingBadge: '#EF4444',
      imageLoadingOverlay: 'rgba(17,24,39,0.8)',
      setupBannerBackground: withAlpha(accentDefault, 0.2),
      setupBannerBorder: accentDefault,

      bodyReadyBackground: 'rgba(6,78,59,0.2)',
      bodyReadyBorder: 'rgba(6,95,70,0.5)',
      bodyReadyText: '#A7F3D0',
      faceReadyBackground: 'rgba(136,19,55,0.2)',
      faceReadyBorder: 'rgba(159,18,57,0.5)',
      faceReadyText: '#FECDD3',
      avatarFrameBorder: commonColors.darkBorder,
      avatarFrameBackground: commonColors.darkSurface,

      tagsChipBackground: 'rgba(30,58,138,0.2)',
      tagsChipBorder: 'rgba(30,64,175,0.5)',
      tagsChipText: '#93C5FD',
      tagsChipRemove: '#60A5FA',

      techSheetSummaryBackground: withAlpha(accentDefault, 0.15),
      techSheetSummaryBorder: withAlpha(accentDefault, 0.3),
      techSheetRowBackground: commonColors.darkSurface,
      techSheetStepBadge: commonColors.darkSurface,
    },
    colorimetry: {
      welcomeIconBackground: withAlpha(tailwindHues.amber[900], 0.3),
      welcomeIconColor: '#FBBF24',
      title: tailwindHues.gray[200],
      body: tailwindHues.gray[400],
      stepText: tailwindHues.gray[300],
      stepBadgeBackground: tailwindHues.gray[800],
      stepBadgeText: tailwindHues.gray[500],
      primaryButton: accentDefault,
      primaryButtonText: commonColors.white,
      ghostButtonText: tailwindHues.gray[300],
      backIcon: tailwindHues.gray[400],
      progressTrack: tailwindHues.gray[800],
      progressFill: accentDefault,
      progressText: tailwindHues.gray[400],
      optionBackground: tailwindHues.gray[800],
      optionBorder: tailwindHues.gray[700],
      optionText: tailwindHues.gray[100],
      optionChosenBackground: withAlpha(palette.accent[950], 0.4),
      optionChosenBorder: palette.accent[500],
      swatchBorder: tailwindHues.gray[600],
      errorBackground: withAlpha('#450A0A', 0.3),
      errorText: '#FCA5A5',
      errorIcon: '#FB923C',
      neutralButtonBackground: tailwindHues.gray[700],
      neutralButtonText: tailwindHues.gray[200],
      cameraFrameBackground: tailwindHues.gray[900],
      cameraLoadingOverlay: withAlpha(tailwindHues.gray[900], 0.8),
      lightNeutralBackground: withAlpha(tailwindHues.gray[900], 0.7),
      ovalMask: 'rgba(0,0,0,0.55)',
      ovalStrokeOk: 'rgba(255,255,255,0.9)',
      ovalStrokeWarn: tailwindHues.amber[500],
      lightOkBackground: tailwindHues.emerald[600],
      lightWarnBackground: tailwindHues.amber[500],
      lightText: commonColors.white,
      darkNote: '#FBBF24',
      spinner: accentDefault,
      analyzingTitle: tailwindHues.gray[200],
      analyzingBody: tailwindHues.gray[400],
      heroBackground: withAlpha(tailwindHues.emerald[900], 0.2),
      heroBorder: withAlpha('#065F46', 0.5),
      heroEyebrow: withAlpha(tailwindHues.emerald[300], 0.7),
      heroTitle: tailwindHues.emerald[300],
      heroVibe: withAlpha(tailwindHues.emerald[200], 0.8),
      heroSummary: tailwindHues.gray[200],
      factBackground: tailwindHues.gray[800],
      factBorder: tailwindHues.gray[700],
      factLabel: tailwindHues.gray[400],
      factValue: commonColors.white,
      sectionHeading: commonColors.white,
      favorIcon: palette.accent[500],
      avoidIcon: tailwindHues.gray[400],
      hint: tailwindHues.gray[400],
      swatchName: tailwindHues.gray[400],
      avoidChipBorder: tailwindHues.gray[700],
      avoidChipText: tailwindHues.gray[400],
      tipBullet: palette.accent[500],
      tipText: tailwindHues.gray[300],
      sheetBackground: tailwindHues.gray[900],
      sheetBorder: tailwindHues.gray[800],
      sheetBackdrop: 'rgba(0,0,0,0.6)',
      sheetHandle: tailwindHues.gray[700],
      sheetName: commonColors.white,
      sheetHex: tailwindHues.gray[400],
      matchCardBackground: tailwindHues.gray[800],
      matchCardBorder: tailwindHues.gray[800],
      matchName: tailwindHues.gray[300],
      emptyIcon: tailwindHues.gray[700],
      emptyText: tailwindHues.gray[400],
      link: accentDefault,
      cardBackground: withAlpha(tailwindHues.gray[800], 0.6),
      cardBorder: tailwindHues.gray[800],
      cardTitle: commonColors.white,
      cardHint: tailwindHues.gray[400],
      cardChevron: tailwindHues.gray[400],
      badgeBackground: withAlpha(tailwindHues.emerald[900], 0.3),
      badgeText: tailwindHues.emerald[300],
    },
  };
}

export function getStylesTheme(palette: BrandPalette): StylesTheme {
  return palette.dark ? buildStylesDark(palette) : buildStylesLight(palette);
}
