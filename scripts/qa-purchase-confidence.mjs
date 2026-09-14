import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const read = (path) => readFile(resolve(root, path), "utf8");

const files = {
  module: await read("js/confidence-layer.js"),
  css: await read("css/confidence-layer.css"),
  compare: await read("compare.html"),
  saved: await read("saved-room.html"),
  init: await read("js/ui-feedback-init.js"),
  contract: await read("docs/DESIGN-CONTRACT-PURCHASE-CONFIDENCE.md"),
};

const checks = [
  ["confidence module wired globally", files.init.includes("confidence-layer.js")],
  ["fit prototype function", files.module.includes("function getFitGuidance")],
  ["fit likely guidance", files.module.includes('label: "Likely fits"')],
  ["fit doorway guidance", files.module.includes('label: "Check doorway clearance"')],
  ["fit confirm guidance", files.module.includes('label: "Needs confirmation"')],
  ["fit disclaimer", files.module.includes("not an architectural or delivery guarantee")],
  ["compare max 3", files.module.includes("const MAX_COMPARE = 3")],
  ["compare storage", files.module.includes("luxroom-compare")],
  ["saved room storage", files.module.includes("luxroom-saved-room")],
  ["saved room browser truth label", files.saved.includes("Saved locally · no account sync")],
  ["compare browser truth label", files.compare.includes("Prototype state · this browser only")],
  ["compare required evidence dimensions", files.module.includes('["Dimensions"')],
  ["compare required evidence material", files.module.includes('["Material"')],
  ["compare required evidence finish", files.module.includes('["Finish"')],
  ["compare required evidence capacity", files.module.includes('["Seating capacity"')],
  ["compare required evidence lead time", files.module.includes('["Lead time"')],
  ["compare required evidence delivery", files.module.includes('["Delivery"')],
  ["compare required evidence care", files.module.includes('["Care"')],
  ["compare required evidence warranty", files.module.includes('["Warranty"')],
  ["PDP designer metadata", files.module.includes("<dt>Designer</dt>")],
  ["PDP collection metadata", files.module.includes("<dt>Collection</dt>")],
  ["technical drawing prototype label", files.module.includes("Technical drawing / prototype")],
  ["download specification action", files.module.includes("Download specification")],
  ["consultation action", files.module.includes("Consult about this piece")],
  ["reduced motion respected", files.css.includes("@media (prefers-reduced-motion: no-preference)")],
  ["planned validation truthful", files.contract.includes("PLANNED VALIDATION")],
  ["product reasoning user uncertainty", files.contract.includes("**User uncertainty**")],
  ["product reasoning trade-off", files.contract.includes("**Trade-off**")],
  ["product reasoning success signal", files.contract.includes("**Success signal**")],
];

const failed = checks.filter(([, pass]) => !pass);
if (failed.length) {
  for (const [name] of failed) console.error(`FAIL: ${name}`);
  throw new Error(`${failed.length} purchase-confidence QA checks failed.`);
}

console.log(`Purchase-confidence QA passed: ${checks.length} assertions.`);
