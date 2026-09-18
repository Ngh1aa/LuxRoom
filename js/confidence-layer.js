/*
 * LuxRoom Purchase Confidence Layer — 2026-09-14
 * Structural commerce extension governed by the UIUX Factory design contract.
 * Prototype persistence is intentionally localStorage-only and labelled in the UI.
 */
(() => {
  const app = window.LuxRoom;
  if (!app?.products) return;

  if (!document.querySelector('link[href*="confidence-layer.css"]')) {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "css/confidence-layer.css?v=20260914-1";
    stylesheet.dataset.luxroomConfidence = "true";
    document.head.appendChild(stylesheet);
  }

  const STORAGE = {
    compare: "luxroom-compare",
    savedRoom: "luxroom-saved-room",
  };
  const MAX_COMPARE = 3;
  const DEFAULT_ROOM = {
    room: "Living",
    measurements: { width: "", depth: "", doorway: "", clearance: "60" },
    items: [],
    updatedAt: null,
  };

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function formatDimensions(product) {
    const d = product.dimensions || {};
    return `W ${d.width ?? "—"} × D ${d.depth ?? "—"} × H ${d.height ?? "—"} cm`;
  }

  function seatingCapacity(product) {
    if (product.category !== "Seating") return "Not applicable";
    if (product.dimensionType === "sofa") {
      if (Number(product.dimensions.width) >= 215) return "3–4 seats";
      if (Number(product.dimensions.width) >= 135) return "2 seats";
    }
    return "1 seat";
  }

  function warrantyGuidance(product) {
    if (product.category === "Lighting") {
      return "Prototype policy · 2 years electrical / finish";
    }
    if (product.materialGroup === "Textile") {
      return "Prototype policy · 5 years structural / 2 years upholstery";
    }
    return "Prototype policy · 5 years structural / 2 years finish";
  }

  app.products.forEach((product) => {
    product.designer = product.designer || "LuxRoom Studio";
    product.designerNote = product.designerNote || "Prototype product authorship for this portfolio case study.";
    product.seatingCapacity = product.seatingCapacity || seatingCapacity(product);
    product.warrantyGuidance = product.warrantyGuidance || warrantyGuidance(product);
    product.specCode = product.specCode || `LR-SPEC-${String(product.id).padStart(3, "0")}`;
    product.productFamily = product.productFamily || product.collection || "LuxRoom Collection";
  });

  function getCompareIds() {
    const ids = readJson(STORAGE.compare, [])
      .map(Number)
      .filter((id, index, all) => app.getProduct(id) && all.indexOf(id) === index);
    return ids.slice(0, MAX_COMPARE);
  }

  function setCompareIds(ids) {
    const clean = ids
      .map(Number)
      .filter((id, index, all) => app.getProduct(id) && all.indexOf(id) === index)
      .slice(0, MAX_COMPARE);
    writeJson(STORAGE.compare, clean);
    document.dispatchEvent(new CustomEvent("luxroom-compare-updated", { detail: clean }));
    return clean;
  }

  function isCompared(productId) {
    return getCompareIds().includes(Number(productId));
  }

  function toggleCompare(productId) {
    const id = Number(productId);
    const product = app.getProduct(id);
    if (!product) return getCompareIds();
    const ids = getCompareIds();
    if (ids.includes(id)) {
      const next = setCompareIds(ids.filter((item) => item !== id));
      app.showToast?.(`${product.name} removed from compare.`);
      return next;
    }
    if (ids.length >= MAX_COMPARE) {
      app.showToast?.("Compare is limited to three products. Remove one to add another.");
      return ids;
    }
    const next = setCompareIds([...ids, id]);
    app.showToast?.(`${product.name} added to compare.`);
    return next;
  }

  function normalizeSavedRoom(raw) {
    const room = raw && typeof raw === "object" ? raw : {};
    const measurements = room.measurements && typeof room.measurements === "object" ? room.measurements : {};
    const items = Array.isArray(room.items) ? room.items : [];
    return {
      room: room.room || DEFAULT_ROOM.room,
      measurements: {
        ...DEFAULT_ROOM.measurements,
        ...measurements,
      },
      items: items
        .map((item) => ({
          productId: Number(item.productId),
          variantId: String(item.variantId || ""),
          finish: String(item.finish || ""),
        }))
        .filter((item) => app.getProduct(item.productId)),
      updatedAt: room.updatedAt || null,
    };
  }

  function getSavedRoom() {
    return normalizeSavedRoom(readJson(STORAGE.savedRoom, DEFAULT_ROOM));
  }

  function persistSavedRoom(next) {
    const room = normalizeSavedRoom({ ...next, updatedAt: new Date().toISOString() });
    writeJson(STORAGE.savedRoom, room);
    document.dispatchEvent(new CustomEvent("luxroom-saved-room-updated", { detail: room }));
    return room;
  }

  function saveMeasurements(measurements, roomName) {
    const room = getSavedRoom();
    room.room = roomName || room.room;
    room.measurements = { ...room.measurements, ...measurements };
    const next = persistSavedRoom(room);
    app.showToast?.("Room measurements saved in this browser.");
    return next;
  }

  function saveRoomItem(productId, variantId = null) {
    const product = app.getProduct(Number(productId));
    if (!product) return getSavedRoom();
    const variant = app.getVariant(product, variantId);
    const room = getSavedRoom();
    const existing = room.items.find((item) => item.productId === product.id);
    const item = {
      productId: product.id,
      variantId: variant.variantId,
      finish: variant.finish,
    };
    if (existing) Object.assign(existing, item);
    else room.items.push(item);
    const next = persistSavedRoom(room);
    app.showToast?.(`${product.name} saved to ${next.room}.`);
    return next;
  }

  function removeRoomItem(productId) {
    const room = getSavedRoom();
    room.items = room.items.filter((item) => item.productId !== Number(productId));
    return persistSavedRoom(room);
  }

  function getFitGuidance(product, measurements) {
    const roomWidth = Number(measurements.width);
    const roomDepth = Number(measurements.depth);
    const doorway = Number(measurements.doorway);
    const clearance = Math.max(0, Number(measurements.clearance) || 0);
    const width = Number(product?.dimensions?.width);
    const depth = Number(product?.dimensions?.depth);
    const height = Number(product?.dimensions?.height);

    if (![roomWidth, roomDepth, doorway, width, depth, height].every((value) => Number.isFinite(value) && value > 0)) {
      return {
        status: "needs-input",
        label: "Enter room measurements",
        detail: "Add room width, depth and the narrowest doorway to get prototype guidance.",
      };
    }

    const footprintA = width + clearance * 2 <= roomWidth && depth + clearance * 2 <= roomDepth;
    const footprintB = depth + clearance * 2 <= roomWidth && width + clearance * 2 <= roomDepth;
    const roomFits = footprintA || footprintB;
    const accessReference = Math.min(depth, height);

    if (!roomFits || doorway < accessReference) {
      return {
        status: "confirm",
        label: "Needs confirmation",
        detail: !roomFits
          ? `The ${width} × ${depth} cm footprint plus ${clearance} cm clearance does not fit the entered room dimensions in either orientation.`
          : `The ${doorway} cm doorway is narrower than this prototype's ${accessReference} cm access reference.`,
      };
    }

    if (doorway < accessReference + 8) {
      return {
        status: "doorway",
        label: "Check doorway clearance",
        detail: `The room footprint works, but the ${doorway} cm doorway leaves little tolerance around the ${accessReference} cm access reference.`,
      };
    }

    return {
      status: "likely",
      label: "Likely fits",
      detail: `The footprint fits the entered room with ${clearance} cm desired clearance, and the doorway has prototype tolerance.`,
    };
  }

  function hasRoomMeasurements(room) {
    const measurements = room?.measurements || {};
    return ["width", "depth", "doorway"].every((key) => Number(measurements[key]) > 0);
  }

  function roomFitForProduct(product, room = getSavedRoom()) {
    if (!product || !hasRoomMeasurements(room)) return null;
    return getFitGuidance(product, room.measurements);
  }

  function returnabilityLabel(product) {
    return product.returnable
      ? "14-day return request"
      : "Made to order · confirm before production";
  }

  function roomDecisionSummary(room, entries) {
    const fits = entries.map(({ product }) => roomFitForProduct(product, room)).filter(Boolean);
    const likely = fits.filter((fit) => fit.status === "likely").length;
    const needsReview = fits.filter((fit) => fit.status === "doorway" || fit.status === "confirm").length;
    const longestLead = entries.reduce((max, { variant }) => Math.max(max, Number(variant?.leadTimeMax) || 0), 0);
    const total = entries.reduce((sum, { variant }) => sum + (Number(variant?.price) || 0), 0);
    return {
      fitLabel: !hasRoomMeasurements(room)
        ? "Measurements needed"
        : needsReview
          ? `${needsReview} access / fit check${needsReview === 1 ? "" : "s"}`
          : `${likely} likely fit${likely === 1 ? "" : "s"}`,
      fitTone: !hasRoomMeasurements(room) ? "pending" : needsReview ? "review" : "likely",
      longestLead: longestLead ? `Up to ${longestLead} days` : "Add a piece",
      total: app.formatMoney(total),
    };
  }

  function activeDetailVariant(product) {
    const finish = document.querySelector(".finish-option.active")?.dataset.finish;
    return product.variants.find((variant) => variant.finish === finish) || product.variants[0];
  }

  function injectPrimaryNavigation() {
    document.querySelectorAll(".main-nav").forEach((nav) => {
      if (!nav.querySelector('[data-confidence-nav="compare"]')) {
        const compare = document.createElement("a");
        compare.href = "compare.html";
        compare.dataset.confidenceNav = "compare";
        compare.className = "nav-confidence-link";
        compare.innerHTML = `Compare <span data-compare-count>${getCompareIds().length}</span>`;
        nav.append(compare);
      }
      if (!nav.querySelector('[data-confidence-nav="saved-room"]')) {
        const saved = document.createElement("a");
        saved.href = "saved-room.html";
        saved.dataset.confidenceNav = "saved-room";
        saved.className = "nav-confidence-link";
        saved.textContent = "Saved room";
        nav.append(saved);
      }
    });
  }

  function syncCompareUi() {
    const ids = getCompareIds();
    document.querySelectorAll("[data-compare-count]").forEach((node) => {
      node.textContent = String(ids.length);
    });
    document.querySelectorAll("[data-compare-product]").forEach((button) => {
      const selected = ids.includes(Number(button.dataset.compareProduct));
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
      const label = button.querySelector("[data-action-label]");
      if (label) label.textContent = selected ? "Compared" : "Compare";
    });
  }

  function enhanceHome() {
    const assurance = document.querySelector(".commerce-assurance");
    if (!assurance || document.querySelector(".decision-desk")) return;
    const section = document.createElement("section");
    section.className = "decision-desk home-section reveal";
    section.setAttribute("aria-labelledby", "decision-desk-title");
    section.innerHTML = `
      <div class="decision-desk__statement">
        <p class="object-index">05 / Decision workbench</p>
        <h2 id="decision-desk-title">Keep the room<br />in <em>view.</em></h2>
        <p>Inspiration starts the search. Confidence comes from fit, finish, access and a way to hold the options together.</p>
      </div>
      <div class="decision-desk__routes">
        <a href="detail.html?product=8#will-it-fit"><span>01 / Fit guidance</span><strong>Will it fit?</strong><small>Prototype room + doorway check</small><b aria-hidden="true">↗</b></a>
        <a href="compare.html"><span>02 / Decision evidence</span><strong>Compare products</strong><small>Dimensions, finish, lead time and care</small><b aria-hidden="true">↗</b></a>
        <a href="saved-room.html"><span>03 / Room memory</span><strong>Saved room</strong><small>Products, finishes + measurements in one place</small><b aria-hidden="true">↗</b></a>
      </div>`;
    assurance.after(section);
  }

  function productIdFromCard(card) {
    const link = card.querySelector('a[href*="detail.html?product="]');
    if (!link) return null;
    try {
      return Number(new URL(link.href, window.location.href).searchParams.get("product"));
    } catch {
      return null;
    }
  }

  function enhanceProductCards(root = document) {
    root.querySelectorAll(".product-card").forEach((card) => {
      if (card.dataset.confidenceEnhanced === "true") return;
      const id = productIdFromCard(card);
      const product = app.getProduct(id);
      const info = card.querySelector(".product-info-wrapper");
      if (!product || !info) return;
      card.dataset.confidenceEnhanced = "true";
      const actions = document.createElement("div");
      actions.className = "confidence-card-actions";
      actions.innerHTML = `
        <button type="button" data-compare-product="${product.id}" aria-pressed="${isCompared(product.id)}">
          <span data-action-label>${isCompared(product.id) ? "Compared" : "Compare"}</span>
        </button>
        <button type="button" data-save-room-product="${product.id}">Save to room</button>`;
      info.append(actions);
    });
    syncCompareUi();
  }

  function enhanceCollection() {
    const results = document.querySelector(".collection-results");
    if (!results || document.querySelector(".collection-workbench")) return;
    const strip = document.createElement("section");
    strip.className = "collection-workbench";
    strip.setAttribute("aria-label", "Purchase confidence tools");
    strip.innerHTML = `
      <p><span class="clay-point" aria-hidden="true"></span> Decision workbench</p>
      <a href="compare.html"><strong>Compare <span data-compare-count>${getCompareIds().length}</span>/3</strong><small>Dimensions · finish · lead time</small><span aria-hidden="true">↗</span></a>
      <a href="saved-room.html"><strong>Saved room</strong><small>Browser-only prototype state</small><span aria-hidden="true">↗</span></a>
      <a href="detail.html?product=8#will-it-fit"><strong>Will it fit?</strong><small>Room + doorway guidance</small><span aria-hidden="true">↗</span></a>`;
    results.before(strip);
    enhanceProductCards(document);
    let enhanceFrame = 0;
    const observer = new MutationObserver(() => {
      if (enhanceFrame) return;
      enhanceFrame = requestAnimationFrame(() => {
        enhanceFrame = 0;
        enhanceProductCards(document);
      });
    });
    const grid = document.querySelector("#product-grid");
    if (grid) observer.observe(grid, { childList: true, subtree: true });
  }

  function detailTechnicalDrawing(product) {
    const { width, depth, height } = product.dimensions;
    return `
      <figure class="technical-drawing" aria-labelledby="technical-drawing-title">
        <figcaption>
          <span class="object-index">Technical drawing / prototype</span>
          <strong id="technical-drawing-title">${escapeHtml(product.name)} · elevation + plan</strong>
          <small>Not for construction. Confirm final dimensions and delivery access before purchase.</small>
        </figcaption>
        <svg viewBox="0 0 820 360" role="img" aria-label="Prototype technical drawing for ${escapeHtml(product.name)}">
          <defs><marker id="lr-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M0 0 L8 4 L0 8 z"></path></marker></defs>
          <g class="drawing-object">
            <rect x="86" y="82" width="250" height="150" rx="3"></rect>
            <line x1="86" y1="232" x2="336" y2="232"></line>
            <rect x="486" y="82" width="250" height="150" rx="3"></rect>
          </g>
          <g class="drawing-measure">
            <line x1="86" y1="270" x2="336" y2="270" marker-start="url(#lr-arrow)" marker-end="url(#lr-arrow)"></line>
            <text x="211" y="295" text-anchor="middle">W ${width} cm</text>
            <line x1="58" y1="82" x2="58" y2="232" marker-start="url(#lr-arrow)" marker-end="url(#lr-arrow)"></line>
            <text x="36" y="160" text-anchor="middle" transform="rotate(-90 36 160)">H ${height} cm</text>
            <line x1="486" y1="270" x2="736" y2="270" marker-start="url(#lr-arrow)" marker-end="url(#lr-arrow)"></line>
            <text x="611" y="295" text-anchor="middle">W ${width} cm</text>
            <line x1="764" y1="82" x2="764" y2="232" marker-start="url(#lr-arrow)" marker-end="url(#lr-arrow)"></line>
            <text x="788" y="160" text-anchor="middle" transform="rotate(-90 788 160)">D ${depth} cm</text>
          </g>
          <text class="drawing-label" x="86" y="52">ELEVATION</text>
          <text class="drawing-label" x="486" y="52">PLAN</text>
        </svg>
      </figure>`;
  }

  function fitSection(product) {
    const saved = getSavedRoom();
    const m = saved.measurements;
    return `
      <section class="will-it-fit" id="will-it-fit" aria-labelledby="will-it-fit-title">
        <div class="will-it-fit__intro">
          <p class="object-index">Prototype guidance / room fit</p>
          <h2 id="will-it-fit-title">Will it<br /><em>fit?</em></h2>
          <p>Check footprint and the narrowest doorway before finish becomes the deciding factor.</p>
          <div class="fit-product-reference"><span>${formatDimensions(product)}</span><small>${escapeHtml(product.name)}</small></div>
        </div>
        <form class="fit-form" id="fit-form">
          <div class="fit-form__fields">
            <label>Room width <span>cm</span><input name="width" type="number" min="1" inputmode="decimal" value="${escapeHtml(m.width)}" placeholder="e.g. 420" required /></label>
            <label>Room depth <span>cm</span><input name="depth" type="number" min="1" inputmode="decimal" value="${escapeHtml(m.depth)}" placeholder="e.g. 360" required /></label>
            <label>Narrowest doorway <span>cm</span><input name="doorway" type="number" min="1" inputmode="decimal" value="${escapeHtml(m.doorway)}" placeholder="e.g. 88" required /></label>
            <label>Desired clearance <span>cm</span><input name="clearance" type="number" min="0" inputmode="decimal" value="${escapeHtml(m.clearance)}" placeholder="60" required /></label>
          </div>
          <div class="fit-form__actions">
            <button class="primary-button" type="submit">Check fit guidance <span aria-hidden="true">↗</span></button>
            <button class="text-action" type="button" data-save-fit-measurements>Save measurements to room</button>
          </div>
          <output class="fit-result" id="fit-result" aria-live="polite">
            <span class="fit-result__status">Enter measurements</span>
            <strong>Prototype guidance only</strong>
            <p>This does not evaluate stairs, turns, lifts, packaging, disassembly or site conditions.</p>
          </output>
          <p class="prototype-disclaimer">Prototype guidance only — not an architectural or delivery guarantee. For narrow access or complex routes, request confirmation from the room team.</p>
        </form>
      </section>`;
  }

  function detailDesignerStory(product) {
    return `
      <section class="designer-note" aria-labelledby="designer-note-title">
        <div class="designer-note__index"><span class="object-index">Design authorship</span><strong>${escapeHtml(product.designer)}</strong></div>
        <div><h2 id="designer-note-title">${escapeHtml(product.productFamily)}<br /><em>by LuxRoom Studio.</em></h2><p>${escapeHtml(product.designerNote)} The product story stays connected to practical evidence: proportion, material, finish and how the object enters the room.</p></div>
        <a class="text-link" href="products.html?collection=${encodeURIComponent(product.collection)}">Explore the collection <span aria-hidden="true">↗</span></a>
      </section>`;
  }

  function buildSpecText(product, variant) {
    const care = (product.care || []).map((item) => `- ${item}`).join("\n");
    return [
      "LUXROOM — PROTOTYPE PRODUCT SPECIFICATION",
      "Portfolio case study / not a construction document",
      "",
      `Product: ${product.name}`,
      `Spec code: ${product.specCode}`,
      `Designer: ${product.designer}`,
      `Collection: ${product.collection}`,
      `Dimensions: ${formatDimensions(product)}`,
      `Finish: ${variant.finish}`,
      `Material: ${variant.material}`,
      `Seating capacity: ${product.seatingCapacity}`,
      `Lead time: ${variant.leadTimeMin}–${variant.leadTimeMax} days`,
      `Delivery: ${product.deliveryType}`,
      `Warranty: ${product.warrantyGuidance}`,
      "",
      "CARE",
      care,
      "",
      "IMPORTANT",
      "Confirm final dimensions, finish availability, delivery access and policy with the LuxRoom room team before purchase.",
    ].join("\n");
  }

  function downloadSpec(product) {
    const variant = activeDetailVariant(product);
    const blob = new Blob([buildSpecText(product, variant)], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${product.slug}-prototype-spec.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function enhanceDetail() {
    if (!document.body.classList.contains("detail-page")) return;
    const id = Number(new URLSearchParams(window.location.search).get("product")) || app.products[0].id;
    const product = app.getProduct(id) || app.products[0];
    const description = document.querySelector(".di-desc");
    if (description && !document.querySelector(".pdp-intelligence")) {
      const intelligence = document.createElement("dl");
      intelligence.className = "pdp-intelligence";
      intelligence.innerHTML = `
        <div><dt>Designer</dt><dd>${escapeHtml(product.designer)}</dd></div>
        <div><dt>Collection</dt><dd>${escapeHtml(product.collection)}</dd></div>
        <div><dt>Capacity</dt><dd>${escapeHtml(product.seatingCapacity)}</dd></div>
        <div><dt>Spec</dt><dd>${escapeHtml(product.specCode)}</dd></div>`;
      description.after(intelligence);
    }

    const purchaseActions = document.querySelector(".di-actions");
    if (purchaseActions && !document.querySelector(".confidence-detail-actions")) {
      const actions = document.createElement("div");
      actions.className = "confidence-detail-actions";
      actions.innerHTML = `
        <button type="button" data-save-room-product="${product.id}">Save to room</button>
        <button type="button" data-compare-product="${product.id}" aria-pressed="${isCompared(product.id)}"><span data-action-label>${isCompared(product.id) ? "Compared" : "Compare"}</span></button>
        <button type="button" data-download-spec="${product.id}">Download specification ↓</button>
        <a href="contact.html?topic=product&pieces=${product.id}">Consult about this piece ↗</a>`;
      purchaseActions.before(actions);
    }

    const dimensionsBody = document.querySelector("#dimensions-fit .acc-item .acc-body");
    if (dimensionsBody && !document.querySelector(".technical-drawing")) {
      dimensionsBody.insertAdjacentHTML("beforeend", detailTechnicalDrawing(product));
    }

    const spec = document.querySelector(".d-spec");
    if (spec && !document.querySelector(".will-it-fit")) {
      spec.insertAdjacentHTML("afterend", fitSection(product));
    }

    const values = document.querySelector(".d-values");
    if (values && !document.querySelector(".designer-note")) {
      values.insertAdjacentHTML("afterend", detailDesignerStory(product));
    }

    const fitForm = document.querySelector("#fit-form");
    if (fitForm) {
      const updateFit = () => {
        const data = Object.fromEntries(new FormData(fitForm).entries());
        const guidance = getFitGuidance(product, data);
        const result = document.querySelector("#fit-result");
        if (!result) return;
        result.dataset.status = guidance.status;
        result.innerHTML = `<span class="fit-result__status">${escapeHtml(guidance.label)}</span><strong>${escapeHtml(product.name)} · ${formatDimensions(product)}</strong><p>${escapeHtml(guidance.detail)}</p>`;
      };
      fitForm.addEventListener("submit", (event) => {
        event.preventDefault();
        updateFit();
      });
      fitForm.querySelector("[data-save-fit-measurements]")?.addEventListener("click", () => {
        const data = Object.fromEntries(new FormData(fitForm).entries());
        saveMeasurements(data);
        updateFit();
      });
    }

    syncCompareUi();
  }

  function renderCompare() {
    if (!document.body.classList.contains("compare-page")) return;
    const params = new URLSearchParams(window.location.search);
    if (params.has("products")) {
      const seeded = params.get("products").split(",").map(Number).filter(Boolean);
      if (seeded.length) setCompareIds(seeded);
    }

    const grid = document.querySelector("#compare-grid");
    const summary = document.querySelector("#compare-summary");
    if (!grid) return;
    const ids = getCompareIds();
    const products = ids.map((id) => app.getProduct(id)).filter(Boolean);

    if (summary) summary.textContent = `${products.length} of ${MAX_COMPARE} products selected`;

    if (!products.length) {
      grid.innerHTML = `<div class="confidence-empty"><p class="object-index">Comparison / empty</p><h2>Choose two pieces<br />to make the trade-offs visible.</h2><p>Add products from the collection. Your selection stays in this browser only.</p><a class="primary-button" href="products.html">Explore collection ↗</a></div>`;
      return;
    }

    const savedRoom = getSavedRoom();
    const selectedVariant = (product) => {
      const saved = savedRoom.items.find((item) => item.productId === product.id);
      return app.getVariant(product, saved?.variantId) || product.variants[0];
    };
    const rows = [
      ["Room fit", (product) => roomFitForProduct(product, savedRoom)?.label || "Save room measurements to check"],
      ["Dimensions", (product) => formatDimensions(product)],
      ["Material", (product) => selectedVariant(product).material],
      ["Finish", (product) => selectedVariant(product).finish],
      ["Seating capacity", (product) => product.seatingCapacity],
      ["Lead time", (product) => `${selectedVariant(product).leadTimeMin}–${selectedVariant(product).leadTimeMax} days`],
      ["Delivery", (product) => product.deliveryType],
      ["Care", (product) => product.care?.[0] || "See product care"],
      ["Returns", (product) => returnabilityLabel(product)],
      ["Warranty", (product) => product.warrantyGuidance],
    ];

    grid.innerHTML = `
      <div class="compare-matrix" style="--compare-count:${products.length}">
        <div class="compare-matrix__corner"><span class="object-index">Decision evidence</span><p>Compare only what changes the purchase decision.</p></div>
        ${products.map((product) => `
          <article class="compare-product-head">
            <a href="detail.html?product=${product.id}" class="compare-product-head__image" style="background-image:url('${escapeHtml(product.image)}')" aria-label="View ${escapeHtml(product.name)}"></a>
            <div><span>${escapeHtml(product.collection)}</span><h2>${escapeHtml(product.name)}</h2><p>${app.formatMoney(selectedVariant(product).price)} · ${escapeHtml(selectedVariant(product).finish)}</p></div>
            <button type="button" data-remove-compare="${product.id}">Remove</button>
          </article>`).join("")}
        ${rows.map(([label, getValue]) => `
          <div class="compare-row-label"><span>${label}</span></div>
          ${products.map((product) => `<div class="compare-cell" data-row="${escapeHtml(label)}">${escapeHtml(getValue(product))}</div>`).join("")}
        `).join("")}
      </div>
      <div class="compare-next">
        <p><strong>${products.length < 2 ? "Add one more product to make comparison useful." : "Trade-offs visible. Now check the room."}</strong><span>Prototype comparison state is stored only in this browser.</span></p>
        <div><a href="products.html" class="secondary-button">${products.length < MAX_COMPARE ? "Add another product" : "Back to collection"} ↗</a><a href="saved-room.html" class="text-link">Open saved room ↗</a></div>
      </div>`;
  }

  function renderSavedRoom() {
    if (!document.body.classList.contains("saved-room-page")) return;
    const room = getSavedRoom();
    const roomSelect = document.querySelector("#saved-room-type");
    if (roomSelect) roomSelect.value = room.room;
    const form = document.querySelector("#saved-room-measurements");
    if (form) {
      Object.entries(room.measurements).forEach(([key, value]) => {
        if (form.elements[key]) form.elements[key].value = value;
      });
    }

    const grid = document.querySelector("#saved-room-items");
    const count = document.querySelector("#saved-room-count");
    if (count) count.textContent = `${room.items.length} ${room.items.length === 1 ? "product" : "products"} saved`;

    if (grid) {
      const items = room.items.map((item) => {
        const product = app.getProduct(item.productId);
        const variant = app.getVariant(product, item.variantId);
        return { item, product, variant, fit: product ? roomFitForProduct(product, room) : null };
      }).filter((entry) => entry.product);

      const decisionSummary = document.querySelector("#saved-room-decision-summary");
      if (decisionSummary) {
        const summary = roomDecisionSummary(room, items);
        decisionSummary.dataset.fitTone = summary.fitTone;
        decisionSummary.innerHTML = `
          <article><span>Room fit</span><strong>${escapeHtml(summary.fitLabel)}</strong><small>${hasRoomMeasurements(room) ? "Prototype guidance across saved pieces." : "Save room width, depth and doorway above."}</small></article>
          <article><span>Saved value</span><strong>${escapeHtml(summary.total)}</strong><small>Selected prototype variants.</small></article>
          <article><span>Longest lead</span><strong>${escapeHtml(summary.longestLead)}</strong><small>Use the slowest piece when planning the room.</small></article>
          <article><span>Handoff</span><strong>${items.length ? "Brief ready" : "Add a piece"}</strong><small>Consultation carries room constraints and saved pieces forward.</small></article>`;
      }

      grid.innerHTML = items.length ? items.map(({ product, variant, fit }, index) => `
        <article class="saved-room-item">
          <a href="detail.html?product=${product.id}" class="saved-room-item__image" style="background-image:url('${escapeHtml(variant.images?.[0] || product.image)}')" aria-label="View ${escapeHtml(product.name)}"></a>
          <div class="saved-room-item__copy">
            <span class="object-index">${String(index + 1).padStart(2, "0")} / ${escapeHtml(product.category)}</span>
            <h2>${escapeHtml(product.name)}</h2>
            <p>${formatDimensions(product)}<br />${escapeHtml(variant.finish)} · ${escapeHtml(variant.material)}</p>
            <dl class="saved-room-item__evidence">
              <div><dt>Room fit</dt><dd data-fit-status="${escapeHtml(fit?.status || "pending")}">${escapeHtml(fit?.label || "Save measurements to check")}</dd></div>
              <div><dt>Timing</dt><dd>${variant.leadTimeMin}–${variant.leadTimeMax} days</dd></div>
              <div><dt>Returns</dt><dd>${escapeHtml(returnabilityLabel(product))}</dd></div>
            </dl>
            <div><button type="button" data-compare-product="${product.id}" aria-pressed="${isCompared(product.id)}"><span data-action-label>${isCompared(product.id) ? "Compared" : "Compare"}</span></button><button type="button" data-remove-room-product="${product.id}">Remove</button></div>
          </div>
        </article>`).join("") : `
        <div class="confidence-empty">
          <p class="object-index">Saved room / empty</p>
          <h2>A room waits<br />to begin.</h2>
          <p>Save products from the collection or a product page. Finish preferences and measurements will stay with this browser.</p>
          <a class="primary-button" href="products.html?room=${encodeURIComponent(room.room)}">Find pieces for ${escapeHtml(room.room)} ↗</a>
        </div>`;
    }

    const pieces = room.items.map((item) => item.productId).join(",");
    const consult = document.querySelector("#saved-room-consult");
    if (consult) {
      const params = new URLSearchParams({ topic: "room", room: room.room });
      if (pieces) params.set("pieces", pieces);
      Object.entries(room.measurements).forEach(([key, value]) => {
        if (String(value).trim()) params.set(key, String(value));
      });
      consult.href = `contact.html?${params.toString()}`;
      consult.classList.toggle("is-disabled", !pieces);
      consult.setAttribute("aria-disabled", String(!pieces));
    }
    syncCompareUi();
  }

  function setupGlobalActions() {
    document.addEventListener("click", (event) => {
      const compareButton = event.target.closest("[data-compare-product]");
      if (compareButton) {
        event.preventDefault();
        toggleCompare(compareButton.dataset.compareProduct);
        syncCompareUi();
        if (document.body.classList.contains("compare-page")) renderCompare();
        return;
      }

      const removeCompare = event.target.closest("[data-remove-compare]");
      if (removeCompare) {
        event.preventDefault();
        toggleCompare(removeCompare.dataset.removeCompare);
        renderCompare();
        syncCompareUi();
        return;
      }

      const saveButton = event.target.closest("[data-save-room-product]");
      if (saveButton) {
        event.preventDefault();
        const product = app.getProduct(Number(saveButton.dataset.saveRoomProduct));
        if (!product) return;
        const variant = document.body.classList.contains("detail-page")
          ? activeDetailVariant(product)
          : product.variants[0];
        saveRoomItem(product.id, variant.variantId);
        return;
      }

      const removeRoom = event.target.closest("[data-remove-room-product]");
      if (removeRoom) {
        event.preventDefault();
        removeRoomItem(removeRoom.dataset.removeRoomProduct);
        renderSavedRoom();
        return;
      }

      const specButton = event.target.closest("[data-download-spec]");
      if (specButton) {
        event.preventDefault();
        const product = app.getProduct(Number(specButton.dataset.downloadSpec));
        if (product) downloadSpec(product);
      }
    });

    document.addEventListener("luxroom-compare-updated", syncCompareUi);
  }

  function enhanceConsultationHandoff() {
    if (!document.body.classList.contains("contact-page")) return;
    const params = new URLSearchParams(window.location.search);
    const topic = params.get("topic");
    const pieceIds = (params.get("pieces") || "").split(",").map(Number).filter((id) => app.getProduct(id));
    const hasContext = topic || pieceIds.length || ["room", "width", "depth", "doorway", "clearance"].some((key) => params.get(key));
    if (!hasContext) return;

    const subject = document.querySelector(`input[name="subject"][value="${topic === "room" ? "room" : topic === "delivery" ? "delivery" : "product"}"]`);
    if (subject) subject.checked = true;

    const savedRoom = getSavedRoom();
    const roomName = params.get("room") || savedRoom.room || "Room";
    const measurements = {
      width: params.get("width") || savedRoom.measurements.width,
      depth: params.get("depth") || savedRoom.measurements.depth,
      doorway: params.get("doorway") || savedRoom.measurements.doorway,
      clearance: params.get("clearance") || savedRoom.measurements.clearance,
    };
    const pieces = pieceIds.map((id) => {
      const product = app.getProduct(id);
      const saved = savedRoom.items.find((item) => item.productId === id);
      const variant = app.getVariant(product, saved?.variantId);
      return { product, variant };
    }).filter(({ product }) => product);

    const measurementText = measurements.width && measurements.depth
      ? `${measurements.width} × ${measurements.depth} cm room${measurements.doorway ? ` · ${measurements.doorway} cm doorway` : ""}${measurements.clearance ? ` · ${measurements.clearance} cm desired clearance` : ""}`
      : "Measurements not yet confirmed";
    const piecesText = pieces.length
      ? pieces.map(({ product, variant }) => `${product.name}${variant?.finish ? ` — ${variant.finish}` : ""}`).join("; ")
      : "No saved piece attached";

    const message = document.querySelector("#message");
    if (message && !message.value.trim()) {
      message.value = topic === "room"
        ? `Room: ${roomName}\nMeasurements: ${measurementText}\nSaved pieces: ${piecesText}\n\nI would like help confirming fit, access, finish coordination and delivery before deciding.`
        : `Object enquiry: ${piecesText}\n\nI would like help confirming dimensions, finish, availability and delivery access.`;
    }

    const form = document.querySelector("#contact-form");
    if (form && !document.querySelector(".consultation-brief")) {
      const brief = document.createElement("aside");
      brief.className = "consultation-brief";
      brief.setAttribute("aria-label", "Loaded consultation brief");
      brief.innerHTML = `
        <span class="object-index">Context carried forward</span>
        <div><strong>${escapeHtml(roomName)}</strong><small>${escapeHtml(measurementText)}</small></div>
        <div><strong>${pieces.length} saved piece${pieces.length === 1 ? "" : "s"}</strong><small>${escapeHtml(piecesText)}</small></div>
        <p>Prototype handoff only. Review and edit the note before sending.</p>`;
      form.prepend(brief);
    }
  }

  function setupSavedRoomPage() {
    if (!document.body.classList.contains("saved-room-page")) return;
    const form = document.querySelector("#saved-room-measurements");
    const roomSelect = document.querySelector("#saved-room-type");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      saveMeasurements(Object.fromEntries(new FormData(form).entries()), roomSelect?.value);
      renderSavedRoom();
    });
    roomSelect?.addEventListener("change", () => {
      const room = getSavedRoom();
      room.room = roomSelect.value;
      persistSavedRoom(room);
      renderSavedRoom();
    });
    renderSavedRoom();
  }

  window.LuxRoomConfidence = {
    getCompareIds,
    toggleCompare,
    getSavedRoom,
    saveRoomItem,
    saveMeasurements,
    getFitGuidance,
  };

  injectPrimaryNavigation();
  setupGlobalActions();
  enhanceHome();
  enhanceCollection();
  enhanceDetail();
  renderCompare();
  setupSavedRoomPage();
  enhanceConsultationHandoff();
  syncCompareUi();
})();
