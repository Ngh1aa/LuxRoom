const FINISH_LIBRARY = {
  "Olive bouclé": { material: "Bouclé", color: "Olive green", swatch: "#6a7458" },
  "Warm linen": { material: "Linen blend", color: "Cream", swatch: "#d9d0c2" },
  "Charcoal weave": { material: "Wool weave", color: "Charcoal", swatch: "#45474a" },
  "Natural oak": { material: "Solid oak", color: "Natural oak", swatch: "#b99a76" },
  "Smoked oak": { material: "Solid oak", color: "Charcoal", swatch: "#5b5147" },
  "Blackened oak": { material: "Solid oak", color: "Charcoal", swatch: "#333330" },
  "Honed stone": { material: "Natural stone", color: "Cream", swatch: "#c8c0b3" },
  "Sand stone": { material: "Natural stone", color: "Cream", swatch: "#d5c5aa" },
  "Terracotta weave": { material: "Textile", color: "Terracotta", swatch: "#a85f49" },
  "Ivory wool": { material: "Wool", color: "Cream", swatch: "#e5dfd4" },
  "Charcoal wool": { material: "Wool", color: "Charcoal", swatch: "#4a4a48" },
  "Chalk stoneware": { material: "Stoneware", color: "Cream", swatch: "#e0ddd4" },
  "Charcoal stoneware": { material: "Stoneware", color: "Charcoal", swatch: "#54534f" },
  "Olive glaze": { material: "Glazed stoneware", color: "Olive green", swatch: "#66705a" },
  "Chalk glaze": { material: "Glazed stoneware", color: "Cream", swatch: "#ddd8ca" },
  "Amber glass": { material: "Hand-blown glass", color: "Terracotta", swatch: "#a86a42" },
  "Smoked glass": { material: "Hand-blown glass", color: "Charcoal", swatch: "#65635e" },
  "Charcoal linen": { material: "Linen", color: "Charcoal", swatch: "#575855" },
};

const ROOM_GALLERIES = {
  Living: ["img/lux_detail_lounge_wide.webp", "img/lux_detail_lounge_closeup.webp"],
  Dining: ["img/lux_kitchen.webp", "img/lux_story_3.webp"],
  Bedroom: ["img/lux_bedroom.webp", "img/lux_story_2.webp"],
  Bathroom: ["img/lux_bathroom.webp", "img/lux_gallery_leaf.webp"],
  Office: ["img/lux_consulting.webp", "img/lux_story_4.webp"],
};

