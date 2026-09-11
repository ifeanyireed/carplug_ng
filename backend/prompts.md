A few things to get right in the implementation, since your JWT is stored in localStorage (per your existing rentals-full setup):

Reissue the token on role change. The old JWT still has role: "buyer" baked into its claims, so any middleware checking req.user.role will reject seller actions until the token is refreshed. The backend needs to issue a new signed token on this PATCH, and the frontend needs to overwrite the stored token immediately with the response — don't wait for a page reload.
Protect the endpoint properly. PATCH /api/auth/role should only accept {"role": "seller"} from an authenticated request matching the token's own user id — never let it take an arbitrary user id or accept "admin"/other privileged roles from the client.
Make it idempotent. If a seller hits the endpoint again, just return 200 with their current state rather than erroring.
Guard the listing wizard's Publish step with a check for role === 'seller', and if a buyer somehow reaches it, redirect to the upgrade flow rather than 403ing them cold.
