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
import {
  dummyArticles,
  dummyCategories,
  dummyStats,
  dummyTags,
  dummyUsers,
} from "@/data/dummy";

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const ITEMS_PER_PAGE = 6;

// ─── Auth ───────────────────────────────────────────────
export const authService = {
  async login(email: string, _password: string): Promise<AuthResponse> {
    await delay();
    const user = dummyUsers.find((u) => u.email === email) ?? dummyUsers[0];
    return { token: "dummy-jwt-token-" + user._id, user };
  },

  async register(
    name: string,
    email: string,
    _password: string
  ): Promise<AuthResponse> {
    await delay();
    const user: User = {
      _id: "u-new-" + Date.now(),
      name,
      email,
      role: "author",
      createdAt: new Date().toISOString(),
    };
    return { token: "dummy-jwt-token-" + user._id, user };
  },

  async getProfile(): Promise<User> {
    await delay(200);
    return dummyUsers[0];
  },
};

// ─── Articles ───────────────────────────────────────────
export const articleService = {
  async getAll(
    filters: ArticleFilters = {}
  ): Promise<PaginatedResponse<Article>> {
    await delay();
    let results = [...dummyArticles];

    if (filters.status) {
      results = results.filter((a) => a.status === filters.status);
    } else {
      results = results.filter((a) => a.status === "published");
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q)
      );
    }

    if (filters.category) {
      results = results.filter((a) => a.category.slug === filters.category);
    }

    if (filters.tag) {
      results = results.filter((a) =>
        a.tags.some((t) => t.slug === filters.tag)
      );
    }

    if (filters.sort === "views") {
      results.sort((a, b) => b.views - a.views);
    } else {
      results.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    const page = filters.page ?? 1;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = results.slice(start, start + ITEMS_PER_PAGE);

    return {
      data: paginated,
      page,
      totalPages: Math.ceil(results.length / ITEMS_PER_PAGE),
      total: results.length,
    };
  },

  async getAllAdmin(
    filters: ArticleFilters = {}
  ): Promise<PaginatedResponse<Article>> {
    await delay();
    let results = [...dummyArticles];

    if (filters.authorId) {
      results = results.filter((a) => a.author._id === filters.authorId);
    }

    if (filters.status && filters.status !== "all") {
      results = results.filter((a) => a.status === filters.status);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter((a) => a.title.toLowerCase().includes(q));
    }

    results.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const page = filters.page ?? 1;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const paginated = results.slice(start, start + ITEMS_PER_PAGE);

    return {
      data: paginated,
      page,
      totalPages: Math.ceil(results.length / ITEMS_PER_PAGE),
      total: results.length,
    };
  },

  async getBySlug(slug: string): Promise<Article | undefined> {
    await delay();
    return dummyArticles.find((a) => a.slug === slug);
  },

  async getById(id: string): Promise<Article | undefined> {
    await delay();
    return dummyArticles.find((a) => a._id === id);
  },

  async getRelated(articleId: string): Promise<Article[]> {
    await delay(200);
    const article = dummyArticles.find((a) => a._id === articleId);
    if (!article) return [];
    return dummyArticles
      .filter(
        (a) =>
          a._id !== articleId &&
          a.status === "published" &&
          (a.category._id === article.category._id ||
            a.tags.some((t) => article.tags.some((at) => at._id === t._id)))
      )
      .slice(0, 3);
  },

  async create(_data: ArticleFormData): Promise<Article> {
    await delay();
    return dummyArticles[0];
  },

  async update(_id: string, _data: Partial<ArticleFormData>): Promise<Article> {
    await delay();
    return dummyArticles[0];
  },

  async delete(_id: string): Promise<void> {
    await delay();
  },
};

// ─── Categories ─────────────────────────────────────────
export const categoryService = {
  async getAll(): Promise<Category[]> {
    await delay();
    return dummyCategories;
  },

  async create(data: {
    name: string;
    description?: string;
  }): Promise<Category> {
    await delay();
    return {
      _id: "c-new-" + Date.now(),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      description: data.description,
      articleCount: 0,
      createdAt: new Date().toISOString(),
    };
  },

  async update(
    id: string,
    data: { name: string; description?: string }
  ): Promise<Category> {
    await delay();
    const cat = dummyCategories.find((c) => c._id === id);
    return {
      ...cat!,
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    };
  },

  async delete(_id: string): Promise<void> {
    await delay();
  },
};

// ─── Tags ───────────────────────────────────────────────
export const tagService = {
  async getAll(): Promise<Tag[]> {
    await delay();
    return dummyTags;
  },

  async create(data: { name: string }): Promise<Tag> {
    await delay();
    return {
      _id: "t-new-" + Date.now(),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
      articleCount: 0,
      createdAt: new Date().toISOString(),
    };
  },

  async update(id: string, data: { name: string }): Promise<Tag> {
    await delay();
    const tag = dummyTags.find((t) => t._id === id);
    return {
      ...tag!,
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    };
  },

  async delete(_id: string): Promise<void> {
    await delay();
  },
};

// ─── Users ──────────────────────────────────────────────
export const userService = {
  async getAll(): Promise<User[]> {
    await delay();
    return dummyUsers;
  },

  async update(id: string, data: Partial<User>): Promise<User> {
    await delay();
    const user = dummyUsers.find((u) => u._id === id);
    return { ...user!, ...data };
  },

  async delete(_id: string): Promise<void> {
    await delay();
  },
};

// ─── Dashboard ──────────────────────────────────────────
export const dashboardService = {
  async getStats(forAuthorId?: string): Promise<DashboardStats> {
    await delay();
    if (!forAuthorId) return dummyStats;

    const mine = dummyArticles.filter((a) => a.author._id === forAuthorId);
    const sorted = [...mine].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return {
      totalArticles: mine.length,
      totalViews: mine.reduce((sum, a) => sum + a.views, 0),
      totalCategories: dummyCategories.length,
      totalUsers: dummyUsers.length,
      recentArticles: sorted.slice(0, 5),
    };
  },
};
