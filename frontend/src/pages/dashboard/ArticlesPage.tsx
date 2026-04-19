import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Article, PaginatedResponse } from "@/types";
import { articleService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";
import { TableRowSkeleton } from "@/components/ui/Skeleton";
import EmptyState from "@/components/ui/EmptyState";

export default function ArticlesPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [resultState, setResultState] = useState<{
    key: string;
    result: PaginatedResponse<Article>;
  } | null>(null);

  const debouncedSearch = useDebounce(search, 300);
  const queryKey = `${user?._id ?? ""}|${debouncedSearch}|${status}|${page}`;

  const syncParams = useCallback(() => {
    const params: Record<string, string> = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (status !== "all") params.status = status;
    if (page > 1) params.page = String(page);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, status, page, setSearchParams]);

  useEffect(() => {
    syncParams();
  }, [syncParams]);

  useEffect(() => {
    let cancelled = false;
    const authorFilter =
      user?.role === "author" && user._id ? { authorId: user._id } : {};
    articleService
      .getAllAdmin({ search: debouncedSearch, status, page, ...authorFilter })
      .then((result) => {
        if (!cancelled) {
          setResultState({ key: queryKey, result });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, page, queryKey, user?._id, user?.role]);

  const loading = resultState?.key !== queryKey;
  const result = resultState?.key === queryKey ? resultState.result : null;

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?"))
      return;
    await articleService.delete(id);
    setResultState((prev) =>
      prev
        ? {
            ...prev,
            result: {
              ...prev.result,
              data: prev.result.data.filter((a) => a._id !== id),
              total: prev.result.total - 1,
            },
          }
        : prev,
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
          <p className="text-sm text-gray-500">Manage your blog articles</p>
        </div>
        <Link to="/dashboard/articles/new">
          <Button>
            <svg
              className="mr-1.5 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            New Article
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Select
            options={[
              { value: "all", label: "All statuses" },
              { value: "published", label: "Published" },
              { value: "pending", label: "Pending" },
              { value: "draft", label: "Draft" },
            ]}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Title</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                {user?.role === "admin" && (
                  <th className="px-5 py-3 font-medium text-gray-500 hidden sm:table-cell">
                    Author
                  </th>
                )}
                <th className="px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                  Date
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} />
                ))
              ) : result && result.data.length > 0 ? (
                result.data.map((article) => (
                  <tr key={article._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-xs">
                        {article.title}
                      </p>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={article.status} />
                    </td>
                    {user?.role === "admin" && (
                      <td className="px-5 py-3 text-gray-500 hidden sm:table-cell">
                        {article.author.name}
                      </td>
                    )}
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/dashboard/articles/${article._id}/edit`}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(article._id)}
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={user?.role === "admin" ? 5 : 4}>
                    <EmptyState
                      title="No articles found"
                      description="Create your first article to get started."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {result && (
        <div className="mt-4">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
