import { apiGet, apiPost, apiPatch, apiDelete } from '@api/client';
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
  const raw = await apiPost<Partial<Outfit> & { id: string; name: string }>('/outfits', params);
  return normalise(raw);
}

export async function updateOutfit(
  id: string,
  params: { name?: string; tags?: string[]; rating?: number | null },
): Promise<void> {
  await apiPatch(`/outfits/${id}`, params);
}

export async function deleteOutfit(id: string): Promise<void> {
  await apiDelete(`/outfits/${id}`);
}
