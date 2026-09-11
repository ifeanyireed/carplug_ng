read backend/Payment fixes.md in full before making any changes.

Priority 0 is the reason this file exists. Do not suggest or wire a real
Paystack key anywhere while working through it. After 0.1-0.4, walk me
through a manual test: create a technician account, simulate escrow
transactions settling, call /api/payments/payout for more than the
computed balance, and confirm it's rejected with 400 — paste the actual
response.

After each section, run:

cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build

Don't touch anything under "Do NOT do yet."
