— read REMAINING_FIXES.md in full before making any changes.

Another agent session is working through PAYMENTS_FIXES.md separately —
don't touch anything Paystack/payment-related, and if you notice overlap
with that file, skip it rather than duplicate the work.

Work through Priority 0-2 fully. For Priority 3 and 4, stop after reading
them and just confirm back to me what you'd do — don't rewrite git history
or touch image/font files without me explicitly saying go ahead on those
two specifically.

After each section you do complete work on, run:

cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build

Give me a short summary after each section.

Run all commands from the repo root (the folder containing both
backend/ and web_app/), not from inside backend/ or web_app/ —
even though this file may be sitting inside a subfolder.
