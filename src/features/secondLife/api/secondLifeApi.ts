import { apiGet, apiPost, apiDelete } from '@api/client';
import { SecondLifeItem, MarketplaceItem } from '../types';

export function fetchMySecondLifeItems(): Promise<SecondLifeItem[]> {
  return apiGet<SecondLifeItem[]>('/second-life');
}

export function addToSecondLife(data: {
  itemId: string;
  status: 'sale' | 'gift' | 'trade';
  price?: string;
  conditionDescription?: string;
}): Promise<{ success: true }> {
  return apiPost<{ success: true }>('/second-life', data);
}

export function returnToCloset(id: string): Promise<{ success: true }> {
  return apiDelete<{ success: true }>(`/second-life/${id}`);
}

export function finalizeSecondLifeItem(
  itemId: string,
  status: 'sold' | 'gifted' | 'traded',
): Promise<{ success: true }> {
  return apiPost<{ success: true }>('/second-life', { itemId, status });
}

export function fetchMarketplace(): Promise<MarketplaceItem[]> {
  return apiGet<MarketplaceItem[]>('/second-life/marketplace');
}

export function toggleMarketplaceFavorite(itemId: string): Promise<{ success: true }> {
  return apiPost<{ success: true }>('/second-life/favorite', { itemId });
}
