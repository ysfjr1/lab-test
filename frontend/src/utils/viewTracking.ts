const recent = { slug: "", at: 0 };

/** Skips duplicate view records within the same short window (e.g. React StrictMode). */
export function shouldRecordArticleView(slug: string): boolean {
  const now = Date.now();
  if (recent.slug === slug && now - recent.at < 2000) return false;
  recent.slug = slug;
  recent.at = now;
  return true;
}
