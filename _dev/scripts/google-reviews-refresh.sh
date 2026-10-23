#!/bin/bash
# Every-two-months refresh of the Google reviews on be-tango.be, run by launchd
# (~/Library/LaunchAgents/be.be-tango.google-reviews.plist; log in
# ~/Library/Logs/be-tango-google-reviews.log).
#
#   1. fresh detached worktree of origin/main — never Sven's checkout, which
#      may be on another branch or behind
#   2. _dev/scripts/google-reviews.js --write
#   3. nothing changed -> stop; otherwise branch, PR, and merge when the script
#      says it is safe. Merging to main is publishing: Cloudflare Pages deploys it.
#   4. confirm the live page shows the new count
#
# Anything unexpected — a failed step, a rating below 5.0, a count that went
# down, a deploy that never shows up — leaves the PR unmerged and opens a
# GitHub issue, which mails Sven. A silent failure here would mean the site
# quietly stops updating, which is the exact chore this job exists to remove.
#
#   google-reviews-refresh.sh            # the real run
#   google-reviews-refresh.sh --check    # credentials, gh, git push access; changes nothing
#   google-reviews-refresh.sh --pr-only  # open the PR but leave merging to a person
#
# Only HTML changes, so no ?v= cache key is involved: pages are not cached
# immutably, assets are.
set -euo pipefail
export PATH=/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin

REPO="$HOME/Sites/BE-TANGO WEBSITE/be-tango-rebuild"
ENV_FILE="$HOME/Sites/seo-audits/.env"
GH_REPO=breynsv/be-tango-website
SITE=https://www.be-tango.be

log() { echo "[$(date '+%F %T')] $*"; }
issue() {
  gh issue create --repo "$GH_REPO" --title "Google reviews refresh needs a look ($(date +%F))" --body "$1" >/dev/null || true
  log "opened an issue: $(echo "$1" | head -1)"
}
WT=""
cleanup() { [ -n "$WT" ] && git -C "$REPO" worktree remove --force "$WT" 2>/dev/null || true; }
trap cleanup EXIT
trap 'issue "The scheduled reviews refresh failed at line $LINENO. Log: ~/Library/Logs/be-tango-google-reviews.log"; exit 1' ERR

[ -f "$ENV_FILE" ] || { issue "DataForSEO credentials not found at $ENV_FILE"; exit 1; }
set -a; . "$ENV_FILE"; set +a

git -C "$REPO" fetch -q origin

if [ "${1:-}" = "--check" ]; then
  trap - ERR
  ok=1
  gh auth status >/dev/null 2>&1 && log "gh: authenticated" || { log "gh: NOT authenticated"; ok=0; }
  git -C "$REPO" push --dry-run origin origin/main:refs/heads/reviews-access-check >/dev/null 2>&1 && log "git push: allowed" || { log "git push: REFUSED"; ok=0; }
  [ -n "${DATAFORSEO_LOGIN:-}" ] && log "DataForSEO: credentials loaded" || { log "DataForSEO: credentials MISSING"; ok=0; }
  [ "$ok" = 1 ] && log "check passed" || { log "check FAILED"; exit 1; }
  exit 0
fi

WT="$(mktemp -d)/site"
git -C "$REPO" worktree add -q --detach "$WT" origin/main
cd "$WT"

out="$(node _dev/scripts/google-reviews.js --write)"
echo "$out"
summary="$(echo "$out" | tail -1)"
field() { echo "$summary" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const v=JSON.parse(s)['$1'];console.log(typeof v==='object'?JSON.stringify(v):v)})"; }

if git diff --quiet; then
  log "nothing to change"
  exit 0
fi

new_count="$(field newCount)"
branch="chore/google-reviews-$(date +%F)"
git switch -q -c "$branch"
git commit -qam "chore(reviews): newest Google reviews and count ($(field oldCount) -> $new_count)

Scheduled refresh by _dev/scripts/google-reviews-refresh.sh.
$(echo "$out" | sed '$d')"
git push -q -u origin "$branch"
pr="$(gh pr create --repo "$GH_REPO" --base main --head "$branch" \
  --title "Google reviews refresh $(date +%F): count $(field oldCount) -> $new_count" \
  --body "Scheduled every two months. Only 5-star reviews with text that do not name the instructors.

\`\`\`
$out
\`\`\`")"
log "opened $pr"

if [ "${1:-}" = "--pr-only" ]; then
  log "--pr-only: leaving $pr for a person to merge"
  exit 0
fi

if [ "$(field safe)" != "true" ]; then
  issue "The scheduled reviews refresh found something a person should check before publishing, so $pr was NOT merged.

$(echo "$out" | grep '^PROBLEM' || true)"
  exit 0
fi

gh pr merge "$pr" --repo "$GH_REPO" --merge --delete-branch
log "merged $pr"

# Pages builds in about a minute. Check the page, never a versioned asset URL.
for _ in $(seq 1 40); do
  if curl -fsS "$SITE/en/?refresh=$RANDOM" | grep -q "Based on <strong>$new_count reviews</strong>"; then
    log "live: $SITE/en/ shows $new_count reviews"
    exit 0
  fi
  sleep 15
done
issue "$pr was merged but $SITE/en/ still does not show $new_count reviews after 10 minutes. Check the Cloudflare Pages build."
