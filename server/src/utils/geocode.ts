/**
 * Reverse geocode coordinates to a human-readable address using OpenStreetMap Nominatim.
 * Free, no API key required. Rate limit: 1 req/sec (we cache results).
 */

const cache = new Map<string, string>();

/**
 * Convert [longitude, latitude] to a readable address string.
 * Returns a short address like "Connaught Place, New Delhi" or falls back to formatted coords.
 */
export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CleanupCrew/1.0 (cleanup drive platform)' },
      signal: AbortSignal.timeout(3000),
    });

    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const data: any = await res.json();

    const addr = data.address || {};
    // Build a short, meaningful address
    const parts: string[] = [];
    const locality = addr.neighbourhood || addr.suburb || addr.hamlet || addr.village || '';
    const city = addr.city || addr.town || addr.state_district || addr.county || '';
    const state = addr.state || '';

    if (locality) parts.push(locality);
    if (city && city !== locality) parts.push(city);
    if (state && state !== city) parts.push(state);

    const address = parts.length > 0 ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`;

    cache.set(key, address);
    return address;
  } catch {
    // Fallback to formatted coordinates
    const fallback = `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}°${lng >= 0 ? 'E' : 'W'}`;
    cache.set(key, fallback);
    return fallback;
  }
}

/**
 * Enrich a drive object with a resolved address field.
 * Adds `locationAddress` to the drive object.
 */
export async function enrichDriveWithAddress<T extends { location?: { coordinates?: number[] } }>(
  drive: T,
): Promise<T & { locationAddress: string }> {
  const coords = drive.location?.coordinates;
  if (!coords || coords.length < 2) {
    return { ...drive, locationAddress: 'Location TBD' };
  }
  const address = await reverseGeocode(coords[0], coords[1]);
  return { ...drive, locationAddress: address };
}
