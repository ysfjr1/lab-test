import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import PublicLayout from "@/layouts/PublicLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import HomePage from "@/pages/public/HomePage";
import ArticleDetailPage from "@/pages/public/ArticleDetailPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardOverview from "@/pages/dashboard/DashboardOverview";
import ArticlesPage from "@/pages/dashboard/ArticlesPage";
import ArticleFormPage from "@/pages/dashboard/ArticleFormPage";
import CategoriesPage from "@/pages/dashboard/CategoriesPage";
import TagsPage from "@/pages/dashboard/TagsPage";
import UsersPage from "@/pages/dashboard/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/article/:slug" element={<ArticleDetailPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/articles" element={<ArticlesPage />} />
              <Route
                path="/dashboard/articles/new"
                element={<ArticleFormPage />}
              />
              <Route
                path="/dashboard/articles/:id/edit"
                element={<ArticleFormPage />}
              />
              <Route element={<AdminRoute />}>
                <Route
                  path="/dashboard/categories"
                  element={<CategoriesPage />}
                />
                <Route path="/dashboard/tags" element={<TagsPage />} />
                <Route path="/dashboard/users" element={<UsersPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
