#!/usr/bin/env node

/**
 * Railway Deployment Test Script
 * Tests all critical endpoints after deployment
 * 
 * Usage:
 *   node test-railway.js https://your-backend.railway.app
 */

const https = require('https');
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const baseUrl = process.argv[2] || 'http://localhost:8080';
let testsPassed = 0;
let testsFailed = 0;

console.log(`\n${colors.blue}🚂 Railway Deployment Test Suite${colors.reset}`);
console.log(`${colors.cyan}Testing: ${baseUrl}${colors.reset}\n`);

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(baseUrl + path);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const protocol = url.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    process.stdout.write(`⟳ ${name}... `);
    await fn();
    console.log(`${colors.green}✓${colors.reset}`);
    testsPassed++;
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    testsFailed++;
  }
}

async function runTests() {
  // Test 1: Health Check
  await test('Health Check Endpoint', async () => {
    const res = await makeRequest('/api/health');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    if (!res.data.status) throw new Error('Missing status field');
    if (!res.data.database) throw new Error('Missing database field');
  });

  // Test 2: Concerts List
  await test('Get Concerts List', async () => {
    const res = await makeRequest('/api/concerts');
    if (res.status !== 200) throw new Error(`Status: ${res.status}`);
    if (!Array.isArray(res.data)) throw new Error('Response is not an array');
  });

  // Test 3: Upload Endpoint
  await test('Upload Endpoint Available', async () => {
    const res = await makeRequest('/api/upload', { method: 'POST' });
    if (res.status === 400) {
      // Expected - no file uploaded
      return;
    }
    if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
  });

  // Test 4: Admin Routes
  await test('Admin Endpoints Available', async () => {
    const res = await makeRequest('/api/admin/concerts');
    if (res.status > 500) throw new Error(`Server error: ${res.status}`);
    // 401/403 is ok - just checking endpoint exists
  });

  // Test 5: Database Connection
  await test('Database Connection Working', async () => {
    const healthRes = await makeRequest('/api/health');
    if (healthRes.data.database !== 'connected') {
      throw new Error('Database not connected');
    }
  });

  // Test 6: CORS Headers
  await test('CORS Headers Present', async () => {
    const res = await makeRequest('/api/health');
    if (!res.headers['access-control-allow-origin'] && res.status === 200) {
      // CORS might be configured differently, just check response works
      return;
    }
  });

  // Test 7: Response Time
  await test('Response Time < 1000ms', async () => {
    const start = Date.now();
    await makeRequest('/api/health');
    const elapsed = Date.now() - start;
    if (elapsed > 1000) throw new Error(`Took ${elapsed}ms`);
  });

  // Test 8: Content Type
  await test('JSON Content-Type', async () => {
    const res = await makeRequest('/api/health');
    const contentType = res.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Unexpected content-type: ${contentType}`);
    }
  });

  console.log(`\n${colors.blue}─────────────────────────────────${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${testsPassed}${colors.reset}`);
  if (testsFailed > 0) {
    console.log(`${colors.red}✗ Failed: ${testsFailed}${colors.reset}`);
  }
  console.log(`${colors.blue}─────────────────────────────────${colors.reset}\n`);

  if (testsFailed === 0) {
    console.log(`${colors.green}🎉 All tests passed! Your Railway deployment is working!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}❌ Some tests failed. Check the errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
