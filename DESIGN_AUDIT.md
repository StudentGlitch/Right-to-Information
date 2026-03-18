# DESIGN AUDIT

## A — Current Visual Problems
- All styles hardcoded as inline React style props
- No design token system — hex codes scattered throughout
- No CSS classes, no SCSS modules
- Plain dark theme but lacks visual hierarchy
- No animations or micro-interactions
- No sparklines in screener table
- Charts are basic (no gradient fills, no area charts)
- Typography not consistent (mixing monospace and sans-serif ad hoc)

## B — Color Inventory
- Background dark: #060d18, #09131f, #0d1e30
- Border: #132030, #1e3a52
- Text primary: #e8f4f8
- Text muted: #6b8aad, #a8c8e8
- Accent/Link: #457B9D
- Positive/Green: #2A9D8F
- Warning/Amber: #E9C46A
- Danger/Red: #E76F51, #d62828

## C — Typography Inventory
- Body font: DM Sans (loaded from Google Fonts via <link> in JSX)
- Mono font: DM Mono (loaded from Google Fonts)
- Sizes: 9px–28px scattered inline
- No consistent type scale

## D — Chart Inventory
- BarChart: Tier distribution, HHI histogram, flags, financials
- ScatterChart: Risk map (HHI vs Float)
- PieChart: Owner composition
- BarChart (horizontal): Top owners
- BarChart (small): Price history in detail panel
- All charts use basic dark theme via contentStyle props
- No gradient fills, no AreaChart usage
