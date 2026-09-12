# Image Asset Audit (do this BEFORE any Cloudinary migration)

Goal of this pass: produce a report, make zero changes to any file. This is
purely an audit — don't upload anything, don't edit any source file, don't
delete anything yet. That comes later, only after Shuddy reviews the report.

## Step 1 — List what's actually on disk

```bash
find web_app/public/images -type f | sort > /tmp/images_on_disk.txt
wc -l /tmp/images_on_disk.txt
```

## Step 2 — Find every image reference in source code

Search across all the places an image path could appear: JSX `src`
attributes, `next/image` `src` props, CSS `background-image`, and any
string built dynamically (e.g. `` `/images/cars/${id}.jpg` ``).

```bash
grep -rEn '["'\''`]/images/[a-zA-Z0-9_./\-]+' web_app/src --include="*.tsx" --include="*.ts" --include="*.css" \
  | grep -oE '/images/[a-zA-Z0-9_./\-]+' | sort -u > /tmp/images_referenced_static.txt
```

This catches static/literal paths. It will **miss** dynamically-built paths
like the example above — those need a manual look. Search separately for
template-literal patterns:

```bash
grep -rn '\`/images/' web_app/src --include="*.tsx" --include="*.ts"
```

List every match found this way by hand in the report — these are the ones
a simple find-and-replace would silently break later, so they need to be
called out explicitly, not just counted.

## Step 3 — Cross-reference

```bash
comm -23 /tmp/images_on_disk.txt <(sed 's#^#web_app/public#' /tmp/images_referenced_static.txt | sort) \
  > /tmp/images_possibly_unused.txt
wc -l /tmp/images_possibly_unused.txt
```

This is an approximation, not a guarantee — an image only reached via a
dynamic path (Step 2's second search) will show up here as "possibly
unused" even though it's actually in use. Cross-check the dynamic-path list
from Step 2 against this output before calling anything unused.

## Step 4 — Produce the report

Write a short markdown summary (don't create it as a code file, just give it
directly in your response) with:

- Total images on disk, total size (`du -sh`)
- Count and total size of images referenced only via a dynamic path
  pattern (call these out by file and pattern, not just a count)
- Count and approximate size of images that appear genuinely unreferenced
  anywhere (candidates for deletion, pending Shuddy's confirmation — do
  NOT delete them in this pass)
- Which of `web_app/public/fonts` vs `web_app/src/fonts` is actually
  imported (check `web_app/src/app/**/fonts.ts` or wherever fonts are
  configured) and confirm the other is safe to delete

## What NOT to do in this pass

- Do not upload anything to Cloudinary yet
- Do not delete any file yet, even ones that look clearly unused
- Do not modify any `src` attribute or import path yet

Once Shuddy has reviewed the report and confirmed what's safe to remove or
migrate, that becomes a separate, second task with its own explicit scope.
