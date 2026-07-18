// Sync the locally-built standalone bundle to the cPanel server and restart Passenger.
// Build must run separately (npm run build + assemble-deploy-bundle.js) so build
// errors stay inspectable. This script only ships the already-built artifact.
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const zipPath = path.join(root, 'deploy_bundle.zip');

// Load local .env (gitignored) so deploy secrets stay out of the script.
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

const DEPLOY_HOST = process.env.DEPLOY_HOST;
const DEPLOY_PORT = process.env.DEPLOY_PORT || '65002';
const DEPLOY_USER = process.env.DEPLOY_USER;
const DEPLOY_PASS = process.env.DEPLOY_PASS;
const DEPLOY_DIR = process.env.DEPLOY_DIR;

function fail(message) {
  console.error('DEPLOY FAILED: ' + message);
  process.exit(1);
}

if (!DEPLOY_HOST || !DEPLOY_USER || !DEPLOY_PASS || !DEPLOY_DIR) {
  fail('Set DEPLOY_HOST, DEPLOY_USER, DEPLOY_PASS, DEPLOY_DIR in .env (local, gitignored).');
}
if (!fs.existsSync(zipPath)) {
  fail('deploy_bundle.zip not found. Run: npm run build && node scripts/assemble-deploy-bundle.js');
}
if (!fs.existsSync(PSCP) || !fs.existsSync(PLINK)) {
  fail('PuTTY tools missing at ' + PUTTY_DIR);
}

const baseArgs = ['-P', DEPLOY_PORT, '-pw', DEPLOY_PASS];
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

const remoteScript = `set -e
DOM=${DEPLOY_DIR}
rm -rf $DOM/nodejs_new
mkdir -p $DOM/nodejs_new
cd $DOM/nodejs_new
unzip -oq /home/${DEPLOY_USER}/deploy_bundle.zip
cp -a $DOM/nodejs/.env $DOM/nodejs_new/.env
cp -a $DOM/nodejs/data $DOM/nodejs_new/data
if [ -d $DOM/nodejs_old ]; then rm -rf $DOM/nodejs_old; fi
mv $DOM/nodejs $DOM/nodejs_old
mv $DOM/nodejs_new $DOM/nodejs
chmod 600 $DOM/nodejs/.env
mkdir -p $DOM/nodejs/tmp
touch $DOM/nodejs/tmp/restart.txt
echo SWAP_OK`;

console.log('Uploading deploy_bundle.zip ...');
runPscp(zipPath, `/home/${DEPLOY_USER}/deploy_bundle.zip`);

console.log('Swapping on server + restarting Passenger ...');
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
    req.setTimeout(30000, () => req.destroy(new Error('timeout')));
  });
}

(async () => {
  await new Promise((r) => setTimeout(r, 30000));
  try {
    const login = await httpsGet('/login');
    const me = await httpsGet('/api/auth/me');
    if (login.status !== 200) fail(`/login returned HTTP ${login.status}`);
    if (!me.body.includes('Unauthorized')) fail(`/api/auth/me unexpected: ${me.body}`);
    console.log('VERIFIED: app live (login 200, auth/me Unauthorized as expected).');
    console.log('Deploy complete. Old build kept at nodejs_old for rollback.');
  } catch (err) {
    console.error('Verification error: ' + err.message);
    console.log('Rolling back to nodejs_old ...');
    runPlink(`set -e
DOM=${DEPLOY_DIR}
rm -rf $DOM/nodejs
mv $DOM/nodejs_old $DOM/nodejs
mkdir -p $DOM/nodejs/tmp
touch $DOM/nodejs/tmp/restart.txt
echo ROLLBACK_OK`);
    fail('rolled back due to verification failure');
  }
})();
