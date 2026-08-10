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

const copyEntries = ['server.js', 'package.json', '.next'];
for (const entry of copyEntries) {
  const src = path.join(payload, entry);
  if (!fs.existsSync(src)) {
    throw new Error(`Expected payload entry missing: ${src}`);
  }
  fs.cpSync(src, path.join(out, entry), { recursive: true });
}

// Ensure .next/standalone/server.js exists for Hostinger Next.js Preset
const standaloneDir = path.join(out, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) fs.mkdirSync(standaloneDir, { recursive: true });
fs.cpSync(path.join(out, 'server.js'), path.join(standaloneDir, 'server.js'));
fs.cpSync(path.join(out, 'package.json'), path.join(standaloneDir, 'package.json'));

// Hostinger cPanel compatibility: Override package.json scripts & engines so hPanel "NPM Build" button exits clean 0
const pkgPath = path.join(out, 'package.json');
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.scripts = pkg.scripts || {};
  pkg.scripts.build = "echo 'Standalone bundle pre-built'";
  pkg.scripts.start = "node server.js";
  pkg.engines = pkg.engines || {};
  pkg.engines.node = ">=18.0.0";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
}

// Prepend threadpool limit & memory flags to prevent CloudLinux LVE uv_thread_create crash
const serverJsPath = path.join(out, 'server.js');
let serverJsContent = fs.readFileSync(serverJsPath, 'utf8');
if (!serverJsContent.includes('UV_THREADPOOL_SIZE')) {
  serverJsContent = "process.env.UV_THREADPOOL_SIZE = '1';\nprocess.env.NODE_OPTIONS = '--max-old-space-size=512';\n" + serverJsContent;
  fs.writeFileSync(serverJsPath, serverJsContent, 'utf8');
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

console.log('Assembling deploy_bundle.zip...');
const zipPath = path.join(root, 'deploy_bundle.zip');

function createZip() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Assembled bundle zip successfully: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(out, false);
    archive.finalize();
  });
}

createZip().catch((err) => {
  console.error('ZIP creation failed:', err);
  process.exit(1);
});