const rawProducts = [
  { id: 1, name: "Miro Lounge Chair", price: 320, tone: "thumb-a", image: "img/products/miro-lounge-chair.webp", gallery: ["img/products/miro-lounge-chair.webp", "img/lux_detail_lounge_wide.webp", "img/lux_detail_lounge_closeup.webp"], category: "Seating", collection: "Quiet Forms", room: "Living", style: "Sculptural", materialGroup: "Textile", colors: ["Olive green", "Cream", "Charcoal"], materials: ["Textile"], dimensions: { width: 82, depth: 76, height: 70, seatHeight: 41, seatDepth: 52, armHeight: 58, legHeight: 18 }, dimensionType: "chair", finishes: ["Olive bouclé", "Warm linen", "Charcoal weave"], stockStatus: "In stock", stock: 8, leadTimeMin: 5, leadTimeMax: 10, oversized: true, description: "A low, generous lounge chair with a soft sculptural profile. Its quiet proportions create an easy pause in the room — refined enough to hold its own, relaxed enough to live with every day.", materialDetails: { Upholstery: "Bouclé or linen blend", Frame: "FSC-certified solid oak", Filling: "High-resilience foam" } },
  { id: 2, name: "Rilo Oak Bed", price: 680, tone: "thumb-b", image: "img/products/rilo-oak-bed.webp", category: "Storage", collection: "Resting Rooms", room: "Bedroom", style: "Warm minimal", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 188, depth: 218, height: 92, clearance: 18 }, dimensionType: "bed", finishes: ["Natural oak", "Smoked oak"], stockStatus: "Made to order", stock: 0, leadTimeMin: 28, leadTimeMax: 42, oversized: true, madeToOrder: true, description: "A grounded oak bed with softly eased edges and a low, quiet profile made for slower mornings.", materialDetails: { Frame: "FSC-certified solid oak", Slats: "Steam-bent beech", Finish: "Plant-based hardwax oil" } },
  { id: 3, name: "Arca Dining Table", price: 900, tone: "thumb-c", image: "img/products/arca-dining-table.webp", category: "Tables", collection: "Gathering", room: "Dining", style: "Architectural", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 220, depth: 95, height: 75, topThickness: 4, clearance: 70 }, dimensionType: "table", finishes: ["Natural oak", "Smoked oak"], stockStatus: "Made to order", stock: 0, leadTimeMin: 28, leadTimeMax: 42, oversized: true, madeToOrder: true, description: "A long dining table with calm proportions, softened corners and room for everyday gathering.", materialDetails: { Top: "Solid European oak", Base: "Solid oak", Finish: "Hand-applied hardwax oil" } },
  { id: 4, name: "Noma Stone Bath", price: 230, tone: "thumb-d", image: "img/products/noma-stone-bath.webp", category: "Objects", collection: "Mineral Study", room: "Bathroom", style: "Organic", materialGroup: "Stone", colors: ["Cream"], materials: ["Stone"], dimensions: { width: 48, depth: 32, height: 16, internalWidth: 40, internalDepth: 24 }, dimensionType: "object", finishes: ["Honed stone", "Sand stone"], stockStatus: "Pre-order", stock: 0, leadTimeMin: 14, leadTimeMax: 24, description: "A carved stone basin object that brings a quiet mineral weight to the room.", materialDetails: { Body: "Natural limestone", Surface: "Hand-honed", Seal: "Water-resistant mineral treatment" } },
  { id: 5, name: "Silo Writing Desk", price: 210, tone: "thumb-e", image: "img/products/silo-writing-desk.webp", category: "Tables", collection: "Working Quiet", room: "Office", style: "Linear", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 140, depth: 62, height: 74, topThickness: 3, clearance: 70 }, dimensionType: "table", finishes: ["Natural oak", "Blackened oak"], stockStatus: "In stock", stock: 5, leadTimeMin: 5, leadTimeMax: 9, description: "A pared-back writing desk with one discreet drawer and enough surface for a focused daily ritual.", materialDetails: { Top: "Solid ash", Frame: "Solid ash", Finish: "Plant-based hardwax oil" } },
  { id: 6, name: "Raku Lounge Chair", price: 430, tone: "thumb-f", image: "img/products/raku-lounge-chair.webp", category: "Seating", collection: "Quiet Forms", room: "Living", style: "Soft modern", materialGroup: "Textile", colors: ["Terracotta", "Cream"], materials: ["Textile"], dimensions: { width: 78, depth: 83, height: 72, seatHeight: 40, seatDepth: 54, armHeight: 56 }, dimensionType: "chair", finishes: ["Terracotta weave", "Warm linen"], stockStatus: "In stock", stock: 4, leadTimeMin: 7, leadTimeMax: 12, oversized: true, description: "A softly upholstered chair with a wide seat and compact footprint, balancing comfort with a clear silhouette.", materialDetails: { Upholstery: "Woven textile", Frame: "Solid ash", Filling: "High-resilience foam" } },
  { id: 7, name: "Haven Wool Rug", price: 700, tone: "thumb-g", image: "img/products/haven-wool-rug.webp", category: "Textiles", collection: "Soft Ground", room: "Living", style: "Textural", materialGroup: "Textile", colors: ["Cream", "Charcoal"], materials: ["Textile"], dimensions: { width: 200, depth: 300, height: 1.2 }, dimensionType: "rug", finishes: ["Ivory wool", "Charcoal wool"], stockStatus: "Made to order", stock: 0, leadTimeMin: 21, leadTimeMax: 35, madeToOrder: true, description: "A hand-finished wool rug with a soft irregular texture that settles a room without asking for attention.", materialDetails: { Pile: "100% New Zealand wool", Backing: "Cotton", Construction: "Hand-tufted" } },
  { id: 8, name: "Ona Modular Sofa", price: 180, tone: "thumb-h", image: "img/products/ona-modular-sofa.webp", category: "Seating", collection: "Quiet Forms", room: "Living", style: "Modular", materialGroup: "Textile", colors: ["Cream", "Olive green", "Charcoal"], materials: ["Textile"], dimensions: { width: 240, depth: 98, height: 76, seatHeight: 42, seatDepth: 62, armHeight: 60, legHeight: 4 }, dimensionType: "sofa", finishes: ["Warm linen", "Olive bouclé", "Charcoal weave"], stockStatus: "Made to order", stock: 0, leadTimeMin: 28, leadTimeMax: 49, oversized: true, madeToOrder: true, description: "A low modular sofa designed around deep comfort, balanced proportions and rooms that evolve over time.", materialDetails: { Upholstery: "Linen blend or bouclé", Frame: "Kiln-dried hardwood", Filling: "Foam and feather blend" } },
  { id: 9, name: "Koto Side Table", price: 460, tone: "thumb-i", image: "img/products/koto-side-table.webp", category: "Tables", collection: "Small Objects", room: "Living", style: "Sculptural", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 48, depth: 48, height: 52, topThickness: 4, clearance: 48 }, dimensionType: "table", finishes: ["Natural oak", "Smoked oak"], stockStatus: "In stock", stock: 7, leadTimeMin: 4, leadTimeMax: 8, description: "A compact oak side table whose sculptural base gives daily objects a grounded place to land.", materialDetails: { Top: "Solid oak", Base: "Turned solid oak", Finish: "Hand-rubbed oil" } },
  { id: 10, name: "Ora Pedestal Table", price: 240, tone: "thumb-j", image: "img/products/ora-pedestal-table.webp", category: "Tables", collection: "Mineral Study", room: "Dining", style: "Monolithic", materialGroup: "Stoneware", colors: ["Cream", "Charcoal"], materials: ["Stoneware"], dimensions: { width: 72, depth: 72, height: 74, topThickness: 3, clearance: 71 }, dimensionType: "table", finishes: ["Chalk stoneware", "Charcoal stoneware"], stockStatus: "Pre-order", stock: 0, leadTimeMin: 14, leadTimeMax: 24, description: "A compact pedestal table with a quietly monolithic form and a hand-finished tactile surface.", materialDetails: { Top: "Mineral composite", Base: "Hand-finished stoneware", Seal: "Food-safe matte treatment" } },
  { id: 11, name: "Audo Dining Chair", price: 210, tone: "thumb-k", image: "img/lux_story_2.webp", category: "Seating", collection: "Gathering", room: "Dining", style: "Crafted", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 52, depth: 55, height: 78, seatHeight: 46, seatDepth: 44 }, dimensionType: "chair", finishes: ["Natural oak", "Blackened oak"], stockStatus: "In stock", stock: 12, leadTimeMin: 4, leadTimeMax: 8, description: "A light dining chair with a gently curved back and tactile joinery made to be handled every day.", materialDetails: { Frame: "Solid oak", Seat: "Woven paper cord", Finish: "Plant-based hardwax oil" } },
  { id: 12, name: "Dune Loveseat", price: 280, tone: "thumb-l", image: "img/lux_gallery_main.webp", category: "Seating", collection: "Quiet Forms", room: "Living", style: "Soft modern", materialGroup: "Textile", colors: ["Olive green", "Cream"], materials: ["Textile"], dimensions: { width: 158, depth: 88, height: 74, seatHeight: 41, seatDepth: 56, armHeight: 58, legHeight: 12 }, dimensionType: "sofa", finishes: ["Olive bouclé", "Warm linen"], stockStatus: "In stock", stock: 3, leadTimeMin: 7, leadTimeMax: 12, oversized: true, description: "A compact two-seat form with generous cushioning, designed for smaller rooms without losing its sense of ease.", materialDetails: { Upholstery: "Bouclé or linen blend", Frame: "Kiln-dried hardwood", Filling: "High-resilience foam" } },
  { id: 13, name: "Moss Table Lamp", price: 160, tone: "thumb-m", image: "img/products-new/olive-desk-lamp.webp", category: "Lighting", collection: "Evening Light", room: "Office", style: "Tactile", materialGroup: "Stoneware", colors: ["Olive green", "Cream"], materials: ["Stoneware"], dimensions: { width: 26, depth: 26, height: 42 }, dimensionType: "light", finishes: ["Olive glaze", "Chalk glaze"], stockStatus: "In stock", stock: 9, leadTimeMin: 3, leadTimeMax: 7, description: "A glazed table lamp with a grounded base and softly diffused light for late working hours.", materialDetails: { Base: "Hand-glazed stoneware", Shade: "Linen", Fitting: "E27 LED compatible" } },
  { id: 14, name: "Halo Wall Light", price: 120, tone: "thumb-n", image: "img/products-new/amber-wall-sconce.webp", category: "Lighting", collection: "Evening Light", room: "Bedroom", style: "Warm modern", materialGroup: "Stoneware", colors: ["Terracotta", "Charcoal"], materials: ["Stoneware"], dimensions: { width: 22, depth: 12, height: 28 }, dimensionType: "light", finishes: ["Amber glass", "Smoked glass"], stockStatus: "In stock", stock: 11, leadTimeMin: 3, leadTimeMax: 7, description: "A small wall light that casts a softened pool of amber light beside a bed or reading chair.", materialDetails: { Shade: "Hand-blown glass", Backplate: "Patinated brass", Fitting: "G9 LED compatible" } },
  { id: 15, name: "Softline Linen Throw", price: 95, tone: "thumb-o", image: "img/products-new/linen-throw.webp", category: "Textiles", collection: "Soft Ground", room: "Bedroom", style: "Natural", materialGroup: "Textile", colors: ["Cream", "Charcoal"], materials: ["Textile"], dimensions: { width: 130, depth: 200, height: 0.4 }, dimensionType: "textile", finishes: ["Warm linen", "Charcoal linen"], stockStatus: "In stock", stock: 16, leadTimeMin: 3, leadTimeMax: 6, description: "A softly washed linen throw with a relaxed weight and an easy, lived-in hand.", materialDetails: { Composition: "100% European linen", Edge: "Hand-fringed", Finish: "Garment washed" } },
  { id: 16, name: "Mori Keepsake Box", price: 145, tone: "thumb-p", image: "img/products-new/oak-keepsake-box.webp", category: "Storage", collection: "Small Objects", room: "Office", style: "Crafted", materialGroup: "Oak & ash", colors: ["Natural oak", "Charcoal"], materials: ["Oak & ash"], dimensions: { width: 34, depth: 24, height: 12, internalWidth: 30, internalDepth: 20 }, dimensionType: "storage", finishes: ["Natural oak", "Smoked oak"], stockStatus: "In stock", stock: 6, leadTimeMin: 4, leadTimeMax: 8, description: "A precisely joined oak box for the small papers and objects worth keeping close.", materialDetails: { Body: "Solid oak", Lining: "Natural wool felt", Finish: "Hand-rubbed oil" } },
  { id: 17, name: "Luma Amber Sconce", price: 190, tone: "thumb-q", image: "img/lux_luma_sconce_front.webp", gallery: ["img/lux_luma_sconce_front.webp", "img/lux_luma_sconce_side.webp", "img/lux_luma_sconce_detail.webp"], category: "Lighting", collection: "Evening Light", room: "Living", style: "Sculptural", materialGroup: "Stoneware", colors: ["Terracotta", "Charcoal"], materials: ["Stoneware"], dimensions: { width: 24, depth: 14, height: 31 }, dimensionType: "light", finishes: ["Amber glass", "Smoked glass"], stockStatus: "Pre-order", stock: 0, leadTimeMin: 14, leadTimeMax: 21, description: "An amber glass wall sconce that casts a warm, softened glow and brings a calm evening rhythm to the room.", materialDetails: { Shade: "Hand-blown glass", Backplate: "Patinated brass", Fitting: "G9 LED compatible" } },
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildVariants(product) {
  const baseGallery = unique([product.image, ...(product.gallery || []), ...(ROOM_GALLERIES[product.room] || [])]).slice(0, 4);
  return product.finishes.map((finishName, index) => {
    const finish = FINISH_LIBRARY[finishName] || { material: product.materialGroup, color: product.colors[0], swatch: "#c7c0b4" };
    const stockStatus = index === 0 ? product.stockStatus : (index === 1 ? "Made to order" : "Pre-order");
    const leadOffset = index === 0 ? 0 : (index === 1 ? 14 : 7);
    const images = baseGallery.length > 1
      ? [...baseGallery.slice(index), ...baseGallery.slice(0, index)]
      : baseGallery;
    return {
      variantId: `${product.id}-${index + 1}`,
      sku: `LR-${String(product.id).padStart(3, "0")}-${String(index + 1).padStart(2, "0")}`,
      finish: finishName,
      material: finish.material,
      color: finish.color,
      swatch: finish.swatch,
      price: product.price + (index * 20),
      stockStatus,
      stock: stockStatus === "In stock" ? Math.max(1, product.stock - index) : 0,
      leadTimeMin: product.leadTimeMin + leadOffset,
      leadTimeMax: product.leadTimeMax + leadOffset,
      images,
    };
  });
}

