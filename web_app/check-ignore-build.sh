#!/usr/bin/env bash

# Vercel Ignored Build Step Script
# Exit code 0 = Vercel CANCELS / SKIPS build
# Exit code 1 = Vercel PROCEEDS with build

echo "==> Vercel Ignored Build Step Check"
echo "==> Branch: ${VERCEL_GIT_COMMIT_REF:-unknown}"

# 1. Do not auto-redeploy commits from the 'dev' branch
if [ "$VERCEL_GIT_COMMIT_REF" = "dev" ]; then
  echo "🛑 Skipping build: Auto-redeploy is disabled for the 'dev' branch."
  exit 0
fi

# 2. Skip build if commit message contains [skip ci] or [skip vercel]
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" =~ "\[skip ci\]" ]] || [[ "$VERCEL_GIT_COMMIT_MESSAGE" =~ "\[skip vercel\]" ]]; then
  echo "🛑 Skipping build: Commit message contains skip flag."
  exit 0
fi

# 3. Allow build to proceed for main and other branches
echo "✅ Build proceeding for branch: ${VERCEL_GIT_COMMIT_REF:-unknown}"
exit 1
