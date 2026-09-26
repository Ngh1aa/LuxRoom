import { cp, mkdir, readdir, readFile, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');

const ROOT_RUNTIME_EXTS = new Set([
  '.html', '.htm', '.js', '.mjs', '.css', '.ico', '.svg', '.xml', '.txt', '.webmanifest'
]);
const STATIC_DIRS = ['css', 'js', 'fonts', 'public'];
const ALWAYS_IMAGE_DIRS = ['img/logo', 'img/feedback'];
const MODERN_IMAGE_EXTS = new Set(['.webp', '.avif', '.svg', '.gif', '.ico']);
const LEGACY_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
const TEXT_EXTS = new Set(['.html', '.htm', '.css', '.js', '.mjs', '.json', '.svg', '.xml', '.txt']);

const posix = (value) => value.split(path.sep).join('/');

async function exists(target) {
  try {
    await stat(target);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  if (!(await exists(dir))) return [];
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listFiles(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

async function copyFilePreservingPath(source) {
  const relative = path.relative(root, source);
  const target = path.join(dist, relative);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target);
}

async function copyDirectoryIfPresent(relativeDir) {
  const source = path.join(root, relativeDir);
  if (!(await exists(source))) return;
  await cp(source, path.join(dist, relativeDir), { recursive: true });
}

async function runtimeCorpus() {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    if (entry.isFile() && ROOT_RUNTIME_EXTS.has(path.extname(entry.name).toLowerCase())) {
      files.push(path.join(root, entry.name));
    }
  }
  for (const relativeDir of STATIC_DIRS) {
    for (const file of await listFiles(path.join(root, relativeDir))) {
      if (TEXT_EXTS.has(path.extname(file).toLowerCase())) files.push(file);
    }
  }
  const chunks = await Promise.all(files.map(async (file) => {
    try {
      return await readFile(file, 'utf8');
    } catch {
      return '';
    }
  }));
  return chunks.join('\n');
}

function isInAlwaysImageDir(relative) {
  return ALWAYS_IMAGE_DIRS.some((dir) => relative === dir || relative.startsWith(`${dir}/`));
}

async function shouldCopyImage(file, corpus, allImageFiles) {
  const relative = posix(path.relative(root, file));
  const ext = path.extname(file).toLowerCase();

  if (isInAlwaysImageDir(relative)) return true;
  if (MODERN_IMAGE_EXTS.has(ext)) return true;
  if (!LEGACY_IMAGE_EXTS.has(ext)) return true;

  const basename = path.basename(file);
  if (
    corpus.includes(relative) ||
    corpus.includes(relative.replace(/^img\//, '')) ||
    corpus.includes(basename)
  ) {
    return true;
  }

  const withoutExt = file.slice(0, -ext.length);
  const hasModernSibling = [...MODERN_IMAGE_EXTS].some((modernExt) =>
    allImageFiles.has(`${withoutExt}${modernExt}`)
  );

  // Drop only redundant source images: never referenced by runtime code and already backed by an optimized sibling.
  return !hasModernSibling;
}

async function byteSize(target) {
  let total = 0;
  for (const file of await listFiles(target)) total += (await stat(file)).size;
  return total;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// Preserve every existing top-level route and runtime script/style byte-for-byte.
for (const entry of await readdir(root, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  if (!ROOT_RUNTIME_EXTS.has(path.extname(entry.name).toLowerCase())) continue;
  await copyFilePreservingPath(path.join(root, entry.name));
}

for (const relativeDir of STATIC_DIRS) await copyDirectoryIfPresent(relativeDir);

const corpus = await runtimeCorpus();
const imageRoot = path.join(root, 'img');
const imageFiles = await listFiles(imageRoot);
const imageSet = new Set(imageFiles);
let copiedImages = 0;
let skippedLegacyImages = 0;

for (const file of imageFiles) {
  if (await shouldCopyImage(file, corpus, imageSet)) {
    await copyFilePreservingPath(file);
    copiedImages += 1;
  } else {
    skippedLegacyImages += 1;
  }
}

const totalBytes = await byteSize(dist);
console.log(`Built dist/: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
console.log(`Images copied: ${copiedImages}; redundant legacy images skipped: ${skippedLegacyImages}`);