const products = rawProducts.map((product) => ({
  ...product,
  slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
  deliveryType: product.oversized ? "Room delivery" : "Careful delivery",
  returnable: product.madeToOrder !== true,
  madeToOrder: product.madeToOrder === true,
  care: product.materialGroup === "Textile"
    ? ["Vacuum gently using a soft brush.", "Avoid sustained direct sunlight.", "Professional cleaning is recommended."]
    : ["Dust with a clean, soft cloth.", "Wipe spills promptly and avoid abrasive cleaners.", "Keep away from sustained heat and moisture."],
  variants: buildVariants(product),
}));

function injectExperienceStylesheets() {
  const assets = [
    { href: "css/title-spacing.css?v=ux-20260813-6", attribute: "data-luxroom-title-spacing" },
    { href: "css/experience-upgrade.css?v=ux-20260813-10", attribute: "data-luxroom-experience-upgrade" },
  ];
  assets.forEach(({ href, attribute }) => {
    if (document.querySelector(`link[${attribute}]`)) return;
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    stylesheet.setAttribute(attribute, "true");
    document.head.appendChild(stylesheet);
  });
}

injectExperienceStylesheets();

function initLazyBackgrounds() {
  const nodes = Array.from(document.querySelectorAll('[data-bg]'));
  if (!nodes.length) return;

  const load = (node) => {
    const source = node.dataset.bg;
    if (!source || node.dataset.bgLoaded === 'true') return;
    node.style.backgroundImage = `url("${source}")`;
    node.dataset.bgLoaded = 'true';
    node.classList.remove('lazy-bg');
  };

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(load);
    return;
  }

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      load(entry.target);
      currentObserver.unobserve(entry.target);
    });
  }, { rootMargin: '240px 0px' });

  nodes.forEach((node) => observer.observe(node));
}

