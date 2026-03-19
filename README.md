# Right-to-Information

A financial transparency hub for listed securities in Indonesia, exposing ownership concentration and governance metrics.

## Tech Stack

- **Next.js 16** — Full-stack React framework (App Router)
- **NextAuth v4** — Google OAuth authentication
- **MongoDB** — Data storage (stocks, owners, users)
- **Midtrans** — Payment gateway (premium plan)
- **Recharts** — Data visualisation
- **Vercel** — Hosting target

---

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) v20+
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Configure Git (Required Before First Commit)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your values
cp .env.example .env.local

# 3. Start the dev server (http://localhost:3000)
npm run dev
```

## Production Build

```bash
npm run build   # Next.js builds to .next/
npm start       # Start the production server
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the required values.

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_URL` | **Yes (prod)** | Full URL of your deployment, e.g. `https://yourapp.vercel.app` |
| `NEXTAUTH_SECRET` | **Yes** | Random secret for JWT signing (`openssl rand -base64 32`) |
| `GOOGLE_CLIENT_ID` | **Yes** | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | **Yes** | Google OAuth client secret |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `MIDTRANS_IS_PRODUCTION` | No | `true` for live payments, `false` for sandbox (default) |
| `MIDTRANS_SERVER_KEY` | Yes (payments) | Midtrans server key |
| `MIDTRANS_CLIENT_KEY` | Yes (payments) | Midtrans client key |

> **Note:** Do not set `NEXTAUTH_URL` to an empty string. Either provide a valid URL or leave the variable unset — NextAuth will fall back to `localhost:3000` automatically for local development.

## Deploying to Vercel

### Recommended: Vercel Dashboard / CLI

1. Import the repository in the **Vercel dashboard**.
2. In **Settings → Build & Output Settings**:
   - **Framework Preset:** `Next.js`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** *(leave empty — Next.js manages `.next/` automatically)*
3. In **Settings → Environment Variables**, add all required variables from the table above.  
   The most important ones for the app to start: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `MONGODB_URI`.
4. Push to **main** — Vercel will build and deploy automatically.

### Why the Output Directory must be left empty

Next.js on Vercel outputs to `.next/`, not `dist/`. Vercel's Next.js runtime handles this automatically when the Framework Preset is set to **Next.js**. Setting Output Directory to `dist` will cause a deployment failure.

### Option B — Docker

```bash
# Build the image
docker build -t right-to-information .

# Run the container
docker run -p 3000:3000 right-to-information
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

## Contributing

1. Fork or clone this repository.
2. Configure your Git user details as shown in [Getting Started](#getting-started).
3. Make your changes, then commit and push:

```bash
git add .
git commit -m "Your descriptive commit message"
git push
```
