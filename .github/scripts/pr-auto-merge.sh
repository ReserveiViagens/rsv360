#!/usr/bin/env bash
# Merge PR when eligible (label auto-merge + checks green).
# Alternative to GitHub native auto-merge on private repos (Free plan).
set -euo pipefail

PR_NUMBER="${1:-}"
if [ -z "$PR_NUMBER" ]; then
  echo "[SKIP] PR number required"
  exit 0
fi

AUTO_MERGE_LABEL="auto-merge"
DEPENDABOT_LABEL="auto-merge-dependabot"

json="$(gh pr view "$PR_NUMBER" --json state,mergeable,mergeStateStatus,isDraft,labels,author,baseRefName,title,statusCheckRollup)"

state="$(echo "$json" | jq -r '.state')"
base="$(echo "$json" | jq -r '.baseRefName')"
draft="$(echo "$json" | jq -r '.isDraft')"
mergeable="$(echo "$json" | jq -r '.mergeable')"
merge_state="$(echo "$json" | jq -r '.mergeStateStatus')"
author="$(echo "$json" | jq -r '.author.login')"
title="$(echo "$json" | jq -r '.title')"

if [ "$state" != "OPEN" ]; then
  echo "[SKIP] PR #$PR_NUMBER is not open ($state)"
  exit 0
fi

if [ "$base" != "main" ]; then
  echo "[SKIP] PR #$PR_NUMBER targets $base (only main)"
  exit 0
fi

if [ "$draft" = "true" ]; then
  echo "[SKIP] PR #$PR_NUMBER is draft"
  exit 0
fi

if [[ "$author" == *"cursor"* ]]; then
  echo "[SKIP] PR #$PR_NUMBER author $author blocked by policy"
  exit 0
fi

labels="$(echo "$json" | jq -r '.labels[].name' | tr '\n' ' ')"
has_auto_merge="false"
has_dependabot_auto="false"
if echo " $labels " | grep -q " $AUTO_MERGE_LABEL "; then
  has_auto_merge="true"
fi
if echo " $labels " | grep -q " $DEPENDABOT_LABEL "; then
  has_dependabot_auto="true"
fi

if [ "$author" = "dependabot[bot]" ] && [ "$has_dependabot_auto" = "true" ]; then
  echo "[OK] Dependabot PR with $DEPENDABOT_LABEL"
elif [ "$has_auto_merge" = "true" ]; then
  echo "[OK] PR has label $AUTO_MERGE_LABEL"
else
  echo "[SKIP] PR #$PR_NUMBER missing label $AUTO_MERGE_LABEL (or $DEPENDABOT_LABEL for dependabot)"
  exit 0
fi

if [ "$mergeable" != "MERGEABLE" ]; then
  echo "[SKIP] PR #$PR_NUMBER not mergeable ($mergeable)"
  exit 0
fi

if [ "$merge_state" = "BLOCKED" ] || [ "$merge_state" = "DIRTY" ]; then
  echo "[SKIP] PR #$PR_NUMBER merge state $merge_state"
  exit 0
fi

check_count="$(echo "$json" | jq '.statusCheckRollup | length')"
if [ "$check_count" -gt 0 ]; then
  bad="$(echo "$json" | jq '[.statusCheckRollup[] | select(.status != "COMPLETED" or (.conclusion != null and .conclusion != "SUCCESS" and .conclusion != "SKIPPED" and .conclusion != "NEUTRAL"))] | length')"
  if [ "$bad" -gt 0 ]; then
    echo "[SKIP] PR #$PR_NUMBER has pending or failed checks ($bad)"
    exit 0
  fi
fi

echo "[MERGE] PR #$PR_NUMBER — $title"
gh pr merge "$PR_NUMBER" --merge --delete-branch
echo "[DONE] PR #$PR_NUMBER merged"
