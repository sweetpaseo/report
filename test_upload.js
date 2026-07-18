const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
let body = '';

const addField = (name, value) => {
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="' + name + '"\r\n\r\n';
  body += value + '\r\n';
};

const addFile = (name, filename, content) => {
  body += '--' + boundary + '\r\n';
  body += 'Content-Disposition: form-data; name="' + name + '"; filename="' + filename + '"\r\n';
  body += 'Content-Type: text/csv\r\n\r\n';
  body += content + '\r\n';
};

addField('websiteId', '6312dda6-b63e-4989-9a12-da7d1d87d212'); 
addField('isAiGen', 'true');
addFile('file', 'Bagan.csv', 'Tanggal,Tayangan,Klik,CTR,Posisi\n2023-01-01,100,10,10%,1');
addFile('file', 'Halaman.csv', 'Halaman,Tayangan,Klik,CTR,Posisi\n/home,100,10,10%,1');
addFile('file', 'Negara.csv', 'Negara,Tayangan,Klik,CTR,Posisi\nIndonesia,100,10,10%,1');
addFile('file', 'Perangkat.csv', 'Perangkat,Tayangan,Klik,CTR,Posisi\nDesktop,100,10,10%,1');
addFile('file', 'Filter.csv', 'Filter,Tayangan,Klik,CTR,Posisi\nAI,100,10,10%,1');

body += '--' + boundary + '--\r\n';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(body),
    'x-requested-with': 'XMLHttpRequest',
    'Cookie': 'auth-session-id=5441e88e-64cc-4299-bb33-6a9c1d2e1c94' // Use any value if not mocked
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Body:', data));
});

req.on('error', e => console.error(e));
req.write(body);
req.end();
