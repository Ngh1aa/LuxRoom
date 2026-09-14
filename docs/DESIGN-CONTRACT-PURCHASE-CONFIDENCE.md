# LuxRoom — Purchase Confidence Design Contract Addendum

**Date:** 2026-09-14  
**Project mode:** interactive prototype / portfolio case  
**Responsive scope:** `responsive_all`, with desktop-first composition priority  
**Repository:** `Ngh1aa/LuxRoom`  
**Factory skill lock:** `Ngh1aa/uiux-ai-workspace@221370ef294408f3f5a0c6a7fb0567c3db840c3e`  
**Authority:** user explicitly authorized implementation and commit to `main`.

This addendum extends the existing `docs/DESIGN-CONTRACT.md` for the high-consideration furniture journey. Existing brand tokens, accessibility rules, IA, commerce data and routes remain authoritative unless this file explicitly tightens the purchase-confidence behavior.

## 1. Strategic product frame

LuxRoom is not being repositioned as a generic ecommerce template. Its role is a flagship luxury furniture / interior-commerce case that demonstrates how editorial inspiration and purchase confidence can coexist.

**Primary user problem hypothesis:** furniture shoppers need inspiration early, but uncertainty shifts toward footprint, access, finish, material, timing, delivery and room fit as commitment increases.

**Business objective:** increase qualified movement from inspiration into product evaluation, save/compare behavior, checkout or consultation without flattening the brand into a conversion-first catalogue.

**Primary behavior:** room inspiration → category → product → configure finish → evaluate dimensions → compare → save room → understand delivery → checkout or consultation.

**Evidence state:** `EVIDENCE-BACKED HYPOTHESIS`, not validated user research. Official competitor patterns repeatedly expose dimensions, finishes, technical documents, CAD/configuration, care and professional/dealer support at or near the decision stage. This supports the problem framing but does not prove LuxRoom-specific user behavior.

## 2. Research synthesis — official production references

Research date: 2026-09-14. References are used for information architecture and decision-support patterns only; visual copying is prohibited.

### Cassina
Reference examples:
- https://www.cassina.com/ww/en/products/product-page.sengu-sofa.html
- https://www.cassina.com/ww/en/products/ottomane-durable.html

Observed pattern:
- product storytelling coexists with product sheets, care/maintenance, finishes and professional 2D/3D files;
- designer attribution is treated as product meaning, not metadata debris;
- downloadable depth serves both buyers and professional specifiers.

**ADOPT:** progressive disclosure from emotional story to technical evidence.  
**ADAPT:** LuxRoom downloads are clearly labelled prototype specification files rather than pretending production CAD exists.  
**REJECT:** copying Cassina visual composition or proprietary product language.

### Minotti
Reference examples:
- https://www.minotti.com/en/daniels
- https://www.minotti.com/en/vivienne-seating-system

Observed pattern:
- modular systems are documented by configuration and dimension;
- 2D/3D downloadable files make product families usable for interior planning;
- materials and collection context remain part of the product story.

**ADOPT:** product-family reasoning and dimension-first decision evidence.  
**ADAPT:** LuxRoom uses lightweight plan/elevation drawings generated from its existing product dimensions.  
**REJECT:** implying architectural accuracy or professional CAD deliverables.

### Poliform
Reference pattern from current official product pages:
- designer attribution, technical sheets/downloads, finishes and configuration are tightly linked to product evaluation;
- product detail behaves as both inspiration and specification surface.

**ADOPT:** finish/material selection stays adjacent to specification evidence.  
**ADAPT:** simple finish variants using the existing LuxRoom data model.  
**REJECT:** high-complexity real configurator logic outside this prototype scope.

### Molteni&C
Reference pattern from current official product pages:
- editorial product story is followed by technical details, designer identity, finishes and downloadable professional material;
- product families are represented as systems, not isolated cards.

**ADOPT:** designer/collection/product-family context.  
**ADAPT:** `LuxRoom Studio` is used truthfully as prototype authorship for invented portfolio products.  
**REJECT:** invented external designer names or unsupported manufacturing claims.

