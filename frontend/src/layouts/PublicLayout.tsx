import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function PublicLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="text-xl font-bold text-gray-900">
            CMS
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Dashboard
              </Link>
            ) : !isAuthPage ? (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                >
                  Get started
                </Link>
              </>
            ) : null}
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} CMS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
