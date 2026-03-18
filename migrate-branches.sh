#!/bin/bash
# ================================================================
# migrate-branches.sh
# Promotes v2/next-js-db to main and rebases all copilot branches.
#
# Prerequisites:
#   - Git access with push rights to origin
#   - Run from the repository root
#   - All local changes committed
#
# Usage:
#   chmod +x migrate-branches.sh
#   ./migrate-branches.sh
#
# This script implements the full migration plan from MIGRATION_SUMMARY.md
# ================================================================

set -euo pipefail

REPO_DIR="$(git rev-parse --show-toplevel)"
cd "$REPO_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_ok()   { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_fail() { echo -e "${RED}❌ $1${NC}"; }

# ============================================================
# PHASE 0 — PREFLIGHT
# ============================================================
echo "============================================================"
echo "PHASE 0 — PREFLIGHT CHECKS"
echo "============================================================"

git fetch --all --prune
log_ok "Fetched all remote branches"

MAIN_HASH=$(git rev-parse origin/main)
V2_HASH=$(git rev-parse origin/v2/next-js-db)
echo "  origin/main:          $MAIN_HASH"
echo "  origin/v2/next-js-db: $V2_HASH"

if [ "$MAIN_HASH" = "$V2_HASH" ]; then
    log_warn "main already points to v2/next-js-db — checking if rebases are still needed"
fi

# ============================================================
# PHASE 1 — BACKUP OLD MAIN
# ============================================================
echo ""
echo "============================================================"
echo "PHASE 1 — BACKUP OLD MAIN"
echo "============================================================"

if git ls-remote --heads origin backup/main-before-v2 | grep -q "backup/main-before-v2"; then
    BACKUP_HASH=$(git rev-parse origin/backup/main-before-v2)
    log_warn "backup/main-before-v2 already exists on remote at $BACKUP_HASH"
    if [ "$BACKUP_HASH" != "$MAIN_HASH" ] && [ "$MAIN_HASH" != "$V2_HASH" ]; then
        log_fail "Backup hash ($BACKUP_HASH) does not match old main ($MAIN_HASH). Manual check needed."
        exit 1
    fi
else
    git checkout -B backup/main-before-v2 origin/main
    git push origin backup/main-before-v2
    git ls-remote --heads origin backup/main-before-v2 | grep -q "backup/main-before-v2" || {
        log_fail "Failed to verify backup/main-before-v2 on remote"
        exit 1
    }
    log_ok "backup/main-before-v2 pushed and verified"
fi

BACKUP_HASH=$(git rev-parse origin/backup/main-before-v2 2>/dev/null || git rev-parse backup/main-before-v2)
echo "  Backup: backup/main-before-v2 = $BACKUP_HASH"

# ============================================================
# PHASE 2 — PROMOTE v2/next-js-db TO MAIN
# ============================================================
echo ""
echo "============================================================"
echo "PHASE 2 — PROMOTE v2/next-js-db TO MAIN"
echo "============================================================"

git checkout -B main origin/v2/next-js-db
DIFF=$(git diff main origin/v2/next-js-db)
if [ -n "$DIFF" ]; then
    log_fail "main does not match v2/next-js-db after reset"
    exit 1
fi
log_ok "Local main reset to v2/next-js-db (diff is empty)"

git push origin main --force-with-lease
log_ok "Pushed new main to remote"

git fetch origin
DIFF=$(git diff origin/main origin/v2/next-js-db)
if [ -n "$DIFF" ]; then
    log_fail "Remote main does not match origin/v2/next-js-db"
    exit 1
fi
log_ok "Remote main verified == origin/v2/next-js-db"

git branch --set-upstream-to=origin/main main
log_ok "Upstream tracking set for main"

# ============================================================
# PHASE 3 — REBASE ALL COPILOT BRANCHES
# ============================================================
echo ""
echo "============================================================"
echo "PHASE 3 — REBASE ALL COPILOT BRANCHES"
echo "============================================================"

BRANCHES=(
    "copilot/add-pwa-capabilities-nextjs"
    "copilot/build-onboarding-tour"
    "copilot/create-financial-information-hub"
    "copilot/deploy-branch-in-vercel"
    "copilot/fix-owner-section-display"
    "copilot/fix-ui-layout-mobile-devices"
    "copilot/install-vercel-speed-insights"
    "copilot/prepare-codebase-for-vercel-deployment"
    "copilot/push-this-branch"
    "copilot/redesign-jkse-stock-screener-dashboard"
    "copilot/resolve-merge-conflicts"
    "copilot/set-git-user-config"
    "copilot/vscode-mmhthxg7-qvfh"
)

REBASE_SUCCESSES=()
REBASE_FAILURES=()

