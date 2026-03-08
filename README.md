# Right-to-Information

My experiment for vibe coding to make a website hub for financial information.

## Tech Stack

- **React 18** — UI framework
- **Recharts** — data visualisation
- **Vite** — build tool
- **Vercel** — hosting target

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev
```

## Production Build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the built app locally
```

## Environment Variables

Copy `.env.example` to `.env` and fill in any required values before running locally.

```bash
cp .env.example .env
```

All environment variables exposed to the browser must be prefixed with `VITE_`.

## Deploying to Vercel

### Option A — Vercel CLI / Dashboard (recommended)

1. Push to **main** — the GitHub Actions workflow will build and deploy automatically
   (requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` secrets set in the repo).
2. Alternatively, connect the repo in the Vercel dashboard and import the project.
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Option B — Docker

```bash
# Build the image
docker build -t right-to-information .

# Run the container
docker run -p 80:80 right-to-information
```

Or with Docker Compose:

```bash
docker compose up --build
```

## Required GitHub Secrets (for CI/CD)

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Personal access token from vercel.com/account/tokens |
| `VERCEL_ORG_ID` | Found in your Vercel team/org settings |
| `VERCEL_PROJECT_ID` | Found in the Vercel project settings |
