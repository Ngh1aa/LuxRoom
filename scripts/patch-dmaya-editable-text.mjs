import fs from 'node:fs';
import path from 'node:path';

const [inputArg, outputArg] = process.argv.slice(2);
if (!inputArg) {
  console.error('Usage: node scripts/patch-dmaya-editable-text.mjs <input.json> [output.json]');
  process.exit(1);
}

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(
  process.cwd(),
  outputArg || inputArg.replace(/(\.json)?$/i, '-editable-text.json')
);

const payload = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const px = (value, fallback = 0) => {
  if (typeof value === 'number') return value;
  const match = String(value ?? '').match(/^\s*(-?\d+(?:\.\d+)?)px\s*$/i);
  return match ? Number(match[1]) : fallback;
};

const parseWeight = (value) => {
  const numeric = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(numeric) ? numeric : 400;
};

const rgbObject = (value) => {
  const match = String(value ?? '').match(
    /rgb\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*\)/i
  );
  if (!match) return { r: 20 / 255, g: 20 / 255, b: 20 / 255 };
  return {
    r: Number(match[1]) / 255,
    g: Number(match[2]) / 255,
    b: Number(match[3]) / 255,
  };
};

const isRasterTextFrame = (node) =>
  node &&
  node.type === 'FRAME' &&
  Array.isArray(node.children) &&
  node.children.length > 0 &&
  node.children.every((child) => child?.type === 'IMAGE' && child?.name === 'Text icon');

let converted = 0;

const patchNode = (node) => {
  if (Array.isArray(node)) return node.map(patchNode);
  if (!node || typeof node !== 'object') return node;

  if (isRasterTextFrame(node)) {
    const css = node.css || {};
    const color = css.color || css.webkitTextFillColor || 'rgb(20, 20, 20)';
    const fontSize = px(css.fontSize, 16);
    const lineHeight = px(css.lineHeight, fontSize * 1.2);
    const letterSpacing = css.letterSpacing === 'normal' || css.letterSpacing == null
      ? 0
      : px(css.letterSpacing, 0);

    let fontFamily = css.fontFamily || '"DM Sans", Inter, Arial, sans-serif';
    if (fontFamily.toLowerCase().includes('newsreader')) {
      fontFamily = '"DM Sans", Inter, Arial, sans-serif';
    }

    const characters = String(node.name || '').trim();
    converted += 1;

    return {
      id: node.id,
      type: 'TEXT',
      name: characters,
      x: node.x ?? 0,
      y: node.y ?? 0,
      width: node.width ?? 0,
      height: node.height ?? 0,
      opacity: node.opacity ?? 1,
      fills: [{ type: 'SOLID', color }],
      characters,
      textStyle: {
        fontFamily,
        fontSize,
        fontWeight: parseWeight(css.fontWeight),
        fontStyle: 'normal',
        lineHeight,
        letterSpacing,
        textAlign: 'start',
        textDecoration: 'none',
      },
      sourceUid: node.sourceUid,
      confidence: 95,
      importPlan: {
        fills: [{ type: 'SOLID', color: rgbObject(color), opacity: 1 }],
        effects: [],
        borders: null,
        clip: {
          enabled: false,
          reason: '',
          useContentClipFrame: false,
          useMask: false,
          inferred: false,
        },
        layout: {
          autoLayout: {
            enabled: false,
            layoutMode: 'HORIZONTAL',
            primaryAxisSizingMode: 'FIXED',
            counterAxisSizingMode: 'FIXED',
            primaryAxisAlignItems: 'MIN',
            counterAxisAlignItems: 'MIN',
            itemSpacing: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
          },
          centerSingleTextChild: { enabled: false },
        },
        text: {
          decoration: 'NONE',
          resizeMode: 'HEIGHT',
          width: node.width ?? 0,
          height: node.height ?? 0,
          preserveWidth: true,
        },
      },
    };
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, patchNode(value)])
  );
};

payload.document = patchNode(payload.document);

const countRasterText = (node) => {
  if (Array.isArray(node)) return node.reduce((sum, item) => sum + countRasterText(item), 0);
  if (!node || typeof node !== 'object') return 0;
  const current = node.type === 'IMAGE' && node.name === 'Text icon' ? 1 : 0;
  return current + Object.values(node).reduce((sum, value) => sum + countRasterText(value), 0);
};

const remaining = countRasterText(payload.document);
fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2));

console.log(`Patched ${converted} rasterized text frames into native TEXT nodes.`);
console.log(`Remaining Text icon IMAGE nodes: ${remaining}`);
console.log(`Output: ${outputPath}`);

if (remaining > 0) process.exitCode = 2;
