import type {
  Article,
  ArticleFilters,
  ArticleFormData,
  AuthResponse,
  Category,
  DashboardStats,
  PaginatedResponse,
  Tag,
  User,
} from "@/types";
import api from "./axios";

// Auth
export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },
};

// Articles
export const articleService = {
  async getAll(
    filters: ArticleFilters = {}
  ): Promise<PaginatedResponse<Article>> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.tag) params.tag = filters.tag;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = String(filters.page);

    const { data } = await api.get<PaginatedResponse<Article>>("/articles", {
      params,
    });
    return data;
  },

  async getAllAdmin(
    filters: ArticleFilters = {}
  ): Promise<PaginatedResponse<Article>> {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.page) params.page = String(filters.page);
    if (filters.authorId) params.authorId = filters.authorId;

    const { data } = await api.get<PaginatedResponse<Article>>(
      "/articles/admin",
      { params }
    );
    return data;
  },

  async getBySlug(slug: string): Promise<Article | undefined> {
    try {
      const { data } = await api.get<Article>(`/articles/slug/${slug}`);
      return data;
    } catch {
      return undefined;
    }
  },

  async getById(id: string): Promise<Article | undefined> {
    try {
      const { data } = await api.get<Article>(`/articles/${id}`);
      return data;
    } catch {
      return undefined;
    }
  },

  async getRelated(articleId: string): Promise<Article[]> {
    const { data } = await api.get<Article[]>(`/articles/${articleId}/related`);
    return data;
  },

  async recordView(articleId: string): Promise<number> {
    const { data } = await api.post<{ views: number }>(
      `/articles/${articleId}/view`
    );
    return data.views;
  },

  async create(formData: ArticleFormData): Promise<Article> {
    const { data } = await api.post<Article>("/articles", formData);
    return data;
  },

  async update(
    id: string,
    formData: Partial<ArticleFormData>
  ): Promise<Article> {
    const { data } = await api.put<Article>(`/articles/${id}`, formData);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/articles/${id}`);
  },
};

// Categories
export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<Category[]>("/categories");
    return data;
  },

  async create(payload: {
    name: string;
    description?: string;
  }): Promise<Category> {
    const { data } = await api.post<Category>("/categories", payload);
    return data;
  },

  async update(
    id: string,
    payload: { name: string; description?: string }
  ): Promise<Category> {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

// Tags
export const tagService = {
  async getAll(): Promise<Tag[]> {
    const { data } = await api.get<Tag[]>("/tags");
    return data;
  },

  async create(payload: { name: string }): Promise<Tag> {
    const { data } = await api.post<Tag>("/tags", payload);
    return data;
  },

  async update(id: string, payload: { name: string }): Promise<Tag> {
    const { data } = await api.put<Tag>(`/tags/${id}`, payload);
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/tags/${id}`);
  },
};

// Users
export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get<User[]>("/users");
    return data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

// Dashboard
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>("/dashboard/stats");
    return data;
  },
};
