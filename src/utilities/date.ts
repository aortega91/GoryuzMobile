/**
 * date.ts — Server timestamp normalisation
 */

/** Guards every conversion: an unusable value yields now, never a throw. */
function fromMillis(ms: number): string {
  const date = new Date(ms);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

/**
 * Normalises a server timestamp (ISO string, or unix seconds/millis) to an ISO
 * string, without ever throwing.
 *
 * Timestamps reach the app in more than one shape. Columns declared
 * `mode: "timestamp"` in zena's Drizzle schema come back as Date objects and
 * serialise to ISO strings through the REST layer, while the chat Durable
 * Object echoes the raw unix seconds it stores — and both land on fields the
 * server types describe as plain numbers.
 *
 * An unparseable value falls back to now rather than producing an invalid
 * Date. Callers include the push handler and the chat socket, where
 * `RangeError: Date value out of bounds` from a later `.toISOString()` would
 * surface as an uncaught rejection instead of a bad-looking timestamp.
 */
export function toIsoTimestamp(value: string | number | null | undefined): string {
  if (value == null) return new Date().toISOString();

  // Unix seconds vs milliseconds: anything below ~2001-09 read as ms is really seconds.
  if (typeof value === 'number') return fromMillis(value < 1e12 ? value * 1000 : value);

  // A number that arrived as a string (the Durable Object does this).
  if (/^\d+$/.test(value)) return toIsoTimestamp(Number(value));

  return fromMillis(new Date(value).getTime());
}
