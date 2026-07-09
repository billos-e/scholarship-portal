---
name: Admin action latency and stale-refetch race in scholarship portal
description: Why admin status/notes updates on request detail page felt slow and could show flip-flopping/incorrect state; the optimistic-update fix.
---

Admin actions (status transitions, admin notes, payment notes) on the request detail page used a "write-then-refetch" pattern: submit the server action, then bump a `refreshKey` state to trigger a brand-new `fetchRequest(id)` in a `useEffect`. This meant every single click required two sequential network round trips before the UI reflected anything, and — because the refetch effect had no request sequencing/cancellation — if an admin fired a second action before the first refetch resolved, the two GETs could resolve out of order and the *older* response could overwrite the newer state, making the UI appear to revert or "flip-flop" between statuses.

**Fix applied:** server actions (`transitionRequestStatus`, `updateRequestAdminNotes`, `updatePaymentInternalNotes`) now echo back the field(s) they just wrote in their `RequestActionState` result. The calling components pass that data straight to `onSuccess`, and the parent page merges it directly into local React state instead of triggering a refetch. This cuts each action down to a single round trip and removes the race entirely, since there's no second async fetch that can arrive out of order.

**How to apply:** for any future "write action + reflect result in UI" pattern in this app, prefer having the mutation echo back the new value and merging it into local state directly, rather than a `refreshKey`-triggered full refetch. Reserve full refetches for cases where the server may compute derived fields the client can't know in advance.
