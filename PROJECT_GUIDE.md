# Blog Platform — Project Guide

This document explains how the semester project is structured, how the frontend and backend communicate, and how authentication and article view counting work. Use it as a reference when presenting or demoing the app.

---

## 1. High-level overview

The project is a **full-stack blog / content management system**:

| Part | Role |
|------|------|
| **Frontend** (`frontend/`) | React SPA: public blog (home, article detail) + authenticated dashboard (articles, categories, tags, users) |
| **Backend** (`backend/`) | REST API with Express + MongoDB (Mongoose) |
| **Database** | MongoDB — users, articles, categories, tags |

```
┌─────────────┐     HTTP (JSON)      ┌─────────────┐     Mongoose     ┌──────────┐
│   React     │  ─────────────────►  │   Express   │  ─────────────►  │ MongoDB  │
│  (Vite)     │  /api/* + JWT header │   (Node)    │                  │          │
└─────────────┘                      └─────────────┘                  └──────────┘
```

Typical flow: the user opens the React app → pages call **service functions** → those use a **single Axios instance** → the backend validates JWT on protected routes → controllers read/write MongoDB → JSON is returned.

---

## 2. Tech stack and packages

### Backend (`backend/package.json`)

| Package | Purpose |
|---------|---------|
| **express** | HTTP server and routing |
| **mongoose** | MongoDB ODM (schemas, queries) |
| **jsonwebtoken** | Sign and verify JWT after login/register |
| **bcrypt** | Hash passwords before saving users |
| **cors** | Allow browser requests from the frontend origin |
| **dotenv** | Load `PORT`, `MONGO_URI`, `JWT_SECRET`, etc. from `.env` |
| **slugify** | Generate URL-friendly article slugs from titles |

Scripts: `npm run dev` (watch mode), `npm start`.

### Frontend (`frontend/package.json`)

| Package | Purpose |
|---------|---------|
| **react** / **react-dom** | UI |
| **react-router-dom** | Client-side routes (`/`, `/article/:slug`, `/dashboard`, …) |
| **axios** | HTTP client (wrapped in one shared instance) |
| **vite** | Dev server and production build |
| **tailwindcss** | Styling |
| **dompurify** | Sanitize HTML article content before `dangerouslySetInnerHTML` |
| **react-quill-new** | Rich text editor in the article form (dashboard) |

Scripts: `npm run dev`, `npm run build`.

---

## 3. Project folder structure

```
web-project/
├── backend/
│   └── src/
│       ├── server.js              # App entry, mounts routes, CORS, JSON parser
│       ├── config/db.js           # MongoDB connection
│       ├── models/                # User, Article, Category, Tag schemas
│       ├── controllers/           # Business logic per resource
│       ├── routes/                # URL → controller mapping + auth middleware
│       ├── middlewares/
│       │   ├── auth.js            # JWT verify + role checks
│       │   └── error.js           # Central error → JSON responses
│       └── utils/ApiError.js      # Custom HTTP errors
│
└── frontend/
    └── src/
        ├── main.tsx               # React root (StrictMode)
        ├── App.tsx                # Routes + AuthProvider
        ├── api/
        │   ├── axios.ts           # Single Axios client + interceptors
        │   └── services.ts        # authService, articleService, …
        ├── contexts/AuthContext.tsx
        ├── hooks/useAuth.ts
        ├── components/ProtectedRoute.tsx, AdminRoute.tsx
        ├── pages/public/          # Home, Article detail
        ├── pages/auth/            # Login, Register
        ├── pages/dashboard/       # CMS pages
        ├── types/index.ts         # TypeScript interfaces
        └── utils/viewTracking.ts  # Client-side duplicate view guard
```

---

## 4. Backend architecture

### 4.1 Server entry (`backend/src/server.js`)

- Loads environment variables.
- Connects to MongoDB, then listens on `PORT` (default **5000**).
- Mounts all APIs under `/api`:
  - `/api/auth` — register, login, profile
  - `/api/articles` — public list/detail + protected CRUD
  - `/api/categories`, `/api/tags` — mostly public read; admin write
  - `/api/users` — admin only
  - `/api/dashboard` — stats for logged-in users
- Global **`errorHandler`** converts thrown errors into `{ message }` JSON.

### 4.2 Layering pattern

```
Route  →  Middleware (optional)  →  Controller  →  Model (Mongoose)
```

Example: `POST /api/articles` → `authenticate` → `articleController.create` → `Article.create(...)`.

### 4.3 Data models (MongoDB)

**User** (`models/User.js`)

- Fields: `name`, `email`, `password` (hidden by default), `role` (`admin` | `author`).
- Password hashed on save with bcrypt (12 rounds).
- `comparePassword()` used at login.

**Article** (`models/Article.js`)

