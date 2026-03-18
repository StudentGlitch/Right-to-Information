# Branch Audit Report
**Generated:** 2026-03-18  
**Repository:** StudentGlitch/Right-to-Information  
**Audit Purpose:** Promote `v2/next-js-db` to `main`, rebase all other branches onto it

---

## Summary

| Branch | Last Commit | Ahead v2/next-js-db | Behind v2/next-js-db | Predicted Conflicts |
|--------|-------------|---------------------|----------------------|---------------------|
| `main` | `043c948` Merge pull request #14 | 38 | 5 | No common ancestor |
| `v2/next-js-db` | `336c21f` Merge pull request #11 | — | — | N/A (new main) |
| `copilot/add-pwa-capabilities-nextjs` | `4abda5e` Add PWA support | 17 | 5 | No common ancestor |
| `copilot/build-onboarding-tour` | `eee8ad9` feat: add onboarding tour | 11 | 5 | No common ancestor |
| `copilot/create-financial-information-hub` | `839edb9` Initial plan | 2 | 5 | No common ancestor |
| `copilot/deploy-branch-in-vercel` | `b20db17` Add Vercel config | 7 | 5 | No common ancestor |
| `copilot/fix-owner-section-display` | `3b47619` Show detailed owner info | 27 | 5 | No common ancestor |
| `copilot/fix-ui-layout-mobile-devices` | `4d9c0b3` feat: mobile-responsive UI | 20 | 5 | No common ancestor |
| `copilot/install-vercel-speed-insights` | `2e0e23c` Install @vercel/speed-insights | 14 | 5 | No common ancestor |
| `copilot/prepare-codebase-for-vercel-deployment` | `c7a6a79` feat: add full Vercel config | 8 | 5 | No common ancestor |
| `copilot/push-this-branch` | `a613545` Initial plan | 0 | 1 | ✅ Clean (is ancestor) |
| `copilot/redesign-jkse-stock-screener-dashboard` | `9dd117e` Visual redesign | 34 | 5 | No common ancestor |
| `copilot/resolve-merge-conflicts` | `095e303` docs: integrate Git user config | 37 | 5 | No common ancestor |
| `copilot/set-git-user-config` | `36dec04` Add Git user config instructions | 5 | 5 | No common ancestor |
| `copilot/vscode-mmhthxg7-qvfh` | `9901c4f` Merge PR #12 | 8 | 5 | No common ancestor |
| `copilot/make-v2-next-js-db-main` | `83698f3` Initial plan | — | — | This branch (skip) |

---

## History Analysis

### `main` history (old codebase — Vite/React)
```
043c948  Merge pull request #14 from StudentGlitch/copilot/resolve-merge-conflicts
095e303  docs: integrate Git user config section from PR #2 into README
e2308eb  Initial plan
f9d2557  Merge pull request #10 from StudentGlitch/copilot/redesign-jkse-stock-screener-dashboard
9dd117e  Visual redesign: Robinhood-inspired dark theme with SCSS Modules, design tokens, sparklines, and animations
```

### `v2/next-js-db` history (new codebase — Next.js)
```
336c21f  Merge pull request #11 from StudentGlitch/copilot/push-this-branch
a613545  Initial plan
6bf33e6  v2
2519b19  migraate to next
1aabf7f  Initial commit from Create Next App
```

### Key Observation
`main` and `v2/next-js-db` have **completely unrelated histories** (no common ancestor).  
All `copilot/*` branches are based on the old Vite/React codebase (`main`).  
The `v2/next-js-db` branch is a fresh Next.js codebase.

---

## Conflict Risk Assessment

| Branch | Risk Level | Reason |
|--------|-----------|--------|
| `copilot/push-this-branch` | ✅ None | Is a direct ancestor of v2/next-js-db |
| `copilot/create-financial-information-hub` | ⚠️ Low | Only 2 commits ahead (1 "Initial plan") |
| `copilot/set-git-user-config` | ⚠️ Medium | README changes may conflict |
| `copilot/deploy-branch-in-vercel` | ⚠️ High | Vite-based Vercel config vs Next.js config |
| `copilot/install-vercel-speed-insights` | ⚠️ High | Vite/React App.jsx changes |
| `copilot/add-pwa-capabilities-nextjs` | ⚠️ High | Vite plugin changes vs Next.js setup |
| `copilot/build-onboarding-tour` | ⚠️ High | React component additions |
| `copilot/fix-owner-section-display` | ⚠️ High | React component changes |
| `copilot/fix-ui-layout-mobile-devices` | ⚠️ High | CSS/React layout changes |
| `copilot/prepare-codebase-for-vercel-deployment` | ⚠️ High | Config file changes |
| `copilot/redesign-jkse-stock-screener-dashboard` | ⚠️ High | Comprehensive visual redesign |
| `copilot/resolve-merge-conflicts` | ⚠️ High | Many file changes |
| `copilot/vscode-mmhthxg7-qvfh` | ⚠️ High | Vite build changes |
| `main` | ⚠️ Backup only | Will become backup/main-before-v2 |

---

## Uncommitted Changes

None (all work is on remote branches).

---

## Migration Plan

1. **Phase 1**: Create `backup/main-before-v2` from current `main` (`043c948`)
2. **Phase 2**: Reset `main` to `v2/next-js-db` (`336c21f`), force push
3. **Phase 3**: Rebase each `copilot/*` branch onto new `main`
4. **Phase 4**: Update CI/CD configs, generate MIGRATION_SUMMARY.md

---

## Rollback Plan

If anything goes wrong:
```bash
git checkout main
git reset --hard backup/main-before-v2
git push origin main --force-with-lease
```
