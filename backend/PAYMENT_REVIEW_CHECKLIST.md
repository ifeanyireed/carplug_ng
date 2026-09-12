# Payment Integrity Review Checklist (Carplug / Verza)

Standing checklist — reusable for the life of the project, not tied to one
fix pass. Run this against **any** change that touches money: wallet
balances, transactions, escrow, payouts, subscriptions, ad campaigns,
inspection fees. Doesn't matter whether the change came from Antigravity,
Claude, or hand-written — the questions are the same.

How to use it: after any payment-adjacent commit, paste this file to
whoever's reviewing (agent or human) with: "check the new code against
every item below, and for each one, tell me exactly which lines make it
true — not just yes/no."

---

## 1. Is this even payment-adjacent?

A change is in scope for this checklist if it touches any of:

- A `models.Transaction` row (create, update, status change)
- A wallet balance calculation
- Anything that changes a user's role, verification status, or access in a
  way that affects what payment actions they can take
- An escrow, subscription, or payout record
- Anything that could indirectly gate whether money moves (e.g. who's
  allowed to submit an inspection report, since that currently triggers a
  payout-eligible credit)

If none of the above apply, this checklist doesn't apply. If any do,
answer every question below — don't skip ahead to "looks fine."

---

## 2. For every credit, where's the matching debit?

The single most important question, and the one that's been missed twice
in this project already. Whenever code credits a wallet, marks a
transaction `"settled"`, or increases something a user can cash out:

- **Is there a specific, existing, verified transaction it's releasing
  money _from_?** Not "the system generally has money," but a specific
  row, looked up by ID, checked for the right status.
- **Does the credited amount come from that real transaction, or is it a
  hardcoded/derived number the code just decided to use?** A flat fee
  table is fine for _initial_ pricing (see PAYMENTS_FIXES.md's
  `InitializePayment` price validation) — it is never fine for _releasing_
  money, which must always trace back to an amount someone actually paid.
- **Is it possible to trigger this credit path more than once for the same
  underlying event?** (Submit the same report twice, retry a webhook,
  double-click a button) — if so, is there an idempotency check (e.g. "has
  this escrow already been released") or will it double-credit?

If the answer to "where's the matching debit" is "there isn't one, this
just creates new value" — stop, that's the bug class from
`INSPECTION_EARNINGS_FIX.md`. Do not proceed without linking it to a real,
existing, status-checked transaction.

---

## 3. Is the amount ever trusted from the client?

- Search the diff for anywhere a `float`/`int64` amount comes from
  `c.ShouldBindJSON` (or equivalent) and flows into a transaction, wallet
  update, or payout — without being checked against a server-side price
  table or an existing transaction's amount.
- This applies even to internal calls that "should" only ever be called
  with the right value — assume any endpoint will eventually be called
  directly, with any payload, by someone who read the source code.

---

## 4. Are multi-row money changes atomic?

- If a single action needs to change more than one row (e.g. mark an
  escrow `"settled"` _and_ create a technician's earning; update a
  transaction _and_ update a subscription's expiry), are both writes
  inside a single `db.Transaction(func(tx *gorm.DB) error { ... })` block?
- If not wrapped together: what happens if the server crashes, or the
  second write fails, between the two? Is that outcome (partial state)
  something you'd be OK finding out about after the fact, or does it need
  to roll back together?

---

## 5. Are errors from these writes actually checked?

- Search specifically for `_ = db.Create(...)`, `_ = db.Save(...)`,
  `_ = db.Model(...).Updates(...)` anywhere in a payment-adjacent path.
  Discarding the error means the API can report success while the actual
  financial write silently failed.
- At minimum: log it clearly (`log.Printf("[CRITICAL] ...")`) so it's
  discoverable. Better: surface it in the response or flag the record for
  manual reconciliation, rather than pretending nothing happened.

---

## 6. Who can actually trigger this, and does the code check it?

- Route-level: does `routes.go` restrict this endpoint with
  `middleware.RequireRoles(...)` to the roles that should be able to call
  it at all?
- Handler-level: beyond role, does it check that _this specific user_ is
  the rightful party for _this specific record_ — the buyer who owns this
  escrow, the technician assigned to this inspection, the dealer who owns
  this subscription? Role alone ("any technician") is not the same as
  ownership ("the technician assigned to this job").
- Specifically ask: **does obtaining this role require any real
  verification, or is it self-service (like the 1-click role upgrade)?**
  If a role is free and instant to obtain, any endpoint gated only by that
  role — with no further ownership/verification check — is reachable by
  anyone with an email address.

---

## 7. Manual test, every time

A clean `go build` / `go vet` is necessary, not sufficient, for anything on
this list. Before marking a payment-adjacent change done:

- Create two real accounts (or reuse test ones) representing both sides of
  the money movement (e.g. buyer + technician, or dealer + admin).
- Walk the actual flow end to end with real API calls.
- Paste the actual transaction records/JSON responses at each step — not
  a description of what should have happened, the real output.
- Specifically try the "wrong" path once: submit without a valid escrow,
  request a payout larger than balance, call the credit-triggering
  endpoint twice — confirm each is rejected, not silently allowed.

---

## Quick reference: how this checklist would have caught past issues

- `RequestPayout` self-settling (caught by #2 — no real debit backing it)
- `HandleWebhook` with no signature check (caught by #6 — anyone could
  trigger a `"settled"` status change)
- `InitializePayment` trusting client amounts (caught by #3)
- Inspection earnings fabricated with no escrow link (caught by #2 and #6
  together — free role, no ownership/verification check, no real debit)
