# REDESIGN PLAN

## Design Token System
CSS variables in _tokens.scss:
- Background: #0A0B0D (base), #111318 (surface), #1A1D23 (elevated)
- Brand accent: #00C805
- Bull: #00C805, Bear: #FF3B30, Neutral: #8E8E93
- Text: primary #F5F5F7, secondary #8E8E93, muted #3A3A3C
- Typography: Inter (body), JetBrains Mono (numbers)
- Spacing scale: 4/8/12/16/24/32/48/64px
- Border radius: sm 4px, md 8px, lg 12px, xl 16px
- Transitions: fast 0.15s, normal 0.25s, slow 0.4s

## Component Redesign List
1. App shell: Dark #0A0B0D background, Inter font
2. Header/Navbar: 56px sticky, logo left, title center, search right
3. KPI StatCards: Elevated surface, mono numbers, delta indicators
4. Tab Navigation: Clean underline tabs with transition
5. Screener Table: Sticky header, sparkline column, row animations
6. Stock Detail Panel: Price history AreaChart with gradient
7. Charts: Dark-themed, accent colors, gradient fills

## Animation Plan
- Page entrance: fade + slide-up 0.3s
- Table rows: stagger slide-in (max 500ms total)
- Hover: lift cards (translateY -2px), fade rows (opacity)
- Number counter: animate from 0 to value
- Skeleton loaders: shimmer gradient
- Chart entrance: scale-Y from 0 to 1