initLazyBackgrounds();

function standardizeHeaderIcons() {
  document.querySelectorAll(".topbar-actions").forEach((actions) => {
    actions.setAttribute("aria-label", "Quick actions");
    actions.innerHTML = `
      <button class="mobile-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="luxroom-main-menu">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
      <button class="icon-button" aria-label="Search" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
      </button>
      <a class="icon-button" href="cart.html" aria-label="Cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8" cy="21" r="1"></circle><circle cx="19" cy="21" r="1"></circle><path d="M2 3h2l3 12h10l2-8H6"></path></svg>
        <span class="cart-badge" data-cart-count style="display:none">0</span>
      </a>
      <a class="icon-button" href="wishlist.html" aria-label="Wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>
        <span class="cart-badge" data-wishlist-count style="display:none">0</span>
      </a>
      <a class="icon-button" href="auth.html" aria-label="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
      </a>`;
  });
}

standardizeHeaderIcons();

function initDiscoveryNavigation() {
  const categories = ["Seating", "Tables", "Lighting", "Storage", "Textiles", "Objects"];
  const rooms = ["Living", "Dining", "Bedroom", "Office", "Bathroom"];
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const query = new URLSearchParams(window.location.search);
  const hasRoomScope = Boolean(query.get("room"));
  const mobileMenuQuery = window.matchMedia("(max-width: 820px)");

  const setupFlyout = (wrapper, trigger, flyout) => {
    const setExpanded = (expanded) => trigger.setAttribute("aria-expanded", String(mobileMenuQuery.matches || expanded));
    setExpanded(false);
    wrapper.addEventListener("mouseenter", () => setExpanded(true));
    wrapper.addEventListener("mouseleave", () => setExpanded(false));
    wrapper.addEventListener("focusin", () => setExpanded(true));
    wrapper.addEventListener("focusout", (event) => {
      if (!wrapper.contains(event.relatedTarget)) setExpanded(false);
    });
    trigger.addEventListener("keydown", (event) => {
      if (event.key !== "ArrowDown" || mobileMenuQuery.matches) return;
      event.preventDefault();
      setExpanded(true);
      flyout.querySelector("a")?.focus();
    });
    wrapper.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || mobileMenuQuery.matches) return;
      setExpanded(false);
      trigger.focus();
    });
    mobileMenuQuery.addEventListener?.("change", () => setExpanded(false));
  };

  document.querySelectorAll(".main-nav").forEach((nav) => {
    const directLinks = Array.from(nav.children).filter((node) => node.matches?.("a"));
    const homeLink = directLinks.find((node) => node.matches?.('a[href*="index.html"]'));
    const collectionLink = directLinks.find((node) => node.matches?.('a[href*="products.html"]'));
    if (!collectionLink || collectionLink.closest(".nav-shop")) return;

    homeLink?.remove();

    const shop = document.createElement("div");
    shop.className = "nav-shop nav-discovery";
    collectionLink.before(shop);
    shop.appendChild(collectionLink);
    collectionLink.textContent = "Shop";
    collectionLink.setAttribute("aria-haspopup", "true");
    collectionLink.setAttribute("aria-expanded", "false");

    const shopFlyout = document.createElement("div");
    shopFlyout.className = "nav-shop-flyout nav-discovery-flyout";
    shopFlyout.setAttribute("aria-label", "Shop by category");
    shopFlyout.innerHTML = categories
      .map((category) => `<a href="products.html?category=${encodeURIComponent(category)}">${category}</a>`)
      .join("");
    shop.appendChild(shopFlyout);

    const roomNav = document.createElement("div");
    roomNav.className = "nav-rooms nav-discovery";
    roomNav.innerHTML = '<a class="nav-rooms-link" href="index.html#room-edit-title" aria-haspopup="true" aria-expanded="false">Rooms</a>';
    const roomsLink = roomNav.querySelector(".nav-rooms-link");
    const roomsFlyout = document.createElement("div");
    roomsFlyout.className = "nav-rooms-flyout nav-discovery-flyout";
    roomsFlyout.setAttribute("aria-label", "Shop by room");
    roomsFlyout.innerHTML = rooms
      .map((room) => `<a href="products.html?room=${encodeURIComponent(room)}#room=${encodeURIComponent(room)}">${room}</a>`)
      .join("");
    roomNav.appendChild(roomsFlyout);
    shop.after(roomNav);

    const isCollection = currentPage === "products.html";
    collectionLink.classList.toggle("active", isCollection && !hasRoomScope);
    roomsLink.classList.toggle(
      "active",
      (isCollection && hasRoomScope) || (currentPage === "index.html" && window.location.hash === "#room-edit-title"),
    );

    setupFlyout(shop, collectionLink, shopFlyout);
    setupFlyout(roomNav, roomsLink, roomsFlyout);
  });
}

initDiscoveryNavigation();

function initMobileMenu() {
  document.querySelectorAll(".topbar").forEach((topbar) => {
    const nav = topbar.querySelector(".main-nav");
    const toggle = topbar.querySelector(".mobile-menu-toggle");
    if (!nav || !toggle) return;

    nav.id = "luxroom-main-menu";
    const setOpen = (isOpen, moveFocus = false) => {
      topbar.classList.toggle("menu-open", isOpen);
      document.body.classList.toggle("lux-menu-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      if (moveFocus) nav.querySelector("a")?.focus();
    };

    toggle.addEventListener("click", () => setOpen(!topbar.classList.contains("menu-open"), true));
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setOpen(false)));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && topbar.classList.contains("menu-open")) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 820 && topbar.classList.contains("menu-open")) setOpen(false);
    });
  });
}

initMobileMenu();

const cartCountNodes = document.querySelectorAll("[data-cart-count]");
const newsletterForms = document.querySelectorAll(".newsletter-form");

