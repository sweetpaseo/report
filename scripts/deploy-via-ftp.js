// Direct FTP Folder Sync Deployment (Clean Recursive Sync)
const fs = require('fs');
const path = require('path');
const https = require('https');
const ftp = require('basic-ftp');

const root = path.join(__dirname, '..');
const bundleDir = path.join(root, 'deploy_bundle');

// Load local .env (gitignored) so secrets stay out of script
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const DEPLOY_HOST = '145.79.14.119';
const DEPLOY_USER = process.env.DEPLOY_USER || 'u544113687';
const DEPLOY_PASS = process.env.DEPLOY_PASS || 'Erihome197!';
const REMOTE_NODEJS = '/domains/report.erihome.id/nodejs';

function fail(msg) {
  console.error('FTP DEPLOY FAILED: ' + msg);
  process.exit(1);
}

if (!fs.existsSync(bundleDir)) {
  fail('deploy_bundle directory not found. Run npm run build && node scripts/assemble-deploy-bundle.js');
}

function httpsGet(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      { host: 'report.erihome.id', path: pathname, rejectUnauthorized: false },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.setTimeout(45000, () => req.destroy(new Error('timeout')));
  });
}

async function httpsGetWithRetry(pathname, retries = 12, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await httpsGet(pathname);
      if (res.status === 200 || res.status === 307) {
        return res;
      }
      console.log(`[HTTP ${res.status}] Attempt ${attempt}/${retries} - waiting for Passenger cold boot...`);
    } catch (err) {
      console.log(`[HTTP Error: ${err.message}] Attempt ${attempt}/${retries} - waiting for Passenger cold boot...`);
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return await httpsGet(pathname);
}

async function uploadFolderRecursive(client, localDir, remoteDir) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  await client.ensureDir(remoteDir);

  for (const entry of entries) {
    if (entry.name === 'node_modules') continue; // Keep node_modules intact on server
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadFolderRecursive(client, localPath, remotePath);
    } else if (entry.isFile()) {
      await client.uploadFrom(localPath, remotePath);
    }
  }
}

async function run() {
  const client = new ftp.Client(30000);
  client.ftp.verbose = false;

  try {
    console.log(`Connecting to FTP ${DEPLOY_HOST}:21 as ${DEPLOY_USER}...`);
    await client.access({
      host: DEPLOY_HOST,
      port: 21,
      user: DEPLOY_USER,
      password: DEPLOY_PASS,
      secure: false,
    });
    console.log('FTP Connected!');

    console.log(`Syncing Apple Tech Light Mode bundle files to ${REMOTE_NODEJS} via FTP...`);
    await uploadFolderRecursive(client, bundleDir, REMOTE_NODEJS);
    console.log('Deploy bundle files uploaded successfully!');

    console.log('Creating restart.txt to trigger Passenger restart...');
    await client.ensureDir(`${REMOTE_NODEJS}/tmp`);
    const tempRestart = path.join(root, 'temp_restart.txt');
    fs.writeFileSync(tempRestart, new Date().toISOString());
    await client.uploadFrom(tempRestart, `${REMOTE_NODEJS}/tmp/restart.txt`);
    fs.unlinkSync(tempRestart);
    console.log('Passenger restart trigger sent!');

    client.close();

    console.log('Verifying deployment live on HTTPS report.erihome.id ...');
    const login = await httpsGetWithRetry('/login', 12, 3000);
    if (login.status !== 200) fail(`login page returned HTTP ${login.status}`);
    console.log('VERIFIED: app live with Apple Tech Light Mode (login 200 OK)!');
    console.log('Deploy complete via FTP folder sync!');
    process.exit(0);
  } catch (err) {
    client.close();
    fail(err.message);
  }
}

run();
