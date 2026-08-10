const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');
const https = require('https');

const root = path.join(__dirname, '..');
const tempHt = path.join(root, 'temp_ht_usrbin22');

const content = `PassengerAppRoot /home/u544113687/domains/report.erihome.id/nodejs
PassengerAppType node
PassengerNodejs /opt/alt/alt-nodejs22/root/usr/bin/node
PassengerStartupFile server.js
PassengerBaseURI /
PassengerRestartDir /home/u544113687/domains/report.erihome.id/nodejs/tmp

SetEnv LSNODE_CONSOLE_LOG console.log
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
  fs.writeFileSync(tempHt, content, 'utf8');

  const c = new ftp.Client(10000);
  await c.access({ host: '145.79.14.119', port: 21, user: 'u544113687', password: 'Erihome197!' });
  await c.uploadFrom(tempHt, '/domains/report.erihome.id/public_html/.htaccess');

  const tempRestart = path.join(root, 'temp_restart.txt');
  fs.writeFileSync(tempRestart, new Date().toISOString());
  await c.uploadFrom(tempRestart, '/domains/report.erihome.id/nodejs/tmp/restart.txt');

  c.close();
  fs.unlinkSync(tempHt);
  fs.unlinkSync(tempRestart);

  console.log('.htaccess updated to /opt/alt/alt-nodejs22/root/usr/bin/node! Testing HTTPS...');
  await new Promise((r) => setTimeout(r, 4000));
  const res = await httpsGet('https://report.erihome.id/login');
  console.log('REPORT LOGIN HTTP STATUS:', res.status);
  console.log('REPORT LOGIN BODY HEAD:\n', res.body.slice(0, 300));
}

run().catch((e) => console.error(e));
