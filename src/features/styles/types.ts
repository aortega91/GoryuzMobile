import { ClothingCategory } from '@features/collection/types';

export interface StyleItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageData: string | null;
}

/**
 * What a saved creation is — mirrors zena's `OutfitKindSchema`. `outfit` is a
 * set of closet garments; hair/nails/makeup are AI beauty designs (an image
 * with no garments behind it); `mix` combines several saved creations on the
 * body avatar.
 */
export type OutfitKind = 'outfit' | 'hair' | 'nails' | 'makeup' | 'mix';

/** Beauty designs are the only kinds that carry a tech sheet. */
export type BeautyKind = 'hair' | 'nails' | 'makeup';

/** Order of the kind filter row at the top of the outfits grid (zena parity). */
export const OUTFIT_KINDS: OutfitKind[] = ['outfit', 'hair', 'nails', 'makeup', 'mix'];

/** Salon-ready sheet of a beauty design (zena `TechSheetSchema`). */
export interface TechSheet {
  summary: string;
  specs: { label: string; value: string }[];
  steps: string[];
  products: string[];
  care: string;
}

export interface Outfit {
  id: string;
  name: string;
  imageData: string | null;
  items: StyleItem[];
  tags: string[];
  rating: number | null;
  source: 'manual' | 'ai' | null;
  createdAt: string;
  /** Defaults to 'outfit' when the backend doesn't provide one */
  kind: OutfitKind;
  /** The text the user asked for — needed to redo a beauty design on the avatar */
  designPrompt: string | null;
  techSheet: TechSheet | null;
}
