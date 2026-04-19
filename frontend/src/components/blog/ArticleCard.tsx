import { Link } from "react-router-dom";
import type { Article } from "@/types";
import Badge from "@/components/ui/Badge";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const date = new Date(article.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="info">{article.category.name}</Badge>
          <span className="text-xs text-gray-400">{date}</span>
        </div>
        <h3 className="mb-2 text-lg font-semibold leading-snug text-gray-900 group-hover:text-primary-600 transition-colors">
          {article.title}
        </h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-500 line-clamp-2">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
              {article.author.name.charAt(0)}
            </div>
            <span className="text-xs text-gray-500">{article.author.name}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <svg
              className="h-3.5 w-3.5"
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
            {article.views.toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
