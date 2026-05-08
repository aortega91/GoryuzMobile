import { ClothingCategory } from '@features/collection/types';

export interface StyleItem {
  id: string;
  name: string;
  category: ClothingCategory;
  imageData: string | null;
}

export interface Outfit {
  id: string;
  name: string;
  imageData: string | null;
  items: StyleItem[];
  tags: string[];
  rating: number | null;
  source: 'manual' | 'ai';
  createdAt: string;
}