const DELIVERY_LOCATIONS = {
  hcm: { label: "Ho Chi Minh City", surcharge: 0, extraDays: 0 },
  hanoi: { label: "Hanoi", surcharge: 20, extraDays: 2 },
  danang: { label: "Da Nang", surcharge: 20, extraDays: 2 },
  province: { label: "Other province", surcharge: 35, extraDays: 4 },
};

function readLocalJson(key, fallback) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || "null");
    return stored ?? fallback;
  } catch {
    return fallback;
  }
}

function getProduct(productId) {
  return products.find((product) => product.id === Number(productId));
}

function getVariant(product, variantId) {
  if (!product) return null;
  return product.variants.find((variant) => variant.variantId === String(variantId)) || product.variants[0];
}

function makeCartKey(productId, variantId) {
  return `${Number(productId)}:${variantId}`;
}

function normalizeCartItem(item) {
  const product = getProduct(item.productId ?? item.id);
  if (!product) return null;
  const variant = getVariant(product, item.variantId);
  return {
    key: makeCartKey(product.id, variant.variantId),
    productId: product.id,
    variantId: variant.variantId,
    sku: variant.sku,
    name: product.name,
    price: Number(item.price ?? variant.price),
    finish: item.finish || variant.finish,
    material: item.material || variant.material,
    color: item.color || variant.color,
    stockStatus: variant.stockStatus,
    leadTimeMin: Number(item.leadTimeMin ?? variant.leadTimeMin),
    leadTimeMax: Number(item.leadTimeMax ?? variant.leadTimeMax),
    deliveryType: product.deliveryType,
    image: item.image || variant.images[0] || product.image,
    oversized: product.oversized === true,
    quantity: Math.max(1, Number(item.quantity) || 1),
  };
}

let cartItems = readLocalJson("luxroom-cart-items", []).map(normalizeCartItem).filter(Boolean);
let wishlistItems = readLocalJson("luxroom-wishlist", []).map(Number).filter((id) => getProduct(id));
let deliveryPreferences = {
  location: "hcm",
  method: "room",
  ...readLocalJson("luxroom-delivery-preferences", {}),
};

function persistCart() {
  localStorage.setItem("luxroom-cart-items", JSON.stringify(cartItems));
  window.LuxRoom.cartItems = cartItems;
}

function formatMoney(value) {
  return `$${Number(value).toFixed(0)}`;
}

function formatArrivalDate(date) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(date);
}

function getArrivalWindow(source, locationKey = deliveryPreferences.location) {
  const location = DELIVERY_LOCATIONS[locationKey] || DELIVERY_LOCATIONS.hcm;
  const minDays = Number(source?.leadTimeMin ?? source?.variants?.[0]?.leadTimeMin ?? 5) + location.extraDays;
  const maxDays = Number(source?.leadTimeMax ?? source?.variants?.[0]?.leadTimeMax ?? 10) + location.extraDays;
  const start = new Date();
  const end = new Date();
  start.setDate(start.getDate() + minDays);
  end.setDate(end.getDate() + maxDays);
  return {
    start,
    end,
    label: `${formatArrivalDate(start)} — ${formatArrivalDate(end)}`,
  };
}

