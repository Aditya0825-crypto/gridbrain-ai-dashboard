# GridBrain AI Dashboard

Frontend-only React + Vite dashboard for EV charging demand, grid risk intelligence, and infrastructure planning.

## Local Run

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

## Deploy on Vercel

This repo has a nested app folder. Deploy the inner project directory:

- Root Directory: `gridbrain-ai-dashboard-main`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

`vercel.json` is included with SPA rewrites so React Router routes (like `/docs`, `/risk`, `/settings`) work on refresh and direct link open.

## Notes

- App uses `react-router-dom` with `BrowserRouter`, so rewrite fallback is required in production (already configured).
- Favicon is set to `public/favicon.svg`.
