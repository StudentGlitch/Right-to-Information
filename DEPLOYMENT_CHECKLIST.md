# Deployment Checklist

This document summarises every change made to prepare the repository for
production deployment on Vercel, and the commands needed to verify or run
the application.

---

## Files Added / Modified

| File | Status | Purpose |
|---|---|---|
| `package.json` | **Added** | Defines the project, all dependencies pinned to exact versions, and build scripts |
| `index.html` | **Added** | Vite entry point — mounts the React app into `<div id="root">` |
| `main.jsx` | **Added** | React DOM render entry — bootstraps `<App />` |
| `vite.config.js` | **Added** | Vite configuration with `@vitejs/plugin-react` |
| `.env.example` | **Added** | Placeholder for future environment variables — no real secrets |
| `vercel.json` | **Added** | SPA rewrite rule so all routes resolve to `index.html` |
| `nginx.conf` | **Added** | Nginx config for Docker — SPA routing + gzip compression |
| `Dockerfile` | **Added** | Multi-stage build: Node 20 Alpine (build) → Nginx 1.27 Alpine (serve) |
| `docker-compose.yml` | **Added** | Runs the Dockerised app with a health check |
| `.github/workflows/deploy.yml` | **Added** | CI/CD pipeline — build on every PR; deploy to Vercel on push to `main` |
| `README.md` | **Modified** | Expanded with local dev, build, deployment, and secrets instructions |

---

## Dependency Versions (all pinned, no `^` or `~`)

| Package | Version | Type |
|---|---|---|
| `react` | `18.3.1` | dependency |
| `react-dom` | `18.3.1` | dependency |
| `recharts` | `2.12.7` | dependency |
| `@vitejs/plugin-react` | `4.3.4` | devDependency |
| `vite` | `6.4.1` | devDependency |

---

## Secrets Required (GitHub → Settings → Secrets and variables → Actions)

| Secret | Where to find it |
|---|---|
| `VERCEL_TOKEN` | <https://vercel.com/account/tokens> |
| `VERCEL_ORG_ID` | Vercel → team settings → General |
| `VERCEL_PROJECT_ID` | Vercel → project settings → General |

---

## Commands to Verify the Build

```bash
# 1. Install dependencies
npm install

# 2. Verify the production build passes
npm run build

# 3. (Optional) Preview the built app locally
npm run preview

# 4. (Optional) Build and run with Docker
docker build -t right-to-information .
docker run -p 80:80 right-to-information

# 5. (Optional) Docker Compose
docker compose up --build
```

---

## Vercel Project Settings (if importing via dashboard)

| Setting | Value |
|---|---|
| Framework Preset | **Vite** |
| Root Directory | `.` (repo root) |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

---

## Environment Variables

No environment variables are required for the current build.
When environment variables are added in the future:

1. Add the key (with no value) to `.env.example`.
2. Add the key + value to the Vercel project's environment variable settings.
3. Prefix all browser-exposed variables with `VITE_`.
4. Never commit `.env` to version control.
