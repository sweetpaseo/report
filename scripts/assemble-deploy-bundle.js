// Next traces the standalone payload under outputFileTracingRoot, so the real
// app ends up in a nested Desktop/... path. Flatten it into a single nodejs/ layout.
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const root = path.join(__dirname, '..');
const standaloneRoot = path.join(root, '.next', 'standalone');
const legacyPayload = path.join(standaloneRoot, 'Desktop', 'antigravity', 'gr', 'website-health-report');
const payload = fs.existsSync(path.join(standaloneRoot, 'server.js')) ? standaloneRoot : legacyPayload;
const staticDir = path.join(root, '.next', 'static');
const out = path.join(root, 'deploy_bundle');

if (fs.existsSync(out)) fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const copyEntries = ['server.js', 'package.json', 'node_modules', '.next'];
for (const entry of copyEntries) {
  const src = path.join(payload, entry);
  if (!fs.existsSync(src)) {
    throw new Error(`Expected payload entry missing: ${src}`);
  }
  fs.cpSync(src, path.join(out, entry), { recursive: true });
}

function findHashedExternals(dir) {
  const result = new Set();
  const visit = (current) => {
    for (const item of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, item.name);
      if (item.isDirectory()) {
        visit(fullPath);
        continue;
      }
      if (!item.name.endsWith('.js')) continue;
      const content = fs.readFileSync(fullPath, 'utf8');
      const matches = content.matchAll(/require\(["']([a-z0-9._-]+-[a-f0-9]{16})["']\)/gi);
      for (const match of matches) result.add(match[1]);
    }
  };
  visit(dir);
  return [...result];
}

function copyHashedExternalAliases() {
  const aliases = findHashedExternals(path.join(out, '.next', 'server'));
  for (const alias of aliases) {
    const sourceName = alias.replace(/-[a-f0-9]{16}$/i, '');
    const source = path.join(root, 'node_modules', sourceName);
    const target = path.join(out, 'node_modules', alias);
    if (!fs.existsSync(source) || fs.existsSync(target)) continue;
    fs.cpSync(source, target, { recursive: true });
    console.log(`Added external alias ${alias} -> ${sourceName}`);
  }
}

copyHashedExternalAliases();

if (fs.existsSync(staticDir)) {
  fs.cpSync(staticDir, path.join(out, '.next', 'static'), { recursive: true });
}

console.log('Bundle assembled at', out);
function dirSize(dir) {
  let sum = 0;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) sum += dirSize(p);
    else sum += fs.statSync(p).size;
  }
  return sum;
}
console.log('Bundle size (MB):', (dirSize(out) / 1048576).toFixed(1));

const zipPath = path.join(root, 'deploy_bundle.zip');
const output = fs.createWriteStream(zipPath);
const archive = archiver('zip', { zlib: { level: 9 } });
archive.pipe(output);
archive.directory(out, false);
archive.finalize();
output.on('close', () => {
  console.log('Zip ready:', zipPath, '(', (archive.pointer() / 1048576).toFixed(1), 'MB )');
});
