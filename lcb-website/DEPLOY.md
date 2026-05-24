# Deployment Guide — LCB Website

**Stack:** Vercel (free) + Cloudinary (free) + Upstash Redis (free) = $0/month

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "chore: ready for deploy"
git push
```

---

## Step 2 — Create free accounts (takes ~5 min total)

### Cloudinary (image uploads)
1. Go to https://cloudinary.com → **Sign up free**
2. After signup, go to **Dashboard**
3. Note these 3 values: `Cloud Name`, `API Key`, `API Secret`

### Upstash Redis (data persistence)
1. Go to https://upstash.com → **Sign up free**
2. Click **Create Database** → choose **Redis** → pick any region → **Free** plan
3. After creation, click the database → go to **REST API** tab
4. Note: `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## Step 3 — Deploy on Vercel

1. Go to https://vercel.com → **Sign up with GitHub** (free Hobby plan)
2. Click **Add New Project** → import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Environment Variables** → add these 6 variables:

| Variable | Value |
|---|---|
| `ADMIN_PASSWORD` | your chosen password (not `lcb-admin-2026`) |
| `UPSTASH_REDIS_REST_URL` | from Upstash dashboard |
| `UPSTASH_REDIS_REST_TOKEN` | from Upstash dashboard |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | from Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | from Cloudinary dashboard |

5. Click **Deploy** — done in ~2 minutes

---

## Step 4 — First visit seeds the database

On first page load after deploy, all existing JSON data (news, events, team, etc.) is automatically copied into Upstash Redis. Nothing to do manually.

---

## Custom domain (optional, free)

Vercel gives you `your-project.vercel.app` for free.

To use your own domain (e.g. `lcbbd.com`):
1. Buy domain on Namecheap (~$10/year for `.com`)
2. In Vercel project → **Settings → Domains** → add your domain
3. Follow the DNS instructions Vercel shows you (takes 10–60 min to propagate)

---

## Updating the site after deploy

```bash
git add .
git commit -m "update: ..."
git push
```

Vercel auto-deploys on every push. Takes ~1 minute.

---

## Admin panel

After deploy: `https://your-project.vercel.app/admin`

Password: whatever you set as `ADMIN_PASSWORD` in Vercel env vars.

---

## Local development

```bash
npm run dev
```

Without Upstash/Cloudinary env vars set locally, the app falls back to reading/writing JSON files directly — same as before. No Redis or Cloudinary needed for local dev.
