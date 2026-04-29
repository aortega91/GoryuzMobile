import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { ClothingItem } from '../types';

interface AddItemsResponse {
  success: true;
  items: { id: string; imageUrl: string }[];
}

export async function fetchCollection(): Promise<ClothingItem[]> {
  return apiGet<ClothingItem[]>('/closet');
}

export async function addCollectionItems(items: ClothingItem[]): Promise<ClothingItem[]> {
  console.log('[addCollectionItems] posting items:', items.map(i => ({
    id: i.id,
    name: i.name,
    category: i.category,
    imageDataLength: i.imageData?.length,
    imageDataPrefix: i.imageData?.slice(0, 40),
  })));
  const response = await apiPost<AddItemsResponse>('/closet', items);
  console.log('[addCollectionItems] response:', response);
  return items.map(item => {
    const server = response.items?.find(s => s.id === item.id);
    return { ...item, imageData: server?.imageUrl ?? item.imageData };
  });
}

export async function updateCollectionItem(id: string, name: string): Promise<void> {
  await apiPut(`/closet/${id}`, { name });
}

export async function removeCollectionItem(id: string): Promise<void> {
  await apiDelete(`/closet/${id}`);
}
