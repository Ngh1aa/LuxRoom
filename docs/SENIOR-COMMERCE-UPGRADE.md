# Senior Commerce Upgrade — Product Decision & Recovery

This upgrade moves LuxRoom from a polished furniture-commerce exercise toward a product-design case that can be reviewed through decisions, edge states and truthful system boundaries.

## Product problem

Furniture purchase decisions have unusually high uncertainty: physical scale, access path, delivery timing, finish, service level and made-to-order constraints all affect confidence. The interface should reduce uncertainty before decoration or conversion pressure.

## Upgrade decisions

1. **PDP decision summary** — Fit, arrival and return-eligibility uncertainty are surfaced together before Add to Cart. Unknown return eligibility stays explicit instead of being invented.
2. **Cart recovery** — Removing an object offers Undo; objects can move to Saved Room without re-finding the product. Empty carts cannot continue to checkout by keyboard or pointer.
3. **Checkout truth boundary** — The static prototype no longer presents card or VNPay choices as if real processing exists. Checkout exposes only simulated COD / bank-transfer records and explains what the prototype does not do.
4. **Checkout continuity** — Contact, address, delivery and payment draft values persist locally until a local order is recorded. Invalid submission produces a visible alert and focuses recovery.
5. **Lifecycle evidence** — Normal, Empty, Loading, Error and Made-to-order Edge states are reviewable through `recruiter-state-lab.html` and verified through `uiux-state-coverage.json`.

## Evidence model

- Repository/runtime behavior: **VERIFIED** after target CI/rendered QA passes.
- Baymard PDP / checkout patterns: **REFERENCE EVIDENCE**, not user research.
- Conversion impact: **UNKNOWN** — no production analytics or participant study is claimed.
- Real payment, inventory, fulfilment and return eligibility: **NOT CONNECTED / UNKNOWN** where the prototype has no source of truth.

## Senior-level acceptance

The upgrade is not complete merely because the pages render. Acceptance requires:

- no body-level horizontal overflow at desktop/tablet/mobile;
- semantic state markers for non-normal lifecycle states;
- no fake payment-processing claim;
- empty-cart checkout prevention;
- recoverable cart removal;
- checkout draft continuity and invalid-state recovery;
- made-to-order uncertainty visible before order recording;
- no console/page errors in the Factory State Coverage gate.

## Research references

- Baymard, *Product Page UX 2026: 10 Pitfalls and Best Practices* — product scale, variation visibility and returns information.
- Baymard, *Checkout UX Best Practices* — recoverable errors, clear guest flow, optional/required clarity and delivery-date language.

These are benchmark references. They do not replace direct user validation; a moderated furniture-purchase study remains a future validation activity.
