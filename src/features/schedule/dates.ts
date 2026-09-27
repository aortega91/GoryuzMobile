/**
 * Date helpers for the Agenda. Keys are local calendar days (YYYY-MM-DD):
 * `toISOString()` would shift evening dates to the next day in UTC-3/-4.
 */

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Noon avoids DST edges when turning a key back into a Date. */
export function fromDateKey(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Week starts on Sunday — matches zena and the design. */
export function getWeekDays(date: Date): Date[] {
  const start = addDays(date, -date.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/** Every day key from start to end, inclusive (capped like zena at 60). */
export function daysBetween(startKey: string, endKey: string, cap = 60): string[] {
  const days: string[] = [];
  let cursor = fromDateKey(startKey);
  const last = fromDateKey(endKey);
  while (cursor <= last && days.length < cap) {
    days.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

export function localeFor(language: string | undefined): string {
  if (language?.startsWith('en')) return 'en-US';
  if (language?.startsWith('pt')) return 'pt-BR';
  return 'es-ES';
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