function getCartTotals(preferences = deliveryPreferences) {
  const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
  const location = DELIVERY_LOCATIONS[preferences.location] || DELIVERY_LOCATIONS.hcm;
  const placement = preferences.method === "placement" ? 45 : 0;
  const shipping = subtotal > 0 ? location.surcharge + placement : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

function updateDeliveryPreferences(nextPreferences) {
  deliveryPreferences = { ...deliveryPreferences, ...nextPreferences };
  if (!DELIVERY_LOCATIONS[deliveryPreferences.location]) deliveryPreferences.location = "hcm";
  if (!["room", "placement"].includes(deliveryPreferences.method)) deliveryPreferences.method = "room";
  localStorage.setItem("luxroom-delivery-preferences", JSON.stringify(deliveryPreferences));
  window.LuxRoom.deliveryPreferences = deliveryPreferences;
  document.dispatchEvent(new CustomEvent("luxroom-delivery-updated", { detail: deliveryPreferences }));
}

function getCartItemCount() {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

let lastCartCount = getCartItemCount();

function pulseCartFeedback() {
  cartCountNodes.forEach((node) => {
    node.classList.remove("is-pulsing");
    void node.offsetWidth;
    node.classList.add("is-pulsing");
    window.setTimeout(() => node.classList.remove("is-pulsing"), 520);
  });
  document.querySelectorAll('.topbar-actions a[aria-label="Cart"]').forEach((link) => {
    link.classList.remove("cart-updated");
    void link.offsetWidth;
    link.classList.add("cart-updated");
    window.setTimeout(() => link.classList.remove("cart-updated"), 520);
  });
}

function syncCartCount() {
  const count = getCartItemCount();
  cartCountNodes.forEach((node) => {
    node.textContent = String(count);
    node.style.display = count > 0 ? "flex" : "none";
  });
  if (count !== lastCartCount) {
    pulseCartFeedback();
    lastCartCount = count;
  }
}

function syncWishlistBadge() {
  document.querySelectorAll("[data-wishlist-count]").forEach((node) => {
    node.textContent = String(wishlistItems.length);
    node.style.display = wishlistItems.length > 0 ? "flex" : "none";
  });
}

function showToast(message) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = "toast-msg";
  toast.textContent = message;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  window.setTimeout(() => {
    toast.classList.remove("show");
    window.setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function addToCart(productId, quantity = 1, variantId = null) {
  const product = getProduct(productId);
  if (!product) return null;
  const variant = getVariant(product, variantId);
  const key = makeCartKey(product.id, variant.variantId);
  const existingItem = cartItems.find((item) => item.key === key);
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cartItems.push(normalizeCartItem({
      productId: product.id,
      variantId: variant.variantId,
      price: variant.price,
      quantity,
    }));
  }
  persistCart();
  syncCartCount();
  document.dispatchEvent(new Event("luxroom-cart-updated"));
  const addedItem = cartItems.find((item) => item.key === key);
  document.dispatchEvent(new CustomEvent("luxroom-cart-added", { detail: { item: addedItem } }));
  return addedItem;
}

function updateCartItem(itemKey, quantity) {
  const resolvedKey = String(itemKey).includes(":")
    ? String(itemKey)
    : cartItems.find((item) => item.productId === Number(itemKey))?.key;
  if (!resolvedKey) return;
  cartItems = quantity <= 0
    ? cartItems.filter((item) => item.key !== resolvedKey)
    : cartItems.map((item) => item.key === resolvedKey ? { ...item, quantity } : item);
  persistCart();
  syncCartCount();
  document.dispatchEvent(new Event("luxroom-cart-updated"));
}

function clearCart() {
  cartItems = [];
  localStorage.removeItem("luxroom-cart-items");
  window.LuxRoom.cartItems = cartItems;
  syncCartCount();
  document.dispatchEvent(new Event("luxroom-cart-updated"));
}

function initMiniCartPreview() {
  const cartLink = document.querySelector('.topbar-actions a[aria-label="Cart"]');
  if (!cartLink || document.querySelector(".mini-cart-popover")) return;

  const popover = document.createElement("div");
  popover.className = "mini-cart-popover";
  popover.setAttribute("aria-hidden", "true");
  popover.setAttribute("role", "dialog");
  popover.setAttribute("aria-label", "Cart preview");
  document.body.appendChild(popover);

  let closeTimer;
  const positionPopover = () => {
    const rect = cartLink.getBoundingClientRect();
    const width = Math.min(340, window.innerWidth - 32);
    const left = Math.max(16, Math.min(window.innerWidth - width - 16, rect.right - width));
    popover.style.width = `${width}px`;
    popover.style.top = `${rect.bottom + 14}px`;
    popover.style.left = `${left}px`;
  };

  const renderPreview = () => {
    const items = cartItems.slice(0, 2);
    const productById = new Map(products.map((product) => [product.id, product]));
    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
    if (!items.length) {
      popover.innerHTML = '<p class="mini-cart-eyebrow">Your selection</p><p class="mini-cart-empty">No objects here yet. Take your time.</p><a class="mini-cart-link" href="products.html">Explore the collection <span aria-hidden="true">↗</span></a>';
      return;
    }
    popover.innerHTML = `<p class="mini-cart-eyebrow">Your selection · ${getCartItemCount()} ${getCartItemCount() === 1 ? "object" : "objects"}</p><div class="mini-cart-items">${items.map((item) => {
      const product = productById.get(item.productId);
      return `<div class="mini-cart-item"><span class="mini-cart-item-image" style="background-image:url('${item.image || product?.image || "img/luxroom_visual_reference.webp"}')" aria-hidden="true"></span><span class="mini-cart-item-copy"><strong>${item.name}</strong><small>${item.finish} · ${item.quantity} × ${formatMoney(item.price)}</small></span></div>`;
    }).join("")}</div><div class="mini-cart-total"><span>Subtotal</span><strong>$${total.toFixed(0)}</strong></div><a class="mini-cart-link" href="cart.html">View cart <span aria-hidden="true">↗</span></a>`;
  };

  const open = () => {
    window.clearTimeout(closeTimer);
    renderPreview();
    positionPopover();
    popover.classList.add("is-open");
    popover.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    closeTimer = window.setTimeout(() => {
      popover.classList.remove("is-open");
      popover.setAttribute("aria-hidden", "true");
    }, 180);
  };

  cartLink.addEventListener("mouseenter", open);
  cartLink.addEventListener("focusin", open);
  cartLink.addEventListener("mouseleave", close);
  cartLink.addEventListener("focusout", (event) => {
    if (!popover.contains(event.relatedTarget)) close();
  });
  popover.addEventListener("mouseenter", open);
  popover.addEventListener("mouseleave", close);
  popover.addEventListener("focusin", open);
  popover.addEventListener("focusout", (event) => {
    if (!cartLink.contains(event.relatedTarget)) close();
  });
  window.addEventListener("resize", () => {
    if (popover.classList.contains("is-open")) positionPopover();
  });
  document.addEventListener("luxroom-cart-updated", renderPreview);
}

function isWishlisted(productId) {
  return wishlistItems.includes(productId);
}

function toggleWishlist(productId) {
  const product = products.find((item) => item.id === productId);
  if (isWishlisted(productId)) {
    wishlistItems = wishlistItems.filter((item) => item !== productId);
    if (product) showToast(`${product.name} removed from wishlist.`);
  } else {
    wishlistItems.push(productId);
    if (product) showToast(`${product.name} saved to wishlist.`);
  }
  localStorage.setItem("luxroom-wishlist", JSON.stringify(wishlistItems));
  window.LuxRoom.wishlistItems = wishlistItems;
  syncWishlistBadge();
  document.dispatchEvent(new CustomEvent("wishlist-updated"));
}

function injectContextualBackLink() {
  const page = window.location.pathname.split("/").pop().replace(/\.html$/, "") || "index";
  const destinations = {
    checkout: { href: "./cart.html", label: "Back to cart" },
    wishlist: { href: "./products.html", label: "Back to collection" },
    success: { href: "./products.html", label: "Back to collection" },
  };
  const destination = destinations[page];
  const main = document.querySelector("main");
  if (!destination || !main || document.querySelector(".page-back-link")) return;
  const container = document.createElement("div");
  container.className = "page-back-shell";
  container.innerHTML = `<a class="page-back-link" href="${destination.href}">← ${destination.label}</a>`;
  main.prepend(container);
}

function upgradeFooter() {
  const footer = document.querySelector("footer.footer, footer.home-footer, footer.detail-footer");
  if (!footer || footer.dataset.luxroomEnhanced === "true") return;
  footer.dataset.luxroomEnhanced = "true";
  footer.classList.add("footer-rich");
  footer.innerHTML = `
    <div class="footer-rich__top">
      <div class="footer-rich__brand">
        <a class="footer-brand" href="index.html">LuxRoom</a>
        <p>Objects and rooms for an unhurried life.</p>
        <a class="footer-rich__consultation" href="contact.html">Plan a room with us <span aria-hidden="true">↗</span></a>
      </div>
      <div class="footer-rich__column"><h3>Explore</h3><a href="products.html">Collection</a><a href="about.html">Our story</a><a href="wishlist.html">Saved objects</a></div>
      <div class="footer-rich__column"><h3>Service</h3><a href="contact.html">Room consultation</a><a href="contact.html">Delivery & care</a><a href="contact.html">Trade enquiries</a></div>
      <div class="footer-rich__column footer-rich__contact"><h3>Visit & contact</h3><p>Ho Chi Minh City<br>By appointment</p><a href="mailto:hello@luxroom.com">hello@luxroom.com</a><a href="tel:+84798876074">+84 798 876 074</a></div>
      <div class="footer-rich__newsletter"><h3>Notes from LuxRoom</h3><p>New objects, quiet rooms and considered material stories.</p><form class="footer-newsletter" novalidate><label class="sr-only" for="footer-email">Email address</label><input id="footer-email" type="email" placeholder="Your email address" autocomplete="email" required><button type="submit" aria-label="Subscribe to LuxRoom notes">↗</button></form><small>Occasional notes. No noise.</small></div>
    </div>
    <div class="footer-rich__bottom"><div class="footer-rich__meta"><span>© <span data-footer-year></span> LuxRoom</span></div><div class="footer-rich__delivery">Vietnam / worldwide delivery</div><nav class="footer-rich__legal" aria-label="Footer legal links"><a href="contact.html">Privacy</a><a href="contact.html">Terms</a><a href="#top">Back to top ↑</a></nav></div>`;
  footer.querySelectorAll("[data-footer-year]").forEach((node) => { node.textContent = new Date().getFullYear(); });
  footer.querySelector(".footer-newsletter")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = footer.querySelector("#footer-email");
    if (!input?.checkValidity()) { input?.reportValidity(); return; }
    showToast("Thank you — LuxRoom notes will arrive quietly.");
    event.currentTarget.reset();
  });
}

function normalizeCartContinueAction() {
  const page = window.location.pathname.split("/").pop().replace(/\.html$/, "") || "index";
  if (page !== "cart") return;
  document.querySelectorAll(".page-back-shell").forEach((node) => node.remove());
  const collectionLinks = Array.from(document.querySelectorAll(".back-to-edit"));
  if (!collectionLinks.length) return;
  const collectionLink = collectionLinks[0];
  collectionLinks.slice(1).forEach((node) => node.remove());
  collectionLink.href = "products.html";
  collectionLink.textContent = "Continue shopping";
  collectionLink.setAttribute("aria-label", "Continue shopping in the collection");
  collectionLink.hidden = false;
}

function initContactContext() {
  if (!document.body.classList.contains("contact-page")) return;
  const params = new URLSearchParams(window.location.search);
  const requestedTopic = params.get("topic");
  const topic = ["product", "room", "delivery"].includes(requestedTopic) ? requestedTopic : null;
  const subject = topic ? document.querySelector(`input[name="subject"][value="${topic}"]`) : null;
  if (subject) subject.checked = true;
  const pieceIds = (params.get("pieces") || "").split(",").map(Number).filter(Boolean);
  const pieceNames = pieceIds.map((id) => getProduct(id)?.name).filter(Boolean);
  const message = document.querySelector("#message");
  if (message && pieceNames.length && !message.value) {
    message.value = `I would like to plan a room around these saved pieces: ${pieceNames.join(", ")}.`;
  }
}

function initProfileOrders() {
  if (!document.body.classList.contains("profile-page")) return;
  let orders = [];
  try { orders = JSON.parse(localStorage.getItem("luxroom-orders") || "[]"); } catch { orders = []; }
  const order = orders[0];
  const list = document.querySelector(".order-list");
  if (!order || !list || list.querySelector(`[data-order-id="${order.id}"]`)) return;
  const date = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(order.createdAt));
  const card = document.createElement("article");
  card.className = "order-card";
  card.dataset.orderId = order.id;
  card.innerHTML = `<header class="order-header"><div><span class="order-date">${date} / ${order.id}</span><h3>${order.items.length === 1 ? order.items[0].name : `${order.items.length} objects for the room`}</h3></div><span class="order-status status-processing">${order.status}</span></header><div class="order-items">${order.items.map((item) => `<div class="item-summary"><span>${item.name} · ${item.finish} / ${String(item.quantity).padStart(2, "0")}</span><span>${formatMoney(item.price * item.quantity)}</span></div>`).join("")}</div><footer class="order-footer"><a class="view-detail-link" href="tracking.html?order=${encodeURIComponent(order.id)}">Track order ↗</a><strong>Total ${formatMoney(order.totals.total)}</strong></footer>`;
  list.prepend(card);
}

