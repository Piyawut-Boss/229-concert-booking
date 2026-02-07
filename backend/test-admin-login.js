const http = require('http');

function testAdminLogin() {
  console.log('[TEST] Testing admin login endpoint...');
  
  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    host: 'localhost',
    port: 5000,
    path: '/api/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('✅ Login successful! Status:', res.statusCode);
        console.log('Response:', JSON.stringify(JSON.parse(data), null, 2));
      } else {
        console.log('❌ Login failed! Status:', res.statusCode);
        console.log('Response:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
  });

  req.write(postData);
  req.end();
}

testAdminLogin();
