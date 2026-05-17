import { apiPost } from '@api/client';
import { ClothingItem } from '@features/collection/types';
import { Outfit } from '../types';

export interface GenerateResult {
  imageUrl: string;
}

export function generateHaircut(params: {
  prompt: string;
  referenceImageBase64?: string;
}): Promise<GenerateResult> {
  return apiPost<GenerateResult>('/generate/haircut', params);
}

export function generateMakeup(params: {
  prompt: string;
  outfitId?: string;
  lighting: 'office' | 'natural' | 'warm';
}): Promise<GenerateResult> {
  return apiPost<GenerateResult>('/generate/makeup', params);
}

export function generateNails(params: {
  prompt: string;
  shape: string;
  target: string;
}): Promise<GenerateResult> {
  return apiPost<GenerateResult>('/generate/nails', params);
}

export function saveDesign(params: {
  imageUrl: string;
  type: string;
}): Promise<{ id: string }> {
  return apiPost<{ id: string }>('/designs', params);
}

export function analyzeStyle(params: {
  closet: ClothingItem[];
  savedOutfits: Outfit[];
  stylePrompt: string;
  gender: string | null;
}): Promise<{ summary: string }> {
  return apiPost<{ summary: string }>('/gemini/style-summary', {
    closet: params.closet.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      imageData: item.imageData,
    })),
    savedOutfits: params.savedOutfits.map(o => ({
      id: o.id,
      name: o.name,
      items: o.items,
    })),
    stylePrompt: params.stylePrompt,
    chatHistory: [],
    gender: params.gender,
  });
}

export function generateAvatarImage(params: {
  description: string;
  referenceImageBase64?: string;
  mimeType?: string;
}): Promise<{ avatarImage: string; avatarUrl: string }> {
  return apiPost<{ avatarImage: string; avatarUrl: string }>('/gemini/avatar', params);
}