newsletterForms.forEach((form) => form.addEventListener("submit", (event) => event.preventDefault()));
upgradeFooter();
normalizeCartContinueAction();
initContactContext();
initProfileOrders();

function initMotionSystem() {
  const selectors = [
    ".home-hero", ".discovery-rail", ".home-section", ".collections", ".edited-pieces", ".studio", ".room-edit", ".commerce-assurance", ".newsletter",
    ".collection-hero", ".collection-index", ".filter-toolbar", ".expanded-filters", ".product-grid-masonry",
    ".rooms-hero", ".room-index", ".room-atlas > article",
    ".d-gallery", ".di-header", ".d-spec", ".related-products",
    ".contact-intro", ".contact-grid", ".contact-quiet",
    ".story-hero", ".story-statement", ".material-triptych article", ".story-image-essay", ".newsletter-band",
    ".cart-intro", ".cart-layout > *", ".cart-assurance",
    ".checkout-intro", ".checkout-layout > *",
    ".auth-essay", ".auth-card", ".profile-hero", ".profile-layout > *",
    ".success-message", ".success-steps", ".wishlist-hero", ".wishlist-empty",
    ".footer-rich__top > *", ".footer-rich__bottom"
  ];
  const deepMotion = new Set(["home-hero", "collection-hero", "story-hero", "auth-essay", "checkout-intro", "rooms-hero"]);
  let sequence = 0;
  let observer;

  const prepareNode = (node) => {
    if (!(node instanceof Element) || node.dataset.luxroomMotionReady === "true") return;
    node.dataset.luxroomMotionReady = "true";
    node.classList.add("motion-reveal");
    const delayFromMarkup = node.style.animationDelay;
    if (delayFromMarkup) {
      node.style.setProperty("--motion-delay", delayFromMarkup);
      node.style.removeProperty("animation-delay");
    } else {
      node.style.setProperty("--motion-delay", `${Math.min(sequence, 8) * 45}ms`);
    }
    if (deepMotion.has(node.classList[0]) || node.classList.contains("home-hero") || node.classList.contains("collection-hero") || node.classList.contains("story-hero") || node.classList.contains("auth-essay") || node.classList.contains("checkout-intro") || node.classList.contains("rooms-hero")) {
      node.dataset.motionDepth = "deep";
    }
    sequence += 1;
    if (observer) observer.observe(node);
    else node.classList.add("is-visible");
  };

  const decorate = (scope = document) => {
    selectors.forEach((selector) => {
      scope.querySelectorAll(selector).forEach(prepareNode);
    });
    if (scope instanceof Element && scope.matches(".motion-reveal, .product-card")) prepareNode(scope);
  };

  if ("IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px 40px 0px" });
  }

  document.body.classList.add("lux-motion-ready");
  decorate();

  let mutationFrame = 0;
  const mutationObserver = new MutationObserver(() => {
    if (mutationFrame) return;
    mutationFrame = window.requestAnimationFrame(() => {
      mutationFrame = 0;
      decorate(document);
    });
  });
  mutationObserver.observe(document.body, { childList: true, subtree: true });
}