### B&B Italia
Reference examples:
- https://www.bebitalia.com/it-it/arredamento-design/it-bend-sofa-divani.html
- https://www.bebitalia.com/it-it/it-ray-divani.html

Observed pattern:
- configuration, technical information, dimensions/downloads, colors/finishes and designer content form one decision system;
- professional resources are explicitly separated where appropriate.

**ADOPT:** calm matrix of dimensions, finish and technical evidence.  
**ADAPT:** LuxRoom compare makes cross-product trade-offs visible before consultation.  
**REJECT:** forcing users to create an account to access prototype spec information.

### Vitra
Reference pattern from current official sofa/product-family pages:
- product-family context, CAD/product information and sustainability/logistics documents extend confidence beyond appearance;
- documentation supports long-lived ownership decisions.

**ADOPT:** treat delivery/care/warranty as product evidence rather than checkout-only detail.  
**ADAPT:** LuxRoom surfaces delivery timing and care in PDP and compare.  
**REJECT:** unsupported sustainability certification or carbon-footprint claims.

## 3. Redesign delta contract

The upgrade must be visibly structural. It is not complete if the change is only color, typography, image swap, shadow, radius or decorative motion.

### Existing strengths preserved
- image-led editorial Home;
- architectural neutral token system;
- 17-product catalogue with dimensions, finishes and lead-time data;
- room-aware Collection filters;
- PDP gallery, finish selection, destination-aware arrival, care and delivery content;
- wishlist/cart/checkout foundation;
- reduced-motion-aware interaction system.

### Structural deltas
1. **Decision Workbench** connects Home and Collection to Fit, Compare and Saved Room.
2. **PDP intelligence layer** adds designer, collection, capacity, spec code, explicit download and consultation.
3. **Technical drawing layer** turns existing dimensions into a calm elevation/plan reference labelled prototype/not-for-construction.
4. **Will It Fit?** converts room + access dimensions into bounded guidance.
5. **Compare** becomes a dedicated 2–3 product decision surface, not an overlay of generic cards.
6. **Saved Room** keeps room, measurements, products and finish preference in one truthful browser-only workspace.
7. **Cross-page journey continuity** exposes Compare and Saved Room from navigation and product surfaces.

## 4. Art direction contract

**Concept:** architecture magazine × luxury furniture catalogue.

- Imagery owns roughly 65–75% of inspiration/discovery surfaces where relevant.
- Technical pages can become more information-dense; image dominance must not obstruct decision evidence.
- Serif display type is used for chapter-level editorial statements, not every label.
- UI labels, measurements, controls and technical metadata use DM Sans.
- Palette stays paper / canvas / ink / clay / stone; no generic luxury black-gold treatment.
- Hairlines, whitespace and alignment create technical calm.
- No endless card grid. Product grids may exist for browsing; downstream decision surfaces use editorial bands, matrices and alternating room compositions.
- Motion is restrained and must honor `prefers-reduced-motion`.
- No glassmorphism, decorative gradients or faux 3D product configurator.

## 5. Interaction grammar

- **Default:** quiet ink/stone labels with clear boundaries.
- **Hover:** subtle text/accent shift, no dramatic scaling.
- **Focus-visible:** use the existing semantic focus token; keyboard action cannot depend on hover.
- **Selected:** clay/accent indication plus text/state change; not color-only.
- **Disabled:** readable state with explicit `aria-disabled` where applicable.
- **Error/uncertain:** fit guidance uses explicit copy + semantic border, not icon/color alone.
- **Success:** “Likely fits” remains guidance, not guarantee.
- **Reduced motion:** no essential information is encoded in animation.

## 6. Signature feature reasoning

### A. Will It Fit?

**User uncertainty**  
“Will this piece physically work in my room and can it plausibly enter through the doorway?”

**Business objective**  
Reduce low-quality purchase intent and redirect complex cases to consultation before checkout.

**Options considered**
1. static measurement tips only;
2. pseudo-AR / room planner;
3. bounded room + doorway prototype check;
4. hard architectural pass/fail.

