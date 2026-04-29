export type ClothingCategory =
  | 'Tops'
  | 'Bottoms'
  | 'One-Pieces'
  | 'Outerwear'
  | 'Footwear'
  | 'Accessories';

export const CLOTHING_CATEGORIES: ClothingCategory[] = [
  'Tops',
  'Bottoms',
  'One-Pieces',
  'Outerwear',
  'Footwear',
  'Accessories',
];

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageData: string; // URL (after save) or base64 data URL (before save)
  originalDescription?: string;
}

// Items identified by AI before the user confirms and saves them
export interface ScannedItem {
  name: string;
  category: ClothingCategory;
  imageData: string; // processed image (bg removed) as base64 data URL
}

export type SecondLifeMode = 'sell' | 'gift' | 'exchange';
