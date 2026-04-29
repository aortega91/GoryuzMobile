import { apiPost } from '@api/client';
import { logError } from '@utilities/crashlytics';
import { ScannedItem } from '../types';

interface IdentifiedItem {
  name: string;
  category: string;
}

interface ExtractResponse {
  imageData: string;
}

export async function identifyItems(
  imageBase64: string,
  mimeType: string,
): Promise<IdentifiedItem[]> {
  return apiPost<IdentifiedItem[]>('/gemini/identify', { imageBase64, mimeType });
}

export async function extractItem(
  imageBase64: string,
  mimeType: string,
  itemName: string,
): Promise<string> {
  const response = await apiPost<ExtractResponse>('/gemini/extract', {
    imageBase64,
    mimeType,
    itemName,
  });
  // Backend returns raw base64 without a data URL prefix; add it so RN Image can render it
  const data = response.imageData;
  return data.startsWith('data:') ? data : `data:image/png;base64,${data}`;
}

export async function scanImage(
  base64Image: string,
  mimeType: string,
  onProgress?: (current: number, total: number) => void,
): Promise<ScannedItem[]> {
  const identified = await identifyItems(base64Image, mimeType);
  if (identified.length === 0) {
    return [];
  }

  onProgress?.(0, identified.length);

  let completed = 0;
  const settled = await Promise.all(
    identified.map(async (item) => {
      try {
        const imageData = await extractItem(base64Image, mimeType, item.name);
        completed += 1;
        onProgress?.(completed, identified.length);
        return {
          name: item.name,
          category: (item.category as ScannedItem['category']) ?? 'Accessories',
          imageData,
        } satisfies ScannedItem;
      } catch (err: unknown) {
        completed += 1;
        onProgress?.(completed, identified.length);
        logError(
          err instanceof Error ? err : new Error(String(err)),
          `scanImage:extractItem:${item.name}`,
        );
        return null;
      }
    }),
  );

  return settled.filter((item): item is ScannedItem => item !== null);
}