rebase_branch() {
    local BRANCH=$1
    echo ""
    echo "  --- Processing: $BRANCH ---"

    git checkout -B "$BRANCH" "origin/$BRANCH" 2>&1 || {
        log_fail "Could not checkout $BRANCH"
        REBASE_FAILURES+=("$BRANCH")
        return 1
    }

    git rebase main 2>&1 || true

    local MAX_ITER=100
    local ITER=0
    while git status 2>/dev/null | grep -q "rebase in progress"; do
        ITER=$((ITER+1))
        [ $ITER -gt $MAX_ITER ] && {
            log_fail "Max iterations reached for $BRANCH — aborting"
            git rebase --abort 2>&1
            REBASE_FAILURES+=("$BRANCH")
            return 2
        }

        local CONFLICTED
        CONFLICTED=$(git diff --name-only --diff-filter=U 2>/dev/null)

        if [ -z "$CONFLICTED" ]; then
            GIT_EDITOR=true git rebase --continue 2>&1 || true
            continue
        fi

        echo "    Conflicts: $CONFLICTED"
        for f in $CONFLICTED; do
            # Keep v2/next-js-db (ours/base) for shared files
            if git show HEAD:"$f" >/dev/null 2>&1; then
                git checkout --ours "$f" 2>&1
            else
                # File only exists in branch, keep it
                git checkout --theirs "$f" 2>&1 || git rm --ignore-unmatch "$f" 2>&1
            fi
            git add "$f" 2>&1
        done

        GIT_EDITOR=true git rebase --continue 2>&1 || true
    done

    local UNIQUE
    UNIQUE=$(git log --oneline main.."$BRANCH" 2>/dev/null | wc -l)
    local BEHIND
    BEHIND=$(git rev-list --count "$BRANCH"..main 2>/dev/null)

    if [ "$BEHIND" -eq 0 ]; then
        log_ok "$BRANCH rebased. Unique commits: $UNIQUE, Behind main: 0"
        REBASE_SUCCESSES+=("$BRANCH")
        git push origin "$BRANCH" --force-with-lease 2>&1 || {
            log_warn "Could not push $BRANCH (may need manual push)"
        }
    else
        log_fail "$BRANCH is $BEHIND commits behind main after rebase"
        REBASE_FAILURES+=("$BRANCH")
    fi
}

for BRANCH in "${BRANCHES[@]}"; do
    rebase_branch "$BRANCH" || true
done

# ============================================================
# PHASE 4 — FINAL VERIFICATION
# ============================================================
echo ""
echo "============================================================"
echo "PHASE 4 — FINAL VERIFICATION"
echo "============================================================"

git fetch --all --prune

echo ""
echo "=== Branch status ==="
for BRANCH in "${BRANCHES[@]}"; do
    BEHIND=$(git rev-list --count "origin/$BRANCH"..origin/main 2>/dev/null || echo "unknown")
    AHEAD=$(git rev-list --count origin/main.."origin/$BRANCH" 2>/dev/null || echo "unknown")
    echo "  origin/$BRANCH: ahead=$AHEAD behind=$BEHIND"
done

echo ""
echo "=== main == v2/next-js-db ==="
DIFF=$(git diff origin/main origin/v2/next-js-db 2>/dev/null)
if [ -z "$DIFF" ]; then
    log_ok "origin/main == origin/v2/next-js-db (empty diff)"
else
    log_fail "origin/main != origin/v2/next-js-db — check required"
fi

echo ""
echo "=== backup intact ==="
BACKUP_REMOTE=$(git rev-parse origin/backup/main-before-v2 2>/dev/null || echo "MISSING")
if [ "$BACKUP_REMOTE" != "MISSING" ]; then
    log_ok "backup/main-before-v2 exists on remote at $BACKUP_REMOTE"
else
    log_fail "backup/main-before-v2 NOT found on remote!"
fi

echo ""
echo "============================================================"
echo "SUMMARY"
echo "============================================================"
echo "Rebased successfully: ${#REBASE_SUCCESSES[@]}"
echo "  ${REBASE_SUCCESSES[*]:-none}"
echo ""
echo "Rebased with failures: ${#REBASE_FAILURES[@]}"
if [ ${#REBASE_FAILURES[@]} -gt 0 ]; then
    echo "  ${REBASE_FAILURES[*]}"
    log_warn "Manual resolution needed for failed branches. See CONFLICT_LOG.md."
fi

echo ""
echo "=== Manual step required ==="
echo "Go to: https://github.com/StudentGlitch/Right-to-Information/settings/branches"
echo "Confirm default branch is set to 'main' (not 'v2/next-js-db')"

echo ""
log_ok "Migration complete. See MIGRATION_SUMMARY.md for full details."
