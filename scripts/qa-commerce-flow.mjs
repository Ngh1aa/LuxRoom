import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const requirements = {
  "products.html": ["Size", "Availability", "Delivery", "data-category=\"Lighting\"", "data-category=\"Storage\""],
  "detail.html": ["dimension-visual", "detail-arrival", "finish-options", "Delivery &amp; returns", "mobile-add-to-cart", "added-confirmation"],
  "cart.html": ["cart-delivery-location", "cart-shipping", "checkout.html"],
  "checkout.html": ["id=\"phone\"", "id=\"province\"", "id=\"district\"", "id=\"ward\"", "deliveryMethod", "paymentMethod", "review-step"],
  "success.html": ["success-order-id", "success-arrival", "track-order-link", "success-timeline"],
  "tracking.html": ["tracking-current-status", "tracking-timeline", "tracking-items"],
  "wishlist.html": ["wishlist-total-value", "move-all-to-cart", "share-room", "request-consultation"],
  "js/common.js": ["variantId", "leadTimeMin", "deliveryPreferences", "getArrivalWindow", "getCartTotals"],
  "js/cart.js": ["cart-row cart-item", "cart-product cart-item-product", "cart-product-image cart-item-image", "cart-qty cart-item-quantity", "cart-item-total", "cart-remove cart-item-remove"],
  "js/checkout.js": ["luxroom-last-order", "luxroom-orders", "createOrder", "combinedArrivalWindow"],
};

let assertions = 0;
for (const [file, tokens] of Object.entries(requirements)) {
  const source = await readFile(resolve(root, file), "utf8");
  for (const token of tokens) {
    if (!source.includes(token)) throw new Error(`${file}: missing commerce requirement ${token}`);
    assertions += 1;
  }
}

const detail = await readFile(resolve(root, "detail.html"), "utf8");
const checkout = await readFile(resolve(root, "checkout.html"), "utf8");
if (detail.includes("Available on request")) throw new Error("PDP still contains placeholder dimensions.");
if (/postal code/i.test(checkout)) throw new Error("Checkout still prioritizes postal code for the Vietnam address flow.");

console.log(`PASS: ${assertions + 2} P0/P1 commerce-flow assertions.`);
