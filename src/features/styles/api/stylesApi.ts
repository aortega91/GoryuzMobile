import { apiGet, apiPost, apiPut, apiDelete } from '@api/client';
import { Outfit, OutfitKind, TechSheet } from '../types';

type RawOutfit = Partial<Outfit> & {
  id: string;
  name: string;
  kind?: OutfitKind | null;
  tags?: string[] | null;
};

function normalise(raw: RawOutfit): Outfit {
  return {
    id: raw.id,
    name: raw.name,
    imageData: raw.imageData ?? null,
    items: raw.items ?? [],
    tags: raw.tags ?? [],
    rating: raw.rating ?? null,
    source: raw.source ?? null,
    createdAt: raw.createdAt ?? '',
    kind: raw.kind ?? 'outfit',
    designPrompt: raw.designPrompt ?? null,
    techSheet: raw.techSheet ?? null,
  };
}

export async function fetchOutfits(): Promise<Outfit[]> {
  const data = await apiGet<RawOutfit[]>('/outfits');
  return data.map(normalise);
}

export interface CreateOutfitParams {
  name: string;
  itemIds: string[];
  /** Base64 data URL — the backend uploads it to R2 */
  imageData?: string;
  kind?: OutfitKind;
  source?: 'manual' | 'ai';
  designPrompt?: string;
  techSheet?: TechSheet | null;
}

export async function createOutfit(params: CreateOutfitParams): Promise<Outfit> {
  const { id } = await apiPost<{ id: string }>('/outfits', {
    name: params.name,
    items: params.itemIds.map(itemId => ({ id: itemId })),
    imageData: params.imageData,
    kind: params.kind,
    source: params.source,
    designPrompt: params.designPrompt,
    techSheet: params.techSheet,
  });
  const all = await fetchOutfits();
  const created = all.find(o => o.id === id);
  if (!created) throw new Error('Created outfit not found after fetch');
  return created;
}

export interface OutfitPatch {
  name?: string;
  rating?: number | null;
  tags?: string[];
  /** New preview — base64 data URL or an R2 URL */
  imageData?: string;
  techSheet?: TechSheet | null;
}

/**
 * PUT /outfits/:id only touches the fields present in the body. Returns the
 * stored values (e.g. `imageUrl` once a base64 preview was uploaded to R2).
 */
export function updateOutfit(
  id: string,
  patch: OutfitPatch,
): Promise<{ success: boolean; id: string; imageUrl?: string } & OutfitPatch> {
  return apiPut(`/outfits/${id}`, patch);
}

export async function deleteOutfit(id: string): Promise<void> {
  await apiDelete(`/outfits/${id}`);
}

/**
 * @deprecated zena never shipped `/outfits/suggest`. Only the dormant Discover
 * module still imports this; Styles uses `completeOutfit` (/gemini/complete-outfit).
 */
export async function suggestOutfit(params: {
  prompt: string;
  closetItemIds: string[];
}): Promise<{ itemIds: string[]; name: string }> {
  return apiPost<{ itemIds: string[]; name: string }>('/outfits/suggest', params);
}
