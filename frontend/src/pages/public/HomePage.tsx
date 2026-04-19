import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Article, PaginatedResponse } from "@/types";
import { articleService } from "@/api/services";
import { useDebounce } from "@/hooks/useDebounce";
import ArticleCard from "@/components/blog/ArticleCard";
import ArticleFilters from "@/components/blog/ArticleFilters";
import Pagination from "@/components/ui/Pagination";
import { ArticleCardSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [tag, setTag] = useState(searchParams.get("tag") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [resultState, setResultState] = useState<{
    key: string;
    result: PaginatedResponse<Article>;
  } | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const queryKey = `${debouncedSearch}|${category}|${tag}|${sort}|${page}`;

  const syncParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category) params.category = category;
    if (tag) params.tag = tag;
    if (sort !== "latest") params.sort = sort;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, category, tag, sort, page, setSearchParams]);

  useEffect(() => {
    syncParams();
  }, [syncParams]);

  useEffect(() => {
    let cancelled = false;
    articleService
      .getAll({
        search: debouncedSearch,
        category,
        tag,
        sort: sort as "latest" | "views",
        page,
      })
      .then((result) => {
        if (!cancelled) {
          setResultState({ key: queryKey, result });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, category, tag, sort, page, queryKey]);

  const handleFilterChange =
    (setter: (v: string) => void) => (value: string) => {
      setter(value);
      setPage(1);
    };

  const loading = resultState?.key !== queryKey;
  const result = resultState?.key === queryKey ? resultState.result : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Blog</h1>
        <p className="text-gray-500">
          Discover articles, tutorials, and insights.
        </p>
      </div>

      <div className="mb-8">
        <ArticleFilters
          search={search}
          category={category}
          tag={tag}
          sort={sort}
          onSearchChange={handleFilterChange(setSearch)}
          onCategoryChange={handleFilterChange(setCategory)}
          onTagChange={handleFilterChange(setTag)}
          onSortChange={handleFilterChange(setSort)}
        />
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ArticleCardSkeleton key={i} />
          ))}
        </div>
      ) : result && result.data.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.map((article) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onPageChange={setPage}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No articles found"
          description="Try adjusting your search or filters."
        />
      )}
    </div>
  );
}