- Fields: `title`, `slug`, `excerpt`, `content`, `coverImage`, `author`, `category`, `tags`, `status` (`draft` | `pending` | `published`), **`views`** (number, default `0`).
- Slug auto-generated on title change: `slugify(title) + "-" + timestamp`.
- Text index on `title` and `content` for search.

**Category / Tag**

- Name, slug; controllers attach `articleCount` via aggregation when listing.

### 4.4 Roles and authorization (server)

| Role | Typical permissions |
|------|------------------------|
| **author** | Create/edit/delete **own** articles; see own stats on dashboard |
| **admin** | All author abilities + manage categories, tags, users; see global stats |

Middleware in `middlewares/auth.js`:

1. **`authenticate`** — Reads `Authorization: Bearer <token>`, verifies JWT with `JWT_SECRET`, loads user into `req.user`.
2. **`authorize("admin")`** — Ensures `req.user.role` is in the allowed list.

Additional checks in controllers (e.g. authors cannot edit another author’s article).

### 4.5 API endpoints (summary)

**Auth** (`/api/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | No | Create user, return JWT + user |
| POST | `/login` | No | Validate credentials, return JWT + user |
| GET | `/me` | Yes | Current user profile |

**Articles** (`/api/articles`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Published articles (search, category, tag, sort, pagination) |
| GET | `/slug/:slug` | No | Single published article by slug |
| POST | `/:id/view` | No | **Increment view count** (see §6) |
| GET | `/:id/related` | No | Related published articles |
| GET | `/admin` | Yes | Dashboard article list (authors see only theirs) |
| GET | `/:id` | Yes | Article by ID (author scope enforced) |
| POST | `/` | Yes | Create article |
| PUT | `/:id` | Yes | Update article |
| DELETE | `/:id` | Yes | Delete article |

**Categories / Tags** — `GET /` public; `POST`, `PUT`, `DELETE` require **admin**.

**Users** — entire router requires **admin**.

**Dashboard** — `GET /stats` requires login; authors get filtered aggregates.

Pagination: **6 items per page** (`ITEMS_PER_PAGE` in `articleController.js`).

---

## 5. Frontend architecture

### 5.1 Routing (`App.tsx`)

| Area | Paths | Guard |
|------|-------|--------|
| Public | `/`, `/article/:slug`, `/login`, `/register` | None |
| Dashboard | `/dashboard`, `/dashboard/articles`, … | `ProtectedRoute` (must be logged in) |
| Admin only | `/dashboard/categories`, `/tags`, `/users` | `AdminRoute` (`role === "admin"`) |

`ProtectedRoute` and `AdminRoute` read `user` from React Context; they do **not** call the API on every navigation—they trust `localStorage` + context state set at login.

### 5.2 Pages (what each does)

- **HomePage** — Lists published articles with filters (search debounced 300ms), URL query sync, pagination.
- **ArticleDetailPage** — Loads article by slug, records a view, shows sanitized HTML, related articles.
- **LoginPage / RegisterPage** — Call `AuthContext` → `authService` → store token/user.
- **Dashboard** — CRUD for articles; admins manage categories, tags, users; overview shows stats from `dashboardService`.

---

## 6. API layer: centralized fetch (not manual token per call)

The frontend does **not** use raw `fetch()` everywhere or pass a token on each service call manually.

### Single Axios instance (`frontend/src/api/axios.ts`)

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});
```

**Request interceptor** — On every outgoing request:

1. Reads `localStorage.getItem("token")`.
2. If present, sets `Authorization: Bearer <token>`.

So `articleService.create()`, `categoryService.getAll()`, etc. automatically include the JWT when the user is logged in. Public endpoints (e.g. `GET /articles`) simply send no `Authorization` header.

**Response interceptor** — On **401**:

1. Clears `token` and `user` from `localStorage`.
2. Redirects to `/login`.

### Service layer (`frontend/src/api/services.ts`)

All HTTP calls go through named exports:

- `authService` — login, register, getProfile
- `articleService` — getAll, getBySlug, **recordView**, create, update, delete, …
- `categoryService`, `tagService`, `userService`, `dashboardService`

Components import these services; they never configure Axios headers themselves.

**Presentation talking point:** *“We use one configured HTTP client with interceptors, so authentication is centralized and DRY.”*

---

## 7. Authentication — end-to-end flow

### 7.1 Register / Login

```
User submits form
    → AuthContext.login() / register()
    → authService.login() → POST /api/auth/login
    → Backend: find user, bcrypt.compare(password)
    → Backend: jwt.sign({ id }, JWT_SECRET)
    → Response: { token, user }
    → Frontend: localStorage.setItem("token"), setItem("user")
    → React state: setToken, setUser
```

Password never stored in plain text on the server; the client only keeps the **JWT** and a JSON copy of the **user** (without password).

### 7.2 Subsequent API calls

```
Any api.get/post/...
    → Request interceptor adds Bearer token
    → Backend authenticate middleware verifies JWT
    → req.user attached for controllers
```

### 7.3 Logout

`AuthContext.logout()` removes `token` and `user` from `localStorage` and clears React state. No server-side session table—the API is **stateless JWT**.

### 7.4 Frontend vs backend protection

| Layer | What it protects |
|-------|------------------|
| **React routes** | UX: redirect guests away from `/dashboard` |
| **Express middleware** | Real security: rejects missing/invalid JWT and wrong roles |

Always explain in a presentation that **route guards alone are not security**; the backend enforces permissions.

### 7.5 Environment variables

**Backend** (`.env.example`):

```
PORT=5000
MONGO_URI=<mongodb connection string>
JWT_SECRET=<secret>
JWT_EXPIRES_IN=7d
```

**Frontend** (`.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

---

## 8. Article view counting — full flow

Views are **not** incremented when loading the article JSON. They use a **separate explicit endpoint** so listing/reading metadata does not inflate counts incorrectly.

### 8.1 Database field

`Article.views` — number, default `0`, stored in MongoDB.

### 8.2 Backend: increment (`articleController.recordView`)

**Route:** `POST /api/articles/:id/view` (no authentication required — public readers can view).

**Logic:**

```js
Article.findOneAndUpdate(
  { _id: req.params.id, status: "published" },
  { $inc: { views: 1 } },
  { new: true }
)
```

- Only **published** articles are counted.
- Uses atomic `$inc` so concurrent requests don’t corrupt the counter.
- Returns `{ views: <new total> }`.

### 8.3 Frontend: when to call

**File:** `frontend/src/pages/public/ArticleDetailPage.tsx`

1. `useEffect` runs when `slug` changes.
2. `articleService.getBySlug(slug)` — fetch article (views = current DB value).
3. If `shouldRecordArticleView(slug)` returns true:
   - `articleService.recordView(article._id)` — POST to increment.
   - Updates local state with returned `views`.
4. `articleService.getRelated(article._id)` — load related cards.

### 8.4 Frontend: duplicate prevention (`utils/viewTracking.ts`)

React **StrictMode** (enabled in `main.tsx`) runs effects twice in development, which could double-count views.

`shouldRecordArticleView(slug)` keeps a small in-memory cache:

- If the same `slug` was recorded within **2 seconds**, skip the POST.
- Otherwise allow one record and update the timestamp.

This is **client-side deduplication only**; it does not stop a user from refreshing after 2 seconds or counting from multiple devices (that would need IP/session logic on the server).

### 8.5 Where views appear

- **Article detail** — eye icon + `article.views.toLocaleString()`.
- **Homepage** — optional sort `sort=views` (backend sorts by `-views`).
- **Dashboard stats** — `totalViews` sums `views` across articles (all for admin, own for author).

### 8.6 View flow diagram

```
User opens /article/my-post-slug
        │
        ▼
GET /api/articles/slug/my-post-slug  →  article (views = N)
        │
        ▼
shouldRecordArticleView(slug)?  ──no──► skip POST (duplicate within 2s)
        │ yes
        ▼
POST /api/articles/:id/view  →  MongoDB $inc  →  { views: N+1 }
        │
        ▼
UI shows updated count
```

---

## 9. Other notable behaviors (for Q&A)

### Article statuses

- `draft`, `pending`, `published`.
- Public `GET /articles` and `getBySlug` only return **`published`**.

### Rich content safety

Article HTML from the editor is rendered with **DOMPurify** on the detail page to reduce XSS risk.

### Error handling

- Backend throws `ApiError(status, message)` or Mongoose errors; `errorHandler` normalizes responses.
- Frontend services often catch 404 and return `undefined` for missing articles.

### Author vs admin on dashboard

- `getAllAdmin` filters by `req.user._id` when role is `author`.
- `dashboardController.getStats` uses the same filter for counts and recent articles.

---

## 10. How to run locally (demo checklist)

1. **MongoDB** running and `MONGO_URI` set in `backend/.env`.
2. Backend: `cd backend && npm install && npm run dev` → `http://localhost:5000`.
3. Frontend: `cd frontend && npm install && npm run dev` → usually `http://localhost:5173`.
4. Ensure `VITE_API_URL` points to `http://localhost:5000/api`.

---

## 11. Quick presentation script

1. **Stack:** React + Vite frontend, Express + MongoDB backend, JWT auth.
2. **API design:** RESTful resources; centralized Axios with automatic Bearer token.
3. **Auth:** Register/login get JWT; middleware protects writes; roles `admin` / `author`.
4. **Public vs private:** Blog reads are open; dashboard mutations require login.
5. **Views:** Separate `POST .../view` with MongoDB `$inc`; frontend dedupes StrictMode double-fires; display on detail and dashboard aggregates.

---

*Generated for semester project documentation. Update this file if routes or auth behavior change.*
