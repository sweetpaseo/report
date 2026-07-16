const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const rootDir = path.join(__dirname, '..');
const output = fs.createWriteStream(path.join(rootDir, 'source_for_hosting.zip'));
const archive = new ZipArchive({
  zlib: { level: 9 }
});

output.on('close', function() {
  console.log('Zip file created successfully with correct UNIX permissions: ' + archive.pointer() + ' total bytes');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

const ignoreFolders = ['node_modules', '.next', '.git', '.omo', 'scratch'];
const ignoreFiles = ['source_for_hosting.zip', 'deploy.zip', 'package-lock.json'];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (stat.isDirectory()) {
      if (!ignoreFolders.includes(file)) {
        // explicitly add directory to zip with permission 755
        archive.append(null, { name: relativePath + '/', mode: 0o755 });
        walkDir(fullPath);
      }
    } else {
      if (!ignoreFiles.includes(file) && !file.endsWith('.zip')) {
        // add file to zip with permission 644
        archive.file(fullPath, { name: relativePath, mode: 0o644 });
      }
    }
  }
}

walkDir(rootDir);
archive.finalize();
