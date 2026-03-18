# Changes Summary

## Visual Redesign: Robinhood-Inspired Dark Theme

### Files Created
- `styles/_tokens.scss` — CSS custom properties (design token system): backgrounds, brand accent (#00C805), bull/bear colors, typography scale, spacing, border-radius, shadows, and transitions
- `styles/_typography.scss` — Font imports (Inter + JetBrains Mono), numeric utility classes
- `styles/globals.scss` — Reset, base body styles, custom scrollbar, focus ring, text selection
- `styles/App.module.scss` — Full SCSS module with all component classes and keyframe animations
- `DESIGN_AUDIT.md` — Audit of previous visual problems and color/typography/chart inventory
- `REDESIGN_PLAN.md` — Token system spec, component redesign list, animation plan

### Files Modified

#### `App.jsx`
- Added `import styles from "./styles/App.module.scss"` 
- Added `AreaChart`, `Area` to recharts imports
- Replaced `StockDetail` component: all structural inline styles → CSS module classes; price history chart changed from BarChart to AreaChart with gradient fill
- Added `MiniSparkline` component: 60×32 sparkline in screener table rows, colored by tier (Green/Amber/Red)
- Rewrote App `return` block: removed embedded `<style>` tag, removed `<link>` font tag, replaced all `className="..."` strings and `style={{...}}` props with `styles.*` module references
- Dynamic/data-driven inline styles preserved where needed: HeatCell (computed RGB heat colors), FlagPill/Tooltip2 (flag color map), owner type badges (OWNER_TYPE_MAP), chart tooltip contentStyle (CSS variables used)

#### `main.jsx`
- Added `import "./styles/globals.scss"` for global reset and base styles

#### `index.html`
- Added Google Fonts preconnect and stylesheet link for Inter + JetBrains Mono

### Design Changes
- **Background**: `#060d18` → `#0A0B0D` (deeper black)
- **Surface**: `#09131f` → `#111318`
- **Accent**: `#457B9D` (blue) → `#00C805` (Robinhood green)
- **Font**: DM Sans/DM Mono → Inter/JetBrains Mono
- **Animations**: Page entrance fade+slide, table row stagger, chart entrance scale, skeleton shimmer
- **New**: Mini sparklines in screener table TREND column
- **Charts**: Updated to use CSS variable colors; price chart upgraded to AreaChart with gradient

### No Logic Changes
All data (`_D`, `RAW`), state management, filtering, sorting, API calls, and business logic are unchanged.