**Trade-off**  
Static tips are safe but low-value. Pseudo-AR is visually impressive but dishonest without spatial sensing/calibration. Hard pass/fail overclaims. A bounded numeric check adds useful reasoning while preserving uncertainty.

**Selected solution**  
Inputs: room width, room depth, narrowest doorway, desired clearance.  
Outputs:
- `Likely fits`
- `Check doorway clearance`
- `Needs confirmation`

The algorithm checks footprint in two orientations and uses a simplified access reference. It explicitly excludes stairs, turns, lifts, packaging, disassembly and site conditions.

**Success signal**  
Users can state why the fit guidance is positive/uncertain and identify when consultation is required.

**Validation**  
`PLANNED VALIDATION` — Task 2.

### B. Product Compare

**User uncertainty**  
“Which sofa is more appropriate once appearance is not enough?”

**Business objective**  
Keep evaluation inside LuxRoom and move comparison toward decision evidence rather than tab switching or memory.

**Options considered**
1. compare drawer;
2. large modal;
3. dedicated decision page;
4. unlimited spreadsheet-like comparison.

**Trade-off**  
A drawer/modal preserves browse context but compresses furniture detail. Unlimited compare becomes a spec spreadsheet and weakens editorial clarity.

**Selected solution**  
Dedicated page; 2–3 products; rows for dimensions, material, finish, seating capacity, lead time, delivery, care and prototype warranty guidance.

**Success signal**  
User can explain at least one material trade-off between two options without reopening each PDP.

**Validation**  
`PLANNED VALIDATION` — Task 3.

### C. Saved Room

**User uncertainty**  
“How do I keep products, chosen finishes and room constraints together across a considered purchase?”

**Business objective**  
Support return visits and create a higher-context handoff into consultation.

**Options considered**
1. wishlist only;
2. authenticated project workspace;
3. local browser prototype;
4. fake cloud save.

**Trade-off**  
Wishlist lacks room context. Real account sync needs backend scope. Fake cloud persistence is misleading.

**Selected solution**  
`localStorage` state with explicit copy: “Saved locally / no account sync.” Stores room, basic measurements, products and selected finish variant.

**Success signal**  
User can return to one room workspace and continue from saved evidence without assuming account-level persistence.

**Validation**  
`PLANNED VALIDATION` — Tasks 1, 4 and 6.

### D. PDP technical/spec layer

**User uncertainty**  
“Do I have enough concrete information to move from liking the product to specifying it?”

**Business objective**  
Make the PDP useful for both direct purchase and consultation intent.

**Options considered**
1. lifestyle gallery + price only;
2. dense technical catalogue;
3. editorial story followed by layered specification.

**Trade-off**  
Lifestyle-only is weak for high-consideration furniture; catalogue-only loses brand expression.

**Selected solution**  
Hero/angles → key decision facts → finish → delivery → dimensions/technical drawing → materials/care → fit tool → designer/family → related room context. Download is a generated **prototype specification**, not fake CAD.

**Success signal**  
User can identify dimensions, finish/material, lead time, delivery and the next safe action.

**Validation**  
`PLANNED VALIDATION` — Tasks 4 and 5.

### E. Delivery confidence

**User uncertainty**  
“When will it arrive and what kind of delivery does a large piece require?”

**Business objective**  
Reduce late checkout surprises and steer oversized/complex delivery into supported service.

**Options considered**
1. hide until checkout;
2. single global shipping claim;
3. destination-aware estimate on PDP plus compare/context.

**Selected solution**  
Preserve current destination-aware arrival estimate; surface lead time and delivery type in comparison and saved-room/consultation context.

**Success signal**  
User can identify whether a product is in stock/made to order, approximate lead time and whether room delivery is relevant.

**Validation**  
`PLANNED VALIDATION` — Task 5.

## 7. IA and core journey

```text
Home / Room inspiration
├── Collection
│   ├── category / room / constraint filters
│   └── Product Detail
│       ├── finish selection
│       ├── dimensions + technical drawing
│       ├── Will It Fit?
│       ├── Compare
│       ├── Saved Room
│       ├── delivery / lead time
│       ├── spec download (prototype)
│       └── consultation
├── Compare
├── Saved Room
│   └── consultation handoff
├── Cart
└── Checkout
```

