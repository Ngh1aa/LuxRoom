# Senior commerce product-depth upgrade

## Goal

Move LuxRoom beyond a polished furniture storefront into a decision-support prototype that demonstrates senior product-design judgement across PDP → Bag → Checkout.

This work follows the current UIUX Factory ecommerce contract: reduce purchase uncertainty, preserve decision continuity, make costs/availability/recovery legible, and avoid dark patterns or invented evidence.

## Product decisions

### PDP — room readiness, not artificial urgency

Furniture purchase risk is often spatial and logistical. The PDP therefore adds two voluntary checks:

- room dimensions reviewed against the product;
- delivery path / doorway / stair / lift constraints considered.

The checks are local-only and **never block Add to cart**. They are decision support, not a conversion trick.

### Bag — surface practical risk before checkout

The Bag summarises real data already owned by the prototype:

- oversized objects;
- made-to-order objects;
- slowest lead-time signal;
- current destination and delivery surcharge.

It does not invent stock or scarcity.

### Checkout — preserve progress and explain recovery

Checkout now:

- stores a non-sensitive draft locally;
- explicitly excludes card name/number/expiry/CVC from persistence;
- exposes Contact / Delivery / Payment / Review readiness;
- provides an aggregate recovery action for invalid required fields;
- warns when an oversized above-ground delivery has no confirmed lift and no access note.

## Evidence boundary

These additions are prototype behaviour. They are not evidence of improved conversion, reduced returns, or validated customer preference. Those outcomes remain `UNKNOWN` until real-user/product analytics exist.

## Acceptance criteria

1. Existing visual identity and commerce architecture remain intact.
2. PDP purchase readiness is visible but non-blocking.
3. Bag risk summary derives only from existing product/delivery truth.
4. Checkout draft never persists sensitive card fields.
5. Invalid checkout has a clear recovery path.
6. Oversized delivery risk is surfaced before order recording.
7. Mobile layout remains usable.
8. `npm run qa` includes the senior-commerce regression contract.
