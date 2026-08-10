const ftp = require('basic-ftp');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

async function run() {
  const c = new ftp.Client(10000);
  console.log('Connecting to FTP 145.79.14.119:21 ...');
  await c.access({ host: '145.79.14.119', port: 21, user: 'u544113687', password: 'Erihome197!' });
  console.log('FTP Connected!');

  console.log('--- Inspecting report.erihome.id .htaccess ---');
  try {
    const f1 = path.join(root, 'temp_report_htaccess');
    await c.downloadTo(f1, '/domains/report.erihome.id/public_html/.htaccess');
    console.log(fs.readFileSync(f1, 'utf8'));
    fs.unlinkSync(f1);
  } catch (e) {
    console.log('Error downloading report .htaccess:', e.message);
  }

  console.log('--- Inspecting report.erihome.id stderr.log ---');
  try {
    const f2 = path.join(root, 'temp_report_stderr.log');
    await c.downloadTo(f2, '/domains/report.erihome.id/nodejs/stderr.log');
    const logs = fs.readFileSync(f2, 'utf8').split('\n');
    console.log(logs.slice(-30).join('\n'));
    fs.unlinkSync(f2);
  } catch (e) {
    console.log('Error downloading stderr.log:', e.message);
  }

  console.log('--- Inspecting report.erihome.id console.log ---');
  try {
    const f3 = path.join(root, 'temp_report_console.log');
    await c.downloadTo(f3, '/domains/report.erihome.id/nodejs/console.log');
    const logs = fs.readFileSync(f3, 'utf8').split('\n');
    console.log(logs.slice(-20).join('\n'));
    fs.unlinkSync(f3);
  } catch (e) {
    console.log('Error downloading console.log:', e.message);
  }

  c.close();
}

run().catch((e) => console.error('FTP ERROR:', e.message));
