import { apiGet, apiPost } from '@api/client';
import { ClothingItem } from '@features/collection/types';
import { UserProfile } from '@features/home/api/profileApi';
import { Outfit } from '../types';

/** One chat bubble. `outfitSuggestion` holds closet items the stylist proposed (or the user picked). */
export interface StylistChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  outfitSuggestion?: ClothingItem[];
  /** Data URL of the look rendered on the avatar, once the user asked for it. */
  generatedImage?: string;
}

export interface StylistChatSession {
  id: string;
  startTime: string;
  messages: StylistChatMessage[];
}

/** UUID v4-shaped id — the server stores session/message ids as primary keys. */
export function newChatId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, ch => {
    const r = Math.floor(Math.random() * 16);
    return (ch === 'x' ? r : (r % 4) + 8).toString(16);
  });
}

/** zena GEM_COSTS defaults — what the middleware charges per call. */
export const STYLIST_CHAT_GEM_COST = 1;
export const COMBINE_OUTFIT_GEM_COST = 10;

/** zena `usesAdvancedModel`: the plan picks the model behind the stylist. */
export function usesAdvancedModel(profile: Pick<UserProfile, 'plan'> | null): boolean {
  return profile?.plan === 'standard' || profile?.plan === 'vip';
}

interface StylistContext {
  closet: ClothingItem[];
  savedOutfits: Outfit[];
  profile: UserProfile | null;
  location: { lat: number; lon: number } | null;
}

/**
 * POST /gemini/chat — the endpoint is stateless: every turn carries the closet,
 * saved looks, profile and the conversation so far, and the server rebuilds the
 * stylist's prompt from them (zena `getStylistResponse`).
 */
export async function sendStylistMessage(params: {
  message: string;
  selectedItems?: string[];
  history: StylistChatMessage[];
  context: StylistContext;
}): Promise<string> {
  const { closet, savedOutfits, profile, location } = params.context;
  const { text } = await apiPost<{ text: string }>('/gemini/chat', {
    message: params.message,
    selectedItems: params.selectedItems ?? [],
    history: params.history
      .filter(m => m.text)
      .map(m => ({ role: m.role, parts: [{ text: m.text }] })),
    closet: closet.map(i => ({ name: i.name, category: i.category })),
    savedOutfits: savedOutfits.map(o => ({ id: o.id, items: o.items.map(i => ({ name: i.name })) })),
    profile: profile
      ? {
          name: profile.alias || profile.name,
          handle: profile.nickname || undefined,
          gender: profile.gender ?? undefined,
          stylePrompt: profile.stylePrompt ?? undefined,
          stylePromptImage: profile.stylePromptImage ?? undefined,
        }
      : undefined,
    location: location ?? undefined,
    recommendationScope: 'closet-only',
    useAdvancedModel: usesAdvancedModel(profile),
  });
  return text;
}

const OUTFIT_MARKER = 'OUTFIT_SUGGESTION:';

/**
 * The stylist ends a proposal with a line `OUTFIT_SUGGESTION: a; b; c` naming
 * closet items. That line is cut from the visible text and matched against
 * the closet by name (zena `ChatModal.parseResponse`).
 */
export function parseStylistResponse(
  responseText: string,
  closet: ClothingItem[],
  fallbackText: string,
): { text: string; outfit?: ClothingItem[] } {
  const markerLine = responseText.split('\n').find(line => line.startsWith(OUTFIT_MARKER));
  if (!markerLine) return { text: responseText };
  const names = markerLine
    .replace(OUTFIT_MARKER, '')
    .split(';')
    .map(n => n.trim().toLowerCase())
    .filter(Boolean);
  const outfit = names
    .map(name => closet.find(item => item.name.trim().toLowerCase() === name))
    .filter((item): item is ClothingItem => !!item);
  const text = responseText.replace(markerLine, '').trim() || fallbackText;
  return { text, outfit };
}

/** GET /chat — past stylist sessions, newest first. */
export async function fetchStylistChatHistory(): Promise<StylistChatSession[]> {
  const sessions = await apiGet<
    { id: string; startTime: string; messages: { id: string; role: 'user' | 'model'; text: string }[] }[]
  >('/chat');
  return sessions.map(s => ({ id: s.id, startTime: String(s.startTime), messages: s.messages }));
}

/** POST /chat — stores a finished session (text only, like zena). */
export function saveStylistChatSession(session: StylistChatSession): Promise<{ success: boolean }> {
  return apiPost<{ success: boolean }>('/chat', {
    sessionId: session.id,
    messages: session.messages
      .filter(m => m.text)
      .map(m => ({ id: m.id, role: m.role, text: m.text })),
  });
}
