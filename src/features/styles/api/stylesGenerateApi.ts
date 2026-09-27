/**
 * stylesGenerateApi — every AI call the Styles module makes, wired to the zena
 * `preview` endpoints under /api/gemini/*. Gems are charged server-side by the
 * zena middleware, so callers must dispatch `loadProfile()` after a success to
 * sync the token count.
 */
import { apiPost, imageUrlToBase64 } from '@api/client';
import { ClothingItem } from '@features/collection/types';
import { BeautyKind, OutfitKind, StyleItem, TechSheet } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export interface Base64Image {
  base64: string;
  mimeType: string;
}

/** Splits a `data:<mime>;base64,<data>` URL. */
export function splitDataUrl(dataUrl: string): Base64Image | null {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  return match ? { mimeType: match[1], base64: match[2] } : null;
}

/** Any stored image (data URL, /api/images path or R2 URL) → raw base64 + mime. */
export async function toBase64Image(src: string): Promise<Base64Image | null> {
  const dataUrl = await imageUrlToBase64(src);
  return splitDataUrl(dataUrl);
}

/** The model returns bare base64; the app stores and renders data URLs. */
export function asDataUrl(b64: string, mime = 'image/png'): string {
  return b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;
}

// ─── Beauty designs (haircut / makeup / nails) ───────────────────────────────

export type BeautyAnswers = Record<string, string | null>;

export interface BeautyRequest {
  prompt: string;
  avatar?: Base64Image | null;
  reference?: Base64Image | null;
  answers?: BeautyAnswers;
}

const beautyBody = ({ prompt, avatar, reference, answers }: BeautyRequest) => ({
  prompt,
  avatarBase64: avatar?.base64 ?? null,
  avatarMime: avatar?.mimeType ?? null,
  referenceBase64: reference?.base64 ?? null,
  referenceMime: reference?.mimeType ?? null,
  answers: answers ?? {},
});

export async function generateHaircut(req: BeautyRequest): Promise<string> {
  const { imageData } = await apiPost<{ imageData: string }>('/gemini/haircut', beautyBody(req));
  return imageData;
}

export async function generateMakeup(req: BeautyRequest): Promise<string> {
  const { imageData } = await apiPost<{ imageData: string }>('/gemini/makeup', beautyBody(req));
  return imageData;
}

export async function generateNails(
  req: BeautyRequest & { shape: string; target: string },
): Promise<string> {
  const { imageData } = await apiPost<{ imageData: string }>('/gemini/nails', {
    ...beautyBody(req),
    shape: req.shape,
    target: req.target,
  });
  return imageData;
}

export async function generateTechSheet(params: {
  kind: BeautyKind;
  prompt: string;
  image: Base64Image;
  language?: string;
}): Promise<TechSheet> {
  const { techSheet } = await apiPost<{ techSheet: TechSheet }>('/gemini/tech-sheet', {
    kind: params.kind,
    prompt: params.prompt,
    imageBase64: params.image.base64,
    mimeType: params.image.mimeType,
    language: params.language,
  });
  return techSheet;
}

// ─── Outfit ideas / mixes ─────────────────────────────────────────────────────

export function generateOutfitIdeas(params: {
  occasion: string;
  count: number;
  reference?: Base64Image | null;
}): Promise<{ images: string[]; requested: number }> {
  return apiPost('/gemini/outfit-ideas', {
    occasion: params.occasion,
    count: params.count,
    imageBase64: params.reference?.base64,
    mimeType: params.reference?.mimeType,
  });
}

export function mixLook(params: {
  avatar: Base64Image;
  pieces: (Base64Image & { label: string })[];
}): Promise<{ imageData: string }> {
  return apiPost('/gemini/mix-look', params);
}

export function completeMix(params: {
  occasion: string;
  chosen: { name: string; kind: OutfitKind }[];
  candidates: { id: string; name: string; kind: OutfitKind }[];
}): Promise<{ ids: string[]; reason: string }> {
  return apiPost('/gemini/complete-mix', params);
}

// ─── Outfits from the closet ──────────────────────────────────────────────────

/** AI picks garments from the closet for an occasion (zena "Completar el look"). */
export function completeOutfit(params: {
  occasion: string;
  garments: { name: string; category: string }[];
  candidates: { id: string; name: string; category: string }[];
}): Promise<{ ids: string[]; reason: string }> {
  return apiPost('/gemini/complete-outfit', params);
}

/** Free: naming is part of saving, not a separate AI service. */
export async function generateOutfitName(
  items: { name: string; category: string }[],
  language?: string,
): Promise<string> {
  const { name } = await apiPost<{ name: string }>('/gemini/generate-outfit-name', {
    items,
    language,
  });
  return name;
}

/**
 * Dresses the body avatar with an outfit's garments. Items must carry their
 * image as base64 data URLs — the server splits the prefix itself.
 */
export async function combineOutfit(params: {
  items: StyleItem[] | ClothingItem[];
  avatarImage: string;
}): Promise<string> {
  const items = await Promise.all(
    params.items
      .filter(item => item.imageData)
      .map(async item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        imageData: await imageUrlToBase64(item.imageData!),
      })),
  );
  const avatarImage = await imageUrlToBase64(params.avatarImage);
  const { combinedImage } = await apiPost<{ combinedImage: string }>('/gemini/combine-outfit', {
    items,
    avatarImage,
  });
  return combinedImage;
}

// ─── Avatars & photos ─────────────────────────────────────────────────────────

/** Body avatar: photo, description, or both. The endpoint persists it itself. */
export function generateAvatarImage(params: {
  description: string;
  referenceImageBase64?: string;
  mimeType?: string;
}): Promise<{ avatarImage: string; avatarUrl: string }> {
  return apiPost<{ avatarImage: string; avatarUrl: string }>('/gemini/avatar', params);
}

/** Face avatar: from a photo only — no written description by design. */
export async function generateFaceAvatar(image: Base64Image): Promise<string> {
  const { imageData } = await apiPost<{ imageData: string }>('/gemini/avatar-face', {
    imageBase64: image.base64,
    mimeType: image.mimeType,
  });
  return imageData;
}

/** Only rejects a photo with more than one person, or none. Free. */
export function validateBodyPhoto(params: {
  imageBase64: string;
  mimeType: string;
}): Promise<{ isValid: boolean; reason: string }> {
  return apiPost<{ isValid: boolean; reason: string }>('/gemini/validate-body', params);
}
