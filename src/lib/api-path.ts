/**
 * Prefix API paths with the Next.js basePath so client-side fetch() calls
 * resolve correctly when the app is mounted under a sub-path (e.g. /meridian).
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/meridian';

export function apiPath(path: string): string {
  if (path.startsWith(BASE_PATH)) return path;
  return `${BASE_PATH}${path}`;
}
