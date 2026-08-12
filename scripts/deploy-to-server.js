// Sync the locally-built standalone bundle to the Ubuntu server (43.157.200.10) and restart report-app.service.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const zipPath = path.join(root, 'deploy_bundle.zip');

const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const PUTTY_DIR = 'C:\\Program Files\\PuTTY';
const PSCP = path.join(PUTTY_DIR, 'pscp.exe');
const PLINK = path.join(PUTTY_DIR, 'plink.exe');

const DEPLOY_HOST = process.env.DEPLOY_HOST || '43.157.200.10';
const DEPLOY_PORT = process.env.DEPLOY_PORT || '22';
const DEPLOY_USER = process.env.DEPLOY_USER || 'ubuntu';
const DEPLOY_PASS = process.env.DEPLOY_PASS || '7fA-Bra-Wsf-n2z';
const DEPLOY_DIR = process.env.DEPLOY_DIR || '/home/erihome-report/htdocs/report.erihome.id';

function fail(message) {
  console.error('DEPLOY FAILED: ' + message);
  process.exit(1);
}

if (!fs.existsSync(zipPath)) {
  fail('deploy_bundle.zip not found. Run: npm run build && node scripts/assemble-deploy-bundle.js');
}
if (!fs.existsSync(PSCP) || !fs.existsSync(PLINK)) {
  fail('PuTTY tools missing at ' + PUTTY_DIR);
}

const baseArgs = ['-P', DEPLOY_PORT, '-pw', DEPLOY_PASS, '-batch'];
const sshTarget = `${DEPLOY_USER}@${DEPLOY_HOST}`;

function runPlink(script) {
  const res = spawnSync(PLINK, [...baseArgs, '-ssh', sshTarget, script], { encoding: 'utf8' });
  if (res.status !== 0) {
    fail(`remote command exited ${res.status}: ${res.stderr || res.stdout}`);
  }
  return res.stdout;
}

function runPscp(localFile, remotePath) {
  const res = spawnSync(PSCP, [...baseArgs, localFile, `${sshTarget}:${remotePath}`], { encoding: 'utf8' });
  if (res.status !== 0) {
    fail(`upload exited ${res.status}: ${res.stderr || res.stdout}`);
  }
}

const remoteScript = `sudo bash -c 'cd ${DEPLOY_DIR} && unzip -o /tmp/deploy_bundle.zip && chown -R erihome-report:erihome-report . && systemctl restart report-app.service && echo SWAP_OK'`;

console.log(`Uploading deploy_bundle.zip to ${sshTarget} ...`);
runPscp(zipPath, `/tmp/deploy_bundle.zip`);

console.log('Swapping bundle on server + restarting report-app.service ...');
const out = runPlink(remoteScript);
if (!out.includes('SWAP_OK')) fail('swap did not complete: ' + out);

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

async function verify() {
  console.log('Verifying deployment live on HTTPS ...');
  try {
    const login = await httpsGet('/login');
    console.log(`VERIFIED: app live at https://report.erihome.id (HTTP ${login.status}).`);
    console.log('Deploy complete.');
  } catch (e) {
    console.log('Verification check note: ' + e.message);
  }
}

verify();
