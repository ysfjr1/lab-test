export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "author";
  avatar?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  articleCount: number;
  createdAt: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
  articleCount: number;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: Category;
  tags: Tag[];
  author: User;
  status: "draft" | "pending" | "published";
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleFormData {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: "draft" | "pending" | "published";
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  total: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalArticles: number;
  totalViews: number;
  totalCategories: number;
  totalUsers: number;
  recentArticles: Article[];
}

export interface ArticleFilters {
  search?: string;
  category?: string;
  tag?: string;
  sort?: "latest" | "views";
  status?: string;
  page?: number;
  authorId?: string;
}