Core journey:
`Room inspiration → category → product → finish → dimensions/fit → compare → saved room → delivery confidence → checkout / consultation`.

Recovery paths:
- no fit confidence → consultation;
- compare full at 3 → remove one before adding;
- no saved products → return to collection;
- browser storage cleared → state is truthfully lost, no false cloud recovery claim.

## 8. Responsive contract

Scope is `responsive_all`; desktop is art-direction priority.

### Desktop
- wide editorial sequencing and split compositions;
- compare matrix may display all 3 products at once;
- Saved Room uses alternating image/copy bands;
- Will It Fit? uses 2-column intro/tool structure.

### Tablet
- compress without turning every section into identical cards;
- compare remains horizontally legible;
- technical information remains grouped by decision object.

### Mobile
- editorial sections stack intentionally;
- compare matrix scrolls horizontally instead of crushing columns;
- Saved Room alternates collapse into image → copy;
- fit inputs become one column;
- navigation exposes Compare/Saved Room in the mobile menu;
- no critical interaction requires hover.

## 9. Truthfulness contract

The following must remain explicit:

- Will It Fit? = prototype guidance only, not architectural or delivery guarantee.
- Technical drawing = prototype/not for construction.
- Specification download = prototype specification.
- Saved Room = localStorage/browser-only, no backend/account sync.
- Warranty rows = prototype policy guidance; confirm before purchase.
- `LuxRoom Studio` = prototype authorship for this portfolio product set.
- Human usability findings = not claimed until real sessions occur.
- Automated QA proves implementation/runtime properties, not comprehension or conversion uplift.

## 10. PLANNED VALIDATION

No real participant test is available in this execution. All tasks below are **PLANNED VALIDATION**, not completed research.

| Task | Scenario | Success criterion | Evidence state |
|---|---|---|---|
| 1 | Find a sofa for a living room | participant reaches a relevant sofa using room/category reasoning and can name why it is relevant | PLANNED VALIDATION |
| 2 | Determine whether it fits | participant enters room/access data, interprets the guidance and can identify its limitation | PLANNED VALIDATION |
| 3 | Compare two products | participant can state at least one dimensional/material/timing trade-off | PLANNED VALIDATION |
| 4 | Determine finish/material | participant can locate selected finish and material without guessing | PLANNED VALIDATION |
| 5 | Understand delivery/lead time | participant can identify timing and delivery mode from PDP/Compare | PLANNED VALIDATION |
| 6 | Save or begin consultation | participant can save the room or hand it into consultation and understands browser-only persistence | PLANNED VALIDATION |

Recommended real test: 5–7 moderated sessions with people who have recently considered a sofa or large furniture purchase, followed by design iteration. Participant count is a recommendation only, not a completed study.

## 11. Success measurement plan

No baseline analytics are available in the repo, so no uplift is claimed.

Candidate observable signals for a future instrumented product:
- PDP → fit-tool engagement;
- fit-tool → consultation after uncertain result;
- compare creation/completion;
- saved-room creation and revisit;
- finish selection before add-to-cart;
- delivery-detail interaction;
- qualified checkout/consultation starts;
- reduction in support questions about dimensions/access/lead time.

## 12. Factory gate mapping

### Research / UX / art direction
`DONE_VERIFIED` for source/code audit, official reference research, product framing, IA and design contract.

### Structural implementation
Owner: implementation phase. Must include the signature features and maintain existing commerce functionality.

### Rendered QA
Owner: cloud browser QA. Required representative roles:
- Home
- Collection
- PDP + Will It Fit? state
- Compare
- Saved Room
plus shared header/footer sanity across existing routes.

### Human usability
Owner: future validation phase. Status: `PENDING_FUTURE_PHASE`, method defined above.

### Release
User authorized commit to `main`. GitHub Actions/cloud-render evidence is required before claiming Final QA PASS.
