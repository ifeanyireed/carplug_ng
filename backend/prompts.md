[read BACKEND_FIXES.md in full before making any changes.

Priority 0 is the main event: role/ownership enforcement isn't wired up
despite the auth infrastructure being fully built. Work through it in
order, and after Priority 0, actually run the manual two-account test
described in 0.4 (register a buyer and a seller, create a vehicle as the
seller, try to edit/delete it with the buyer's token) and paste me the
actual HTTP response — don't just tell me the code looks right.

After each priority section, run:

cd backend && go build ./... && go vet ./...
cd ../web_app && npx eslint . && npx next build

Rules:

- Priority 1.1: when fixing the isMounted pattern in Navbar.tsx, check what
  it's actually guarding before changing it — it may be a legitimate
  SSR-hydration guard, not a data-fetch race condition like the other five
  files. Don't apply the same fix blindly to all six.
- Don't touch anything under "Do NOT do yet."

Give me a short summary after each priority section: what changed, file
list, and anything you weren't sure about. and update the backend/documentations/md]
