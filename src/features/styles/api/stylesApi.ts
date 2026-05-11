import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { Outfit } from '../types';

function normalise(raw: Partial<Outfit> & { id: string; name: string }): Outfit {
  return {
    id: raw.id,
    name: raw.name,
    imageData: raw.imageData ?? null,
    items: raw.items ?? [],
    tags: raw.tags ?? [],
    rating: raw.rating ?? null,
    source: raw.source ?? 'manual',
    createdAt: raw.createdAt ?? '',
  };
}

export async function fetchOutfits(): Promise<Outfit[]> {
  const data = await apiGet<Array<Partial<Outfit> & { id: string; name: string }>>('/outfits');
  return data.map(normalise);
}

export async function createOutfit(params: {
  name: string;
  itemIds: string[];
}): Promise<Outfit> {
  const { id } = await apiPost<{ id: string }>('/outfits', {
    name: params.name,
    items: params.itemIds.map(itemId => ({ id: itemId })),
  });
  const all = await fetchOutfits();
  const created = all.find(o => o.id === id);
  if (!created) throw new Error('Created outfit not found after fetch');
  return created;
}

export async function renameOutfit(id: string, name: string): Promise<void> {
  await apiPut(`/outfits/${id}`, { name });
}

export async function deleteOutfit(id: string): Promise<void> {
  await apiDelete(`/outfits/${id}`);
}

export async function suggestOutfit(params: {
  prompt: string;
  closetItemIds: string[];
}): Promise<{ itemIds: string[]; name: string }> {
  return apiPost<{ itemIds: string[]; name: string }>('/outfits/suggest', params);
}
