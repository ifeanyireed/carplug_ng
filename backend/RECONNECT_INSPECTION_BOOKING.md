# Carplug (Verza) — Reconnect Inspection Booking Flow (frontend)

The backend now correctly requires a funded escrow transaction before an
inspection can be created (see INSPECTION_EARNINGS_FIX.md, already done).
This file is the frontend side of that same change — the booking flow
needs to actually create that escrow payment before dispatching, and the
button needs to stop silently swallowing errors.

Verify after:

```bash
cd web_app && npx eslint . && npx next build
```

---

## Priority 0 — Add the missing payment step before dispatch

`src/app/buyer/inspections/book/[vehicleId]/technicians/DispatchButton.tsx`
currently calls `createInspection` with no escrow transaction at all. It
needs to call `initializePayment` first, get back the transaction ID, then
pass that into `createInspection`.

Check `src/services/api.ts` for the existing `initializePayment` function
signature (it should already exist and match the backend's
`InitializePayment` — the payments work from `PAYMENTS_FIXES.md` already
added the price-tier validation, so the amount sent here must match one of
the server's fixed prices for `inspection_escrow`: ₦25,000 / ₦45,000 /
₦75,000, matching the `tier` prop already passed into this component).

```tsx
const handleDispatch = async () => {
  setIsDispatching(true);
  try {
    const token = getAuthToken();
    if (!token) {
      router.push(
        `/auth/login?redirect=/buyer/inspections/book/${vehicleId}/technicians?tier=${tier}`,
      );
      return;
    }

    let tierLabel = "Premium Diagnostic";
    let tierAmount = 45000;
    if (tier.toLowerCase() === "standard") {
      tierLabel = "Standard";
      tierAmount = 25000;
    } else if (tier.toLowerCase() === "comprehensive") {
      tierLabel = "Comprehensive";
      tierAmount = 75000;
    }

    // Step 1: create the escrow payment
    const payment = await initializePayment({
      type: "inspection_escrow",
      amount: tierAmount,
      entityId: vehicleId,
      title: `${tierLabel} Inspection Escrow`,
    });

    if (!payment?.transaction?.id) {
      throw new Error("Failed to initialize inspection payment");
    }

    // Step 2: create the inspection, linked to that escrow
    const created = await createInspection({
      vehicleId,
      technicianId,
      inspectionTier: tierLabel as "Standard" | "Premium" | "Comprehensive",
      status: "requested",
      escrowTransactionId: payment.transaction.id,
      scheduledDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    });

    if (created?.id) {
      router.push(`/buyer/inspections/${created.id}/tracker`);
    } else {
      throw new Error("Inspection creation returned no ID");
    }
  } catch (err) {
    // See Priority 1 — do not silently redirect on failure.
  } finally {
    setIsDispatching(false);
  }
};
```

Adjust field names to whatever `initializePayment`'s actual return shape
and `createInspection`'s actual param type are in `api.ts` — check both
before assuming this matches exactly. If `initializePayment` in this repo
is currently only wired for Paystack-style checkout redirects (not an
instant in-app "pay and continue" flow), that's a bigger product question
— see the note at the bottom.

## Priority 1 — Stop silently swallowing errors

Remove the current catch block's fallback redirect to a hardcoded fake
tracker page. A failed booking should tell the user it failed, not show
them a fake success:

```tsx
} catch (err) {
  console.error("Inspection dispatch failed:", err);
  setDispatchError(
    err instanceof Error ? err.message : "Unable to book this inspection. Please try again."
  );
}
```

Add a `dispatchError` state and render it near the button so the user sees
a real error message instead of a silent redirect. This applies regardless
of whether Priority 0's payment step is wired correctly yet — masking
errors with a fake-success redirect is wrong on its own, independent of
this specific bug.

## Note: this may be a bigger product question than a quick fix

Whether inspection payment should be an instant "escrow now, technician
dispatched immediately after" flow (what the fix above assumes), or a
separate checkout step with its own confirmation page before returning to
technician selection, is a real UX decision, not just a wiring detail.
Flag this back to Shuddy before assuming the quick inline version above is
the right shape — it might be, but it's worth a deliberate call rather
than inferring it from the existing button's structure.

---

## Definition of done

- [ ] Booking flow creates a real escrow transaction before calling
      `createInspection`
- [ ] The escrow amount sent matches one of the server's fixed price tiers
      exactly
- [ ] Failed bookings show a real error, never a silent redirect to a fake
      tracker page
- [ ] Manual test: book an inspection end-to-end as a real buyer account,
      confirm the created inspection has a real `escrowTransactionId` and
      the tracker page shown is for the actual created inspection, not
      `insp-001`
- [ ] `npx eslint .` / `npx next build` clean
