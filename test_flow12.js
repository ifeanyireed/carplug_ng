// test_flow12.js - Flow 12 Verification Suite
// Flow 12: Super Admin Governance, Listing Moderation & Platform Health

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 1200;

function logHeader(title) {
  console.log('\n====================================================');
  console.log(`  ${title}`);
  console.log('====================================================');
}

function logSub(title) {
  console.log(`\n--- ${title} ---`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`   [PASS] ${message}`);
}

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const clientIp = options.ip || `192.168.12.${++ipCounter}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Forwarded-For': clientIp,
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    ...options,
    headers,
  });

  let data = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  return { status: res.status, ok: res.ok, data };
}

async function run() {
  logHeader('CARPLUG NIGERIA - FLOW 12 VERIFICATION SUITE');
  console.log(`Target API: ${BASE_URL}`);

  // ----------------------------------------------------
  // Step 1: System Health Endpoint (12.1)
  // ----------------------------------------------------
  logSub('Step 1: System Health Endpoint & Database Telemetry');

  const healthRes = await api('/health', { method: 'GET' });
  assert(healthRes.status === 200, 'GET /health returned 200 OK');
  assert(healthRes.data.status === 'ok', "Health status is 'ok'");
  assert(healthRes.data.database === 'connected', "Database connection verified as 'connected'");
  assert(healthRes.data.service === 'carplug-backend', "Service identifier is 'carplug-backend'");
  assert(typeof healthRes.data.currentTime === 'string', `Server timestamp reported: ${healthRes.data.currentTime}`);
  assert(typeof healthRes.data.uptime === 'string', `Server uptime telemetry: ${healthRes.data.uptime}`);

  // ----------------------------------------------------
  // Step 2: Actor Authentication & RBAC Isolation
  // ----------------------------------------------------
  logSub('Step 2: Authenticate Actors');

  const adminAuth = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'mycarsnigeria@gmail.com', password: STANDARD_PASS }),
  });
  assert(adminAuth.status === 200, 'Authenticated as Super Admin');
  const adminToken = adminAuth.data.token;
  assert(adminAuth.data.user.role === 'admin', "User role is 'admin'");

  const buyerAuth = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'buyer.chidi@mycars.ng', password: STANDARD_PASS }),
  });
  assert(buyerAuth.status === 200, 'Authenticated as Buyer Dr. Chidi');
  const buyerToken = buyerAuth.data.token;
  assert(buyerAuth.data.user.role === 'buyer', "User role is 'buyer'");

  const sellerAuth = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'seller.babatunde@mycars.ng', password: STANDARD_PASS }),
  });
  assert(sellerAuth.status === 200, 'Authenticated as Private Seller Babatunde');
  const sellerToken = sellerAuth.data.token;

  // ----------------------------------------------------
  // Step 3: Platform Metrics Dashboard (12.2)
  // ----------------------------------------------------
  logSub('Step 3: Platform Metrics Dashboard & KPI Aggregates');

  // RBAC Boundary: Buyer blocked from metrics
  const buyerMetricsAttempt = await api('/admin/metrics', {
    method: 'GET',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(buyerMetricsAttempt.status === 403, 'Buyer blocked from accessing admin metrics with 403 Forbidden');

  // Admin access to metrics
  const adminMetricsRes = await api('/admin/metrics', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminMetricsRes.status === 200, 'GET /admin/metrics returned 200 OK for Super Admin');
  assert(adminMetricsRes.data.status === 'success', "Response status confirmed as 'success'");

  const m = adminMetricsRes.data.metrics;
  assert(m && typeof m === 'object', 'Metrics payload returned object');
  assert(m.totalVehicles > 0, `Total Vehicles registered in catalog: ${m.totalVehicles}`);
  assert(m.tier3PlusVehicles >= 0, `High Trust (Tier 3+) Vehicles: ${m.tier3PlusVehicles}`);
  assert(m.totalDealers >= 3, `Registered Dealerships count: ${m.totalDealers}`);
  assert(m.totalTechnicians >= 1, `Certified Technicians count: ${m.totalTechnicians}`);
  assert(m.totalUsers >= 5, `Total Platform Users: ${m.totalUsers}`);
  assert(m.totalVolume > 0, `Total GMV Transaction Volume: ₦${m.totalVolume.toLocaleString()}`);
  assert(m.escrowVolume >= 0, `Escrow Reserve Funds: ₦${m.escrowVolume.toLocaleString()}`);
  assert(m.settledVolume >= 0, `Settled Payouts Volume: ₦${m.settledVolume.toLocaleString()}`);
  console.log(`   [INFO] Leads: ${m.totalLeads}, Swaps: ${m.totalSwaps}, Pending KYC: ${m.pendingVerifications}`);

  // ----------------------------------------------------
  // Step 4: Listing Flagging & Moderation (12.3)
  // ----------------------------------------------------
  logSub('Step 4: Listing Flagging & Moderation Queue');

  // 1. Query flagged listings queue
  const flaggedRes = await api('/admin/flagged-listings', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(flaggedRes.status === 200, 'GET /admin/flagged-listings returned 200 OK for Super Admin');
  assert(flaggedRes.data.status === 'success', "Flagged queue status confirmed as 'success'");
  assert(Array.isArray(flaggedRes.data.flagged), 'Flagged listings returned as array');
  assert(flaggedRes.data.flagged.length > 0, `Discovered ${flaggedRes.data.flagged.length} items flagged for moderation review`);

  const sampleFlagged = flaggedRes.data.flagged[0];
  assert(sampleFlagged.vehicleId && sampleFlagged.reason, `Flagged reason: "${sampleFlagged.reason}" (Severity: ${sampleFlagged.severity})`);

  // 2. Moderation Lifecycle: Create a test listing to reject/remove
  const testListingPayload = {
    title: `2017 Honda Civic EX-L Suspicious QA Test ${Date.now()}`,
    year: 2017,
    make: 'Honda',
    model: 'Civic',
    bodyType: 'Sedan',
    condition: 'Nigerian Used',
    mileage: 180000,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    vin: `1HGCV1F${Date.now().toString().slice(-10)}`,
    price: 8500000,
    marketPriceMin: 12000000,
    marketPriceMax: 15000000,
    priceRating: 'fair',
    priceVerdict: 'Suspicious test listing for moderation audit',
    trustTier: 1,
    trustTierLabel: 'Unverified Listing',
    images: '["https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679181/carplug/cars/car7.jpg"]',
    publicLocation: 'Ikeja, Lagos',
    sellerType: 'private',
  };

  const createListingRes = await api('/vehicles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify(testListingPayload),
  });
  assert(createListingRes.status === 201, 'Private Seller created test listing with 201 Created');
  const testVehicleId = createListingRes.data.id;
  assert(!!testVehicleId, `Test Vehicle ID: ${testVehicleId}`);

  // Verify visible in public catalog
  const publicFindRes = await api(`/vehicles/${testVehicleId}`, { method: 'GET' });
  assert(publicFindRes.status === 200, 'Test vehicle visible in public catalog prior to moderation');

  // RBAC Boundary: Buyer blocked from moderating vehicle
  const buyerModerateAttempt = await api(`/admin/listings/${testVehicleId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ status: 'rejected', reason: 'Attempted unauthorized moderation' }),
  });
  assert(buyerModerateAttempt.status === 403, 'Buyer blocked from moderating listings with 403 Forbidden');

  // Super Admin moderates vehicle listing with status 'rejected'
  const adminModerateRes = await api(`/admin/listings/${testVehicleId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'rejected',
      reason: 'Inconsistent documentation and suspicious pricing below market valuation floor',
    }),
  });
  assert(adminModerateRes.status === 200, 'Admin moderated vehicle with status "rejected"');
  assert(adminModerateRes.data.status === 'success', "Moderation action confirmed as 'success'");

  // Verify vehicle is IMMEDIATELY removed from public search results
  const publicVerifyRemoved = await api(`/vehicles/${testVehicleId}`, { method: 'GET' });
  assert(
    publicVerifyRemoved.status === 404,
    'Moderated vehicle immediately removed from public search catalog with 404 Not Found'
  );

  // ----------------------------------------------------
  // Step 5: Resilient Error Handling & Error Boundaries (12.4)
  // ----------------------------------------------------
  logSub('Step 5: Resilient Error Handling & Custom Error Boundaries');

  // 1. API 404 for unknown routes
  const unknownRouteRes = await api('/non-existent-api-endpoint-9999', { method: 'GET' });
  assert(unknownRouteRes.status === 404, 'Unknown API route returns clean 404 without crashing');

  // 2. Malformed JSON handling without server panic
  const malformedRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{ invalid_json_payload: ',
  });
  assert(malformedRes.status === 400, 'Malformed JSON payload safely rejected with 400 Bad Request');

  // 3. Verify Next.js error boundary component files
  const webAppDir = path.resolve(__dirname, 'web_app', 'src', 'app');
  const notFoundPath = path.join(webAppDir, 'not-found.tsx');
  const errorPath = path.join(webAppDir, 'error.tsx');
  const globalErrorPath = path.join(webAppDir, 'global-error.tsx');

  assert(fs.existsSync(notFoundPath), 'web_app/src/app/not-found.tsx exists and is present');
  const notFoundContent = fs.readFileSync(notFoundPath, 'utf8');
  assert(notFoundContent.includes('Page not found'), 'not-found.tsx renders branded 404 UI');

  assert(fs.existsSync(errorPath), 'web_app/src/app/error.tsx exists and is present');
  const errorContent = fs.readFileSync(errorPath, 'utf8');
  assert(errorContent.includes('ErrorBoundary'), 'error.tsx exports standard Next.js client error boundary');

  assert(fs.existsSync(globalErrorPath), 'web_app/src/app/global-error.tsx exists and is present');
  const globalErrorContent = fs.readFileSync(globalErrorPath, 'utf8');
  assert(globalErrorContent.includes('GlobalError'), 'global-error.tsx exports root application error boundary');

  logHeader('FLOW 12 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n[FATAL ERROR in Flow 12 Suite]:', err);
  process.exit(1);
});
