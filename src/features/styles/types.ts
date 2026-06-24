import { ClothingCategory } from '@features/collection/types';

export interface StyleItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageData: string | null;
}

export type OutfitCategory = 'Outfits' | 'Corte/Barba' | 'Maquillaje' | 'Uñas';

export const OUTFIT_CATEGORIES: OutfitCategory[] = [
  'Outfits',
  'Corte/Barba',
  'Maquillaje',
  'Uñas',
];

export interface Outfit {
  id: string;
  name: string;
  imageData: string | null;
  items: StyleItem[];
  tags: string[];
  rating: number | null;
  source: 'manual' | 'ai';
  createdAt: string;
  /** Look category — defaults to 'Outfits' when the backend doesn't provide one */
  category?: OutfitCategory;
}
