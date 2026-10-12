# 🚀 Local Business Finder — Production Deployment Guide

This guide walks you through deploying **Local Business Finder** to the cloud so you and anyone else can access it 24/7 through a public website URL from any device (phone, tablet, computer) without needing VS Code or your computer to remain running.

---

## 🏗️ Recommended Production Architecture (100% Free Tier)

| Component | Recommended Cloud Provider | Free Tier Specification | Cost |
| :--- | :--- | :--- | :--- |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) | M0 Sandbox (512 MB storage, shared RAM, automated backups) | **$0 / month** |
| **Backend API** | [Render](https://render.com) | Free Web Service (512 MB RAM, 0.1 CPU, automatic HTTPS, health check) | **$0 / month** |
| **Frontend Web** | [Vercel](https://vercel.com) | Hobby Tier (Global Edge CDN, unlimited previews, automatic HTTPS) | **$0 / month** |

> [!NOTE]
> **Free Tier Cold Starts:** Free Render backend services sleep after 15 minutes of inactivity. When a user opens the website after it sleeps, the first request may take 30–50 seconds to spin up, after which it runs at standard speed.

---

## Part 1: Persistent Cloud Database Setup (MongoDB Atlas)

1. **Create an Account & Cluster:**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in.
   - Click **Create Deployment** → Select **M0 (Free)** → Choose an AWS region close to your users (e.g., `ap-south-1` Mumbai or `ap-southeast-1` Singapore) → Click **Create**.

2. **Configure Database User:**
   - Under **Security** → **Database Access**, click **Add New Database User**.
   - Select **Password Authentication**.
   - Username: `lbf_admin`
   - Password: Click **Autogenerate Secure Password** and copy it somewhere safe.
   - Database User Privileges: Select **Read and write to any database**.
   - Click **Add User**.

3. **Configure Network Access (IP Whitelist):**
   - Under **Security** → **Network Access**, click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`).
   - Click **Confirm**. *(This is required because cloud hosting providers like Render and Vercel use dynamic outbound IP addresses).*

4. **Copy Connection String URI:**
   - Under **Deployments** → **Database**, click **Connect** on your cluster.
   - Select **Drivers** (Node.js).
   - Copy the connection string. It will look like:
     ```
     mongodb+srv://lbf_admin:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<db_password>` with your actual password and add the database name `/local_business_finder` before the `?`:
     ```
     mongodb+srv://lbf_admin:YourSecretPassword123@cluster0.abcde.mongodb.net/local_business_finder?retryWrites=true&w=majority
     ```

---

## Part 2: Push Code to GitHub

Cloud platforms like Render and Vercel deploy directly from your GitHub repository:

1. **Install Git** (if not already installed) from [git-scm.com](https://git-scm.com) or run:
   ```powershell
   winget install --id Git.Git -e --source winget
   ```
2. **Initialize Git and Commit:**
   In your project root (`c:\Users\lenovo\Desktop\LocalBuisnessFinder`):
   ```bash
   git init
   git add .
   git commit -m "feat: complete Local Business Finder deployment readiness"
   ```
3. **Push to a new GitHub Repository:**
   - Go to [github.com/new](https://github.com/new) and create a new repository called `local-business-finder`.
   - Link and push your code:
     ```bash
     git remote add origin https://github.com/<your-username>/local-business-finder.git
     git branch -M main
     git push -u origin main
     ```

---

## Part 3: Deploy Backend API to Render

1. Go to [dashboard.render.com](https://dashboard.render.com) and sign in with GitHub.
2. Click **New +** → **Web Service**.
3. Select your GitHub repository: `local-business-finder`.
4. Configure the Web Service settings:
   - **Name:** `local-business-finder-api`
   - **Region:** Choose the region closest to your MongoDB Atlas cluster (e.g., Oregon or Singapore).
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
5. Click **Advanced** → **Add Environment Variable** and configure:

| Environment Variable | Value | Notes |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enforces production mode |
| `PORT` | `10000` | (Render sets this automatically) |
| `MONGODB_URI` | `mongodb+srv://lbf_admin:...` | Your MongoDB Atlas connection URI |
| `USE_IN_MEMORY_DB_FALLBACK` | `false` | Enforces real cloud database persistence |
| `JWT_SECRET` | *(Random 64-char string)* | e.g. `lbf_prod_jwt_secret_9876543210_safe` |
| `JWT_EXPIRES_IN` | `7d` | Token lifetime |
| `CLIENT_URL` | `https://*.vercel.app,http://localhost:3000` | (Update with your Vercel URL once created) |

6. Click **Deploy Web Service**.
7. Once deployed, Render will display your live backend URL:
   `https://local-business-finder-api.onrender.com`
   Test it by opening: `https://local-business-finder-api.onrender.com/health` in your browser. It should return:
   ```json
   { "status": "ok", "service": "Local Business Finder API", "environment": "production" }
   ```

---

## Part 4: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Import your `local-business-finder` repository.
4. In the Project Configuration:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and select `frontend`.
   - **Build Command:** `npm run build` (or `vite build`)
   - **Output Directory:** `dist`
5. Expand **Environment Variables** and add:

| Name | Value |
| :--- | :--- |
| `VITE_API_BASE_URL` | `https://local-business-finder-api.onrender.com/api` |

*(Replace with your actual Render backend URL from Part 3 + `/api`)*

6. Click **Deploy**.
7. Vercel will build and assign you a public URL:
   `https://local-business-finder.vercel.app`

8. **Update Backend CORS:**
   Go back to Render → `local-business-finder-api` → **Environment** → Update `CLIENT_URL` with your final Vercel URL (e.g. `https://local-business-finder.vercel.app`).

---

## Part 5: Alternative All-in-One Deployment (Single URL on Render)

If you prefer **both the frontend and backend hosted on a single URL** (e.g., `https://local-business-finder.onrender.com`), you can use Render's Monorepo support:

1. Create a Web Service on Render with **Root Directory** left blank (repository root).
2. **Build Command:**
   ```bash
   npm run build:frontend && cd backend && npm install
   ```
3. **Start Command:**
   ```bash
   node backend/src/server.js
   ```
4. Set the same Environment Variables (`NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`).
5. Because `backend/src/app.js` is programmed to automatically serve `frontend/dist` when present, visiting `https://your-service.onrender.com` will serve the React UI, and API calls will hit `/api` on the exact same origin with zero CORS overhead!

---

## Part 6: Verification Checklist

Once deployed, verify the public website:
1. Open your public URL on your smartphone or another browser.
2. Check that the 75 business listings appear on the Home and Explore pages.
3. Test the **"Near Me"** button with browser location permissions.
4. Open the **Admin Console** at `/admin` and log in with:
   - Email: `admin@localbiz.demo`
   - Password: `Password@123`
5. Test the **Duplicate Detector** tab to verify administrative heuristics.
6. Submit a review for any business and confirm the average rating updates dynamically.
