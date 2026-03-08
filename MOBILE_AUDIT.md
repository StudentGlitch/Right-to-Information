# MOBILE AUDIT REPORT

**Repository:** StudentGlitch/Right-to-Information  
**Audited:** App.jsx (single-file React app, inline styles only)  
**Tech Stack:** React 18, Vite, Recharts, plain inline styles (no CSS framework); mobile fixes introduce a `<style>` block via JSX for responsive media queries  
**Routing:** None (single-page, tab-based navigation)

---

## OVERFLOW

| Location | Description | Root Cause |
|---|---|---|
| `App.jsx` root `<div>` | No `overflow-x: hidden` on root wrapper — any overflowing child causes page-level horizontal scroll | Missing root overflow guard |
| `App.jsx` search `<input>` | Fixed `width: 260` in inline style — on 320 px screen this is 81 % of viewport, pushing sibling elements off-screen | Hard-coded pixel width |
| `App.jsx` Tab Nav `<div>` | 6 tab buttons with `padding: "12px 18px"` and no wrapping, no scroll — total ~440 px minimum width vs 320 px screen | No overflow scroll or wrapping on the tab container |
| `App.jsx` Overview grid | `gridTemplateColumns: "1fr 1fr"` — two equal columns force each column to ~136 px on 320 px screens, breaking nested chart and card content | Fixed two-column grid with no mobile breakpoint |
| `App.jsx` Risk Map tab | `display: "flex", gap: 20` side-by-side layout for chart + detail panel — combined width overflows on narrow screens | Flex row with no wrapping |
| `App.jsx` Screener (Table) tab | `display: "flex", gap: 20` side-by-side layout for table + detail panel — same issue as Risk Map | Flex row with no wrapping |
| `App.jsx` Screener table | Wide data table with 12 columns and `whiteSpace: "nowrap"` cells — minimum content width far exceeds any phone screen | Table column overflow (expected, but needs `overflow-x: auto` wrapper) |
| `App.jsx` Owners table | Wide table with 5 columns including a wide portfolio-exposure column | Table column overflow |
| `App.jsx` header padding | `padding: "20px 28px 16px"` — 56 px total horizontal padding on a 320 px screen leaves only 264 px for content | Excessive fixed padding on small screens |
| `App.jsx` content area | `padding: "20px 28px"` — same 56 px horizontal consumption | Excessive fixed padding on small screens |
| `App.jsx` Tab Nav | `paddingLeft: 28` shifts first tab inward, compounding overflow | Fixed left padding |

---

## NAV

| Location | Description |
|---|---|
| `App.jsx` Tab Nav | Horizontal tab bar with 6 items (`Overview`, `Risk Map`, `HHI Distribution`, `Flags`, `Screener`, `Owners`) — no mobile adaptation. On screens < 768 px the tabs overflow off-screen with no way to access hidden tabs. |
| `App.jsx` Tab Nav | No hamburger / bottom bar / collapsed menu for mobile. |
| `App.jsx` Tab Nav | Tap targets: `padding: "12px 18px"` gives adequate height (~40 px) but HHI Distribution label makes the button ~140 px wide on desktop — fine on desktop, unusable when hidden off-screen on mobile. |
| `App.jsx` Tab Nav | No active-state indicator visible when nav items are off-screen on mobile. |

---

## SPACING

| Location | Description |
|---|---|
| Header | `padding: "20px 28px 16px"` — 28 px side padding is too large for 320 px screens |
| Content area | `padding: "20px 28px"` — same issue |
| Tab Nav | `paddingLeft: 28` — pushes first tab right by 28 px, compounding the overflow |
| KPI card items | `padding: "14px 18px"` — 18 px side padding per card, fine individually but causes dense layout on small screens |
| Section cards | `padding: 20` — 20 px on all sides fine at md+ but tight on xs when combined with outer content padding |
| Preset buttons | `gap: 8, padding: "5px 12px"` — acceptable but filter row wraps awkwardly on narrow screens |

---

## TEXT

| Location | Description |
|---|---|
| KPI card labels | `fontSize: 9` — below 14 px minimum; unreadable without zooming on mobile |
| Various sub-labels | `fontSize: 10` throughout (e.g., chart hints, pill badges, table column headers) — below 14 px minimum |
| Header sub-title | `fontSize: 11` — borderline; readable but small |
| Table cells | `fontSize: 11` — small for mobile scrollable tables |
| Tooltip labels | `fontSize: 9` — below minimum |
| Flag definitions | `fontSize: 10` — below minimum |
| Various `letterSpacing: 2` labels | `fontSize: 11` — very small and letter-spaced, unreadable on mobile without zoom |
| Font sizes use raw `px` values | Guidelines require `rem`, `em`, or `clamp()` — all font sizes are hard-coded in `px` |
