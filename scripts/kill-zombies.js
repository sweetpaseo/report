const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const localIndex = path.join(root, 'temp_index_pkill.php');
const patchedIndex = path.join(root, 'temp_index_pkill_patched.php');

const code = `<?php
if (($_GET['kill'] ?? '') === '1') {
    exec("pkill -9 -u u544113687 -f node 2>&1", $o1);
    exec("killall -9 node 2>&1", $o2);
    die("KILLED_OK: " . implode(" ", array_merge($o1, $o2)));
}
?>`;

function httpsGet(urlStr) {
  return new Promise((resolve) => {
    https.get(urlStr, { rejectUnauthorized: false }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
  });
}

async function run() {
  const c = new ftp.Client(10000);
  await c.access({ host: '145.79.14.119', port: 21, user: 'u544113687', password: 'Erihome197!' });
  const remoteIndex = '/domains/kurniaprinting.com/public_html/index.php';
  await c.downloadTo(localIndex, remoteIndex);

  const orig = fs.readFileSync(localIndex, 'utf8');
  fs.writeFileSync(patchedIndex, code + '\n' + orig, 'utf8');
  await c.uploadFrom(patchedIndex, remoteIndex);

  console.log('Triggering zombie process cleanup...');
  const res = await httpsGet('https://kurniaprinting.com/?kill=1');
  console.log('PKILL RESULT:', res.status, res.body);

  await c.uploadFrom(localIndex, remoteIndex);
  c.close();

  if (fs.existsSync(localIndex)) fs.unlinkSync(localIndex);
  if (fs.existsSync(patchedIndex)) fs.unlinkSync(patchedIndex);
}

run().catch((e) => console.error(e));
