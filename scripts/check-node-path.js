const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const tempFile = path.join(root, 'temp_check_node.php');

const phpCode = `<?php
echo "NODE_WHICH: " . shell_exec("which node 2>&1") . "\\n";
echo "NODE_WHEREIS: " . shell_exec("whereis node 2>&1") . "\\n";
echo "OPT_ALT: " . shell_exec("ls -la /opt/alt/ 2>&1") . "\\n";
echo "NODE_VERSIONS: " . shell_exec("ls -la /opt/alt/alt-nodejs* /opt/alt/alt-nodejs*/root/bin/node 2>&1") . "\\n";
`;

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
  fs.writeFileSync(tempFile, phpCode, 'utf8');

  const c = new ftp.Client(10000);
  await c.access({ host: '145.79.14.119', port: 21, user: 'u544113687', password: 'Erihome197!' });
  const remotePath = '/domains/erihome.id/public_html/check_node.php';
  await c.uploadFrom(tempFile, remotePath);
  c.close();
  fs.unlinkSync(tempFile);

  console.log('Fetching Node path diagnostic from erihome.id...');
  const res = await httpsGet('https://erihome.id/check_node.php');
  console.log('DIAGNOSTIC STATUS:', res.status);
  console.log('DIAGNOSTIC BODY:\n', res.body);

  // Clean up
  const cleanup = new ftp.Client(10000);
  await cleanup.access({ host: '145.79.14.119', port: 21, user: 'u544113687', password: 'Erihome197!' });
  await cleanup.remove(remotePath).catch(() => {});
  cleanup.close();
}

run().catch((e) => console.error(e));
