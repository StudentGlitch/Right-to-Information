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

## Deploying to Vercel

Connect the repo in the Vercel dashboard and import the project with the following settings:

| Setting | Value |
|---|---|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
