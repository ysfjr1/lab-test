const recent = { slug: "", at: 0 };

export function shouldRecordArticleView(slug: string): boolean {
  const now = Date.now();
  if (recent.slug === slug && now - recent.at < 2000) return false;
  recent.slug = slug;
  recent.at = now;
  return true;
}
