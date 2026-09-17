Run all commands from the repo root. There's a file called
RECONNECT_INSPECTION_BOOKING.md — read it in full. Before writing code,
check src/services/api.ts for the actual current signatures of
initializePayment and createInspection, since the example in the file is
illustrative, not exact.

Priority 1 (removing the silent error swallow) — do that regardless of
how Priority 0 turns out, it's wrong on its own.

For the "note" at the bottom about whether this should be instant-escrow
vs. a separate checkout step — stop and ask Shuddy rather than picking one.

After: cd web_app && npx eslint . && npx next build

Then do a real manual test: book an inspection end to end with a real
buyer account, and paste me the actual created inspection record —
confirm it has a real escrowTransactionId and that the tracker page shown
matches the real inspection, not a hardcoded ID.
