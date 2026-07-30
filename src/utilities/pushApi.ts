import { apiPost } from '@api/client';

export type PushPlatform = 'ios' | 'android';

export async function registerPushToken(
  token: string,
  platform: PushPlatform,
  lang: string,
): Promise<void> {
  await apiPost('/push/register', { token, platform, lang });
}

export async function unregisterPushToken(token: string): Promise<void> {
  await apiPost('/push/unregister', { token });
}
