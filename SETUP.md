# CMS Project — Setup Guide

## Prerequisites

- Node.js 18+
- A MongoDB Atlas account (free tier works)

---

## 1. Create a MongoDB Atlas Cluster

### Step 1: Sign up / Log in

Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account (or log in).

### Step 2: Create a free cluster

1. Click **"Build a Database"** (or **"Create"** if you already have projects).
2. Choose **M0 FREE** tier.
3. Pick a cloud provider and region closest to you (any works fine).
4. Name your cluster (e.g. `cms-cluster`) and click **"Create Deployment"**.
5. Wait ~1-3 minutes for provisioning.

### Step 3: Create a database user

During cluster creation (or in **Database Access** from the sidebar):

1. Click **"Add New Database User"**.
2. Choose **Password** authentication.
3. Set a **username** (e.g. `cmsadmin`).
4. Set a **password** — click "Autogenerate Secure Password" and **copy it somewhere safe**.
5. Under **Database User Privileges**, select **"Read and write to any database"**.
6. Click **"Add User"**.

### Step 4: Allow network access

Go to **Network Access** from the sidebar:

1. Click **"Add IP Address"**.
2. For development, click **"Allow Access from Anywhere"** (sets `0.0.0.0/0`).
   - For production, restrict to your server's IP.
3. Click **"Confirm"**.

### Step 5: Get your connection string

1. Go to **Database** from the sidebar.
2. Click **"Connect"** on your cluster.
3. Choose **"Drivers"**.
4. Copy the connection string. It looks like:

```
mongodb+srv://cmsadmin:<password>@cms-cluster.abc123.mongodb.net/?retryWrites=true&w=majority
```

5. Replace `<password>` with the password you created in Step 3.
6. Add the database name `cms` before the `?`:

```
mongodb+srv://cmsadmin:YOUR_PASSWORD@cms-cluster.abc123.mongodb.net/cms?retryWrites=true&w=majority
```

---

## 2. Configure the Backend

### Step 1: Set environment variables

Open `backend/.env` and fill in your values:

```env
PORT=5000
MONGO_URI=mongodb+srv://cmsadmin:YOUR_PASSWORD@cms-cluster.abc123.mongodb.net/cms?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
```

**Important:**

- Replace the entire `MONGO_URI` value with the connection string from Step 5 above.
- Replace `JWT_SECRET` with a strong random string (at least 32 characters). You can generate one by running: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

### Step 2: Install dependencies

```bash
cd backend
npm install
```

### Step 3: Start the backend

```bash
npm run dev
```

You should see: `Server running on port 5000`

If you see a connection error, double-check your `MONGO_URI`, database user password, and network access settings in Atlas.

---

## 3. Configure the Frontend

### Step 1: Install dependencies

```bash
cd frontend
npm install
```

### Step 2: (Optional) Set API URL

The frontend defaults to `http://localhost:5000/api`. If your backend runs on a different port, create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Start the frontend

```bash
npm run dev
```

---

## 4. Create Your First Admin User

Once both servers are running:

1. Open the frontend in your browser.
2. Click **"Create one"** on the login page to register.
3. This creates an **author** account by default.

To make your first user an **admin**, use MongoDB Atlas:

1. Go to your Atlas dashboard → **Database** → **Browse Collections**.
2. Select the `cms` database → `users` collection.
3. Find your user document and click the **pencil icon** to edit.
4. Change `"role": "author"` to `"role": "admin"`.
5. Click **"Update"**.
6. **Log out** and **log back in** on the frontend for the change to take effect.

---

## 5. API Endpoints Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register a new user |
| POST | `/auth/login` | — | Log in |
| GET | `/auth/me` | JWT | Get current user profile |

### Articles
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/articles` | — | Public articles (search, filter, paginate) |
| GET | `/articles/admin` | JWT | Dashboard articles (all statuses) |
| GET | `/articles/slug/:slug` | — | Single article by slug (increments views) |
| GET | `/articles/:id` | JWT | Single article by ID |
| GET | `/articles/:id/related` | — | Related articles |
| POST | `/articles` | JWT | Create article |
| PUT | `/articles/:id` | JWT | Update article (owner or admin) |
| DELETE | `/articles/:id` | JWT | Delete article (owner or admin) |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | — | All categories |
| POST | `/categories` | Admin | Create category |
| PUT | `/categories/:id` | Admin | Update category |
| DELETE | `/categories/:id` | Admin | Delete category |

### Tags
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/tags` | — | All tags |
| POST | `/tags` | Admin | Create tag |
| PUT | `/tags/:id` | Admin | Update tag |
| DELETE | `/tags/:id` | Admin | Delete tag |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users` | Admin | All users |
| DELETE | `/users/:id` | Admin | Delete user |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | JWT | Dashboard statistics |

### Query Parameters for `GET /articles`

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search in title and content |
| `category` | string | Filter by category slug |
| `tag` | string | Filter by tag slug |
| `sort` | string | `latest` (default) or `views` |
| `page` | number | Page number (default 1) |

### Query Parameters for `GET /articles/admin`

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search in title |
| `status` | string | `all`, `draft`, `pending`, or `published` |
| `page` | number | Page number (default 1) |
| `authorId` | string | Filter by author ID |

---

## 6. Troubleshooting

### "MongoServerSelectionError" or connection timeout

- Verify your `MONGO_URI` in `backend/.env` is correct.
- Ensure your IP is whitelisted in Atlas **Network Access**.
- Ensure the database user password has no special characters that need URL-encoding (or URL-encode them).

### "401 Unauthorized" on protected routes

- Make sure you're logged in. The token is stored in `localStorage` and sent automatically.
- Check that the token hasn't expired (default: 7 days).

### Empty dashboard / no data

- You need to create categories and tags first (as admin), then create articles.
- The public homepage only shows **published** articles.

### CORS errors

- The backend uses `cors()` with defaults (allows all origins). If you deploy to different domains, configure CORS in `backend/src/server.js`.
