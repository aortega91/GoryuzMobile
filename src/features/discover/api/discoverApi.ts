import { apiPost } from '@api/client';
import { ClothingItem } from '@features/collection/types';
import { RecommendedItem, IdentifiedItem, SourceChunk } from '../types';

// ─── Profile shape needed by recommendations ──────────────────────────────────

interface ProfileSnapshot {
  stylePrompt?: string | null;
  gender?: string | null;
  styleSummary?: string | null;
}

// ─── POST /gemini/recommendations ─────────────────────────────────────────────
// Returns RecommendedItem[] based on the user's closet and profile.
// Pass flashPrompt to trigger flash-outfit mode (returns style suggestions
// filtered to closet items rather than e-commerce recommendations).

export async function fetchRecommendations(params: {
  closet: ClothingItem[];
  profile: ProfileSnapshot;
  flashPrompt?: string;
}): Promise<RecommendedItem[]> {
  return apiPost<RecommendedItem[]>('/gemini/recommendations', params);
}

// ─── POST /gemini/identify ────────────────────────────────────────────────────
// Identifies clothing items in the provided image.
// Returns an array of { name, category } objects.

export async function identifyImage(params: {
  imageBase64: string;
  mimeType: string;
}): Promise<IdentifiedItem[]> {
  return apiPost<IdentifiedItem[]>('/gemini/identify', params);
}

// ─── POST /gemini/similar ────────────────────────────────────────────────────
// Finds similar items / purchase sources for the given item description
// matched against the provided image.
// Returns { text, candidates } where candidates[0].groundingMetadata.groundingChunks
// is SourceChunk[].

interface SimilarCandidate {
  groundingMetadata?: {
    groundingChunks?: SourceChunk[];
  };
}

export interface SimilarResult {
  text: string;
  candidates: SimilarCandidate[];
}

export async function findSimilar(params: {
  imageBase64: string;
  mimeType: string;
  itemDescription: string;
}): Promise<SimilarResult> {
  return apiPost<SimilarResult>('/gemini/similar', params);
}

// ─── POST /gemini/combine-outfit ──────────────────────────────────────────────
// NOTE: This endpoint may not yet exist on the backend. The UI is fully
// implemented; when the endpoint is unavailable it throws an ApiError which
// the CombinadorTab catches and shows as an error state.
//
// Combines the selected closet items onto the user's avatar image.
// Returns { combinedImage: base64 } — the resulting composited image as a
// base64 data URL (jpeg or png, prefix included).

export interface CombineOutfitResult {
  combinedImage: string;
}

export async function combineOutfit(params: {
  items: Array<{ id: string; name: string; imageData: string }>;
  avatarImage: string;
}): Promise<CombineOutfitResult> {
  return apiPost<CombineOutfitResult>('/gemini/combine-outfit', params);
}
