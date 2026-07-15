/** Build an internal URL that works both at the domain root and on GitHub Pages project sites. */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;

  return `${normalizedBase}${path.replace(/^\/+/, '')}`;
}
