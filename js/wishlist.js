const wishlistGrid = document.querySelector("#wishlist-grid");
const wishlistEmpty = document.querySelector("#wishlist-empty");
const wishlistTotal = document.querySelector("[data-wishlist-total]");
const moveAllButton = document.querySelector("#move-all-to-cart");
const wishlistTotalValue = document.querySelector("#wishlist-total-value");
const shareRoomButton = document.querySelector("#share-room");
const consultationLink = document.querySelector("#request-consultation");

const heights = [400, 320, 240, 280, 480, 260, 360, 440];

function renderWishlist() {
  const ids = window.LuxRoom.wishlistItems;
  const products = ids.map((id) => window.LuxRoom.products.find((p) => p.id === id)).filter(Boolean);

  if (wishlistTotal) wishlistTotal.textContent = String(products.length);
  if (moveAllButton) moveAllButton.disabled = products.length === 0;
  if (shareRoomButton) shareRoomButton.disabled = products.length === 0;
  if (wishlistTotalValue) wishlistTotalValue.textContent = window.LuxRoom.formatMoney(products.reduce((sum, product) => sum + product.variants[0].price, 0));
  if (consultationLink) consultationLink.href = `contact.html?topic=room&pieces=${products.map((product) => product.id).join(",")}`;

  if (products.length === 0) {
    if (wishlistGrid) wishlistGrid.innerHTML = "";
    if (wishlistEmpty) wishlistEmpty.style.display = "block";
    return;
  }

  if (wishlistEmpty) wishlistEmpty.style.display = "none";
  if (!wishlistGrid) return;

  wishlistGrid.innerHTML = products
    .map(
      (product, index) => `
    <article class="product-card" style="animation-delay: ${index * 0.05}s">
      <div class="product-card-inner">
        <a href="./detail.html?product=${product.id}" class="product-thumb ${product.tone}" style="height: ${heights[index % heights.length]}px;background-image:url('${product.image}')" aria-label="View ${product.name}"></a>
        <div class="product-info-wrapper">
          <div class="product-meta-row">
            <h3>${product.name}</h3>
            <span class="price">$${product.price}</span>
            <small>${product.dimensions.width} × ${product.dimensions.depth} cm, ${product.variants.length} finishes</small>
          </div>
          <div class="product-actions-row">
            <button class="move-to-cart-action" onclick="window.wishlistMoveToCart(${product.id})" type="button">
              Move to cart <span aria-hidden="true">↗</span>
            </button>
            <button class="remove-wishlist-action" data-remove-wishlist="${product.id}" onclick="window.wishlistRemove(${product.id})" type="button" aria-label="Remove from wishlist">
              <span aria-hidden="true">♡</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  `,
    )
    .join("");
}

window.wishlistRemove = function(productId) {
  window.toggleWishlist(productId);
};

window.wishlistMoveToCart = function(productId) {
  window.LuxRoom.addToCart(productId, 1);
  window.toggleWishlist(productId);
};

window.wishlistMoveAllToCart = function() {
  const ids = window.LuxRoom.wishlistItems.slice();
  for (const id of ids) {
    window.LuxRoom.addToCart(id, 1);
    window.toggleWishlist(id);
  }
};

if (moveAllButton) {
  moveAllButton.addEventListener("click", window.wishlistMoveAllToCart);
}

async function shareRoom() {
  const ids = window.LuxRoom.wishlistItems.slice();
  if (!ids.length) return;
  const url = new URL("wishlist.html", window.location.href);
  url.searchParams.set("saved", ids.join(","));
  const shareData = { title: "A room from LuxRoom", text: "Pieces kept together for a considered room.", url: url.href };
  if (navigator.share) {
    try { await navigator.share(shareData); } catch (error) { if (error.name !== "AbortError") window.LuxRoom.showToast("The room could not be shared just now."); }
    return;
  }
  try {
    await navigator.clipboard.writeText(url.href);
    window.LuxRoom.showToast("Room link copied.");
  } catch {
    window.LuxRoom.showToast("Copy this page address to share your room.");
  }
}

function applySharedRoom() {
  const sharedIds = (new URLSearchParams(window.location.search).get("saved") || "")
    .split(",").map(Number).filter((id) => window.LuxRoom.getProduct(id));
  sharedIds.forEach((id) => {
    if (!window.LuxRoom.isWishlisted(id)) window.toggleWishlist(id);
  });
}

shareRoomButton?.addEventListener("click", shareRoom);
document.addEventListener("wishlist-updated", renderWishlist);
applySharedRoom();
renderWishlist();
