const path = require('path');
const dir = '/home/u544113687/domains/report.erihome.id/nodejs';
process.chdir(dir);
process.env.NODE_ENV = 'production';
const Module = require('module');
Module.globalPaths.unshift(path.join(dir, 'node_modules'));
Module._initPaths();

// Load the SAME server.js logic but intercept startServer
// Read server.js content and patch startServer to print env before calling it
const fs = require('fs');

// First, check if there is env loading in the Next.js standalone server code
// by looking at server.js itself
const serverContent = fs.readFileSync(path.join(dir, 'server.js'), 'utf8');

// Search for any env loading patterns in server.js
const lines = serverContent.split('\n');
for (let i = 0; i < lines.length; i++) {
  const line = lines[i].toLowerCase();
  if (line.includes('env') && (line.includes('load') || line.includes('config') || line.includes('dotenv'))) {
    console.log('server.js line ' + (i+1) + ': ' + lines[i].trim());
  }
}

// Also check what the compiled server does
// The key: in Next.js standalone, env is loaded by the server bootstrap
// Let's intercept process.env before and after require('next/dist/server/lib/start-server')
console.log('=== Intercepting startServer ===');
const originalStartServer = require('next/dist/server/lib/start-server');
console.log('startServer type:', typeof originalStartServer.startServer);
console.log('env BEFORE startServer import was complete:');
console.log('  ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));

// Monkey-patch to check env during startup
const origChdir = process.chdir;
let envChecked = false;
process.chdir = function(d) {
  origChdir.call(process, d);
  if (!envChecked) {
    envChecked = true;
    console.log('env AFTER process.chdir(' + d + '):');
    console.log('  ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));
    console.log('  CLIENT_PASSWORD:', JSON.stringify(process.env.CLIENT_PASSWORD));
  }
};

// Now try to start and immediately exit
const { startServer } = originalStartServer;
startServer({
  dir,
  isDev: false,
  config: JSON.parse(serverContent.match(/const nextConfig = ({.*?})\n/s)?.[1] || '{}'),
  hostname: '0.0.0.0',
  port: 13999,
}).then(() => {
  console.log('AFTER startServer resolved:');
  console.log('  ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));
  console.log('  CLIENT_PASSWORD:', JSON.stringify(process.env.CLIENT_PASSWORD));
  // Shutdown immediately
  process.exit(0);
}).catch(e => {
  console.log('startServer error:', e.message);
  process.exit(1);
});

setTimeout(() => {
  console.log('TIMEOUT - checking env:');
  console.log('  ADMIN_PASSWORD:', JSON.stringify(process.env.ADMIN_PASSWORD));
  console.log('  CLIENT_PASSWORD:', JSON.stringify(process.env.CLIENT_PASSWORD));
  process.exit(0);
}, 5000);
