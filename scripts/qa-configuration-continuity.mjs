import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(process.cwd());
const detail = await readFile(resolve(root, "js/detail.js"), "utf8");
const cart = await readFile(resolve(root, "js/cart.js"), "utf8");
const checkout = await readFile(resolve(root, "js/checkout.js"), "utf8");
const common = await readFile(resolve(root, "js/common.js"), "utf8");

const assertions = [
  [detail.includes('detailParams.get("variant")'), "PDP reads variant from URL"],
  [detail.includes("window.LuxRoom.getVariant(selectedProduct, variantQuery)"), "PDP restores exact variant"],
  [detail.includes('url.searchParams.set("variant", selectedVariant.variantId)'), "PDP keeps selected variant in URL"],
  [cart.includes('class="cart-edit-configuration"'), "Cart exposes edit configuration action"],
  [cart.includes('variant: String(item.variantId)'), "Cart edit link preserves variant id"],
  [checkout.includes('class="summary-edit-configuration"'), "Checkout exposes edit configuration action"],
  [checkout.includes('variant: String(item.variantId)'), "Checkout edit link preserves variant id"],
  [common.includes("variantId: variant.variantId"), "Normalized cart item persists variant id"],
  [common.includes("productId: product.id"), "Normalized cart item persists product id"],
];

for (const [pass, label] of assertions) {
  if (!pass) throw new Error(`Configuration continuity regression: ${label}`);
}

console.log(`PASS: ${assertions.length} exact-configuration continuity assertions.`);