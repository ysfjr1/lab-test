import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import type { Article } from "@/types";
import { articleService } from "@/api/services";
import { shouldRecordArticleView } from "@/utils/viewTracking";
import Badge from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";
import ArticleCard from "@/components/blog/ArticleCard";

export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [detailState, setDetailState] = useState<{
    slug: string;
    article: Article | null;
    related: Article[];
  } | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;

    articleService.getBySlug(slug).then(async (a) => {
      if (!a) {
        if (!cancelled) setDetailState({ slug, article: null, related: [] });
        return;
      }

      let article = a;
      if (shouldRecordArticleView(slug)) {
        try {
          const views = await articleService.recordView(a._id);
          article = { ...a, views };
        } catch {
          // View count is non-critical; still show the article
        }
      }

      const related = await articleService.getRelated(a._id);
      if (!cancelled) {
        setDetailState({ slug, article, related });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const loading = Boolean(slug) && detailState?.slug !== slug;
  const article = detailState?.slug === slug ? detailState.article : null;
  const related = detailState?.slug === slug ? detailState.related : [];

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="mb-4 h-8 w-3/4" />
        <Skeleton className="mb-6 h-4 w-1/2" />
        <Skeleton className="mb-8 h-64 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Article not found
        </h1>
        <p className="mb-6 text-gray-500">
          The article you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          &larr; Back to blog
        </Link>
      </div>
    );
  }

  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to blog
      </Link>

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <Badge variant="info">{article.category.name}</Badge>
          {article.tags.map((t) => (
            <Badge key={t._id}>{t.name}</Badge>
          ))}
        </div>

        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
              {article.author.name.charAt(0)}
            </div>
            <span className="font-medium text-gray-700">
              {article.author.name}
            </span>
          </div>
          <span>{date}</span>
          <span className="flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {article.views.toLocaleString()} views
          </span>
        </div>
      </header>

      <img
        src={article.coverImage}
        alt={article.title}
        className="mb-8 w-full rounded-xl object-cover"
      />

      <article
        className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-primary-600 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(article.content),
        }}
      />

      {related.length > 0 && (
        <section className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Related Articles
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a._id} article={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