function initPageTransition() {
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  // Clean up any transition classes on pageshow (e.g. back/forward navigation)
  window.addEventListener('pageshow', () => {
    document.body.classList.remove('lux-page-leaving');
    document.body.classList.remove('lux-page-entering');
  });
}

initMotionSystem();
initMiniCartPreview();
initPageTransition();

window.LuxRoom = {
  products,
  cartItems,
  wishlistItems,
  deliveryPreferences,
  deliveryLocations: DELIVERY_LOCATIONS,
  addToCart,
  updateCartItem,
  clearCart,
  showToast,
  isWishlisted,
  getProduct,
  getVariant,
  getArrivalWindow,
  getCartTotals,
  updateDeliveryPreferences,
  formatMoney,
};
window.toggleWishlist = toggleWishlist;
persistCart();
syncCartCount();
syncWishlistBadge();
injectContextualBackLink();

const searchButtons = document.querySelectorAll('button[aria-label="Search"], .icon-button[aria-label="Search"]');
const searchOverlay = document.getElementById("global-search-overlay");
const closeSearch = document.getElementById("close-search");
if (searchOverlay) {
  const searchInput = document.getElementById("global-search-input");
  let searchDropdown = searchOverlay.querySelector(".search-dropdown");
  if (!searchDropdown) {
    searchDropdown = document.createElement("div");
    searchDropdown.className = "search-dropdown";
    searchOverlay.querySelector(".search-modal")?.appendChild(searchDropdown);
  }

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const searchableText = (product) => [
    product.name,
    product.category,
    product.room,
    product.materialGroup,
    product.collection,
    product.style,
    ...product.colors,
    ...product.materials,
    ...product.variants.flatMap((variant) => [variant.finish, variant.material, variant.color]),
  ].join(" ").toLowerCase();

  const renderSearchResults = (rawQuery = "") => {
    const query = rawQuery.trim().toLowerCase();
    const results = products
      .filter((product) => !query || searchableText(product).includes(query))
      .slice(0, 4);
    const categories = unique(products.map((product) => product.category))
      .filter((category) => !query || category.toLowerCase().includes(query))
      .slice(0, 4);
    const collections = unique(products.map((product) => product.collection))
      .filter((collection) => !query || collection.toLowerCase().includes(query))
      .slice(0, 3);

    const productMarkup = results.length
      ? results.map((product) => `<a class="search-item" href="detail.html?product=${product.id}">
          <span class="search-item-img" style="background-image:url('${product.image}')" aria-hidden="true"></span>
          <span class="search-item-info"><strong>${escapeHtml(product.name)}</strong><span>${escapeHtml(product.category)} / ${escapeHtml(product.room)}</span></span>
          <span class="search-item-price">${formatMoney(product.price)}</span>
        </a>`).join("")
      : `<div class="search-empty"><strong>No pieces found.</strong><span>Try another material, room or collection.</span></div>`;

    const discoveryLinks = [
      ...categories.map((category) => ({ label: category, href: `products.html?category=${encodeURIComponent(category)}`, type: "Category" })),
      ...collections.map((collection) => ({ label: collection, href: `products.html?collection=${encodeURIComponent(collection)}`, type: "Collection" })),
    ];
    const discoveryMarkup = discoveryLinks.length
      ? discoveryLinks.map((item) => `<a class="search-discovery-link" href="${item.href}"><span>${escapeHtml(item.type)}</span><strong>${escapeHtml(item.label)}</strong><i aria-hidden="true">↗</i></a>`).join("")
      : `<a class="search-discovery-link" href="products.html"><span>Collection</span><strong>See every object</strong><i aria-hidden="true">↗</i></a>`;

    searchDropdown.innerHTML = `
      <section class="search-section"><h4>${query ? "Matching pieces" : "Suggested objects"}</h4>${productMarkup}</section>
      <section class="search-section"><h4>Categories & collections</h4>${discoveryMarkup}</section>`;
  };

  renderSearchResults();
  searchInput?.addEventListener("input", () => renderSearchResults(searchInput.value));
  searchInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    const firstResult = searchDropdown.querySelector("a[href]");
    if (firstResult) firstResult.click();
    else if (searchInput.value.trim()) window.location.href = `products.html?search=${encodeURIComponent(searchInput.value.trim())}`;
  });

  const setSearchOpen = (isOpen) => {
    searchOverlay.classList.toggle("show", isOpen);
    document.body.classList.toggle("lux-search-open", isOpen);
    if (isOpen) {
      requestAnimationFrame(() => {
        searchInput?.focus({ preventScroll: true });
      });
    }
  };
  const toggleSearch = (event) => {
    event?.preventDefault();
    setSearchOpen(!searchOverlay.classList.contains("show"));
  };
  searchButtons.forEach((button) => button.addEventListener("click", toggleSearch));
  closeSearch?.addEventListener("click", toggleSearch);
  searchOverlay.addEventListener("click", (event) => {
    if (event.target === searchOverlay) toggleSearch(event);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && searchOverlay.classList.contains("show")) toggleSearch(event);
  });
}
