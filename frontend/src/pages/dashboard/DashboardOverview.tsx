import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { DashboardStats } from "@/types";
import { dashboardService } from "@/api/services";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/ui/Badge";
import Skeleton from "@/components/ui/Skeleton";

function StatCard({
  label,
  value,
  loading,
}: {
  label: string;
  value: string | number;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      {loading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    dashboardService
      .getStats(user.role === "author" ? user._id : undefined)
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Welcome back. Here's an overview.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Articles"
          value={stats?.totalArticles ?? 0}
          loading={loading}
        />
        <StatCard
          label="Total Views"
          value={stats?.totalViews ?? 0}
          loading={loading}
        />
        {user?.role === "admin" && (
          <>
            <StatCard
              label="Categories"
              value={stats?.totalCategories ?? 0}
              loading={loading}
            />
            <StatCard
              label="Users"
              value={stats?.totalUsers ?? 0}
              loading={loading}
            />
          </>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            Recent Articles
          </h2>
          <Link
            to="/dashboard/articles"
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-5 py-3">
                        <Skeleton className="h-4 w-48" />
                      </td>
                      <td className="px-5 py-3">
                        <Skeleton className="h-4 w-16" />
                      </td>
                      {user?.role === "admin" && (
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <Skeleton className="h-4 w-24" />
                        </td>
                      )}
                      <td className="px-5 py-3 hidden md:table-cell">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    </tr>
                  ))
                : stats?.recentArticles.map((article) => (
                    <tr key={article._id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {article.title}
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
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
