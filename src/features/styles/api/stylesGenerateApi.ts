import { apiPost } from '@api/client';

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
