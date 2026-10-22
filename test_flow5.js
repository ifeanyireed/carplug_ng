// test_flow5.js - Flow 5 Verification Suite
// Flow 5: Car Swaps & Trade-In Auto-Routing Pipeline

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 500;

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
  const clientIp = options.ip || `192.168.6.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 5 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Buyer, Dealer, Admin)');

  // 1. Buyer: Dr. Chidi Nwosu
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(buyerLogin.status === 200, 'Authenticated as Dr. Chidi Nwosu (buyer.chidi@mycars.ng)');
  const buyerToken = buyerLogin.data.token;
  const buyerId = buyerLogin.data.user.id;

  // 2. Dealer: Dew Autos (carsplug0@gmail.com)
  const dealerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'carsplug0@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  assert(dealerLogin.status === 200, 'Authenticated as Dew Autos (carsplug0@gmail.com)');
  const dealerToken = dealerLogin.data.token;

  // 3. Super Admin: mycarsnigeria@gmail.com
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'mycarsnigeria@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  assert(adminLogin.status === 200, 'Authenticated as Super Admin (mycarsnigeria@gmail.com)');
  const adminToken = adminLogin.data.token;

  // ----------------------------------------------------
  // STEP 2: Trade-In Valuation Appraisal & Top-Up Math
  // ----------------------------------------------------
  logSub('Step 2: Trade-In Valuation Appraisal & Net Top-Up Formulation');

  // Verify target vehicle in active dealership inventory
  const vehiclesRes = await api('/vehicles');
  assert(vehiclesRes.status === 200, 'GET /vehicles returned 200 OK');
  const allVehicles = vehiclesRes.data.data;
  const targetCar = allVehicles.find(v => v.title.includes('Mercedes-Benz GLC 300') || v.sellerId.includes('reed'));
  assert(!!targetCar, `Target vehicle discovered: "${targetCar.title}" (₦${targetCar.price.toLocaleString()})`);

  // Algorithmic Trade-in formula parameters:
  // Trade-in: 2018 Toyota Corolla (Nigerian Used)
  const appraisedEquity = 14500000; // ₦14.5M appraised equity
  const targetCarPrice = targetCar.price; // ₦72.0M target car price
  const platformDiscount = Math.round(targetCarPrice * 0.05); // 5% platform discount (₦3.6M)
  const expectedNetTopUp = targetCarPrice - appraisedEquity - platformDiscount; // ₦53.9M net top-up

  console.log(`   [INFO] Trade-In Valuation Breakdown:`);
  console.log(`          Current Car Appraised Equity: ₦${appraisedEquity.toLocaleString()}`);
  console.log(`          Target Vehicle Price:        ₦${targetCarPrice.toLocaleString()}`);
  console.log(`          5% Platform Subsidy:         ₦${platformDiscount.toLocaleString()}`);
  console.log(`          Net Buyer Top-Up Amount:     ₦${expectedNetTopUp.toLocaleString()}`);
  assert(expectedNetTopUp > 0, `Net top-up successfully formulated (₦${expectedNetTopUp.toLocaleString()})`);

  // ----------------------------------------------------
  // STEP 3: Route & Security Boundary Enforcements
  // ----------------------------------------------------
  logSub('Step 3: Route & Security Boundary Enforcements');

  // 1. Unauthenticated swap creation blocked with 401
  const unauthSwap = await api('/swaps', {
    method: 'POST',
    body: JSON.stringify({
      customerName: 'Anonymous Intruder',
      currentCar: '2015 Honda Accord',
      targetCar: targetCar.title,
    }),
  });
  assert(unauthSwap.status === 401, 'Unauthenticated swap creation blocked with 401 Unauthorized');

  // 2. Non-admin attempting to moderate swap status blocked with 403
  const buyerStatusPatch = await api('/swaps/swap-101/status', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ status: 'Dealer Accepted' }),
  });
  assert(buyerStatusPatch.status === 403, 'Buyer blocked from moderating swap status with 403 Forbidden');

  const dealerStatusPatch = await api('/swaps/swap-101/status', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dealerToken}` },
    body: JSON.stringify({ status: 'Dealer Accepted' }),
  });
  assert(dealerStatusPatch.status === 403, 'Dealer blocked from moderating swap status with 403 Forbidden');

  // ----------------------------------------------------
  // STEP 4: Authenticated Swap Request Submission (POST /swaps)
  // ----------------------------------------------------
  logSub('Step 4: Authenticated Swap Request Submission (POST /swaps)');

  const timestamp = Date.now();
  const swapRef = String(timestamp).slice(-6);
  const swapPayload = {
    id: `swap-qa-${swapRef}`,
    customerName: 'Dr. Chidi Nwosu',
    customerPhone: '+234 803 291 0021',
    currentCar: '2018 Toyota Corolla LE (Nigerian Used, First Body)',
    currentCarImage: 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679184/carplug/cars/car13.jpg',
    appraisedEquity: appraisedEquity,
    targetCar: targetCar.title,
    targetCarPrice: targetCarPrice,
    platformDiscount: platformDiscount,
    netTopUp: expectedNetTopUp,
    status: 'Pending Audit',
    scheduledDate: '2026-11-20',
    assignedTech: 'Auto-Dispatching Nearest Certified Inspector...',
  };

  const createSwapRes = await api('/swaps', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify(swapPayload),
  });
  assert(createSwapRes.status === 201, 'POST /swaps returned 201 Created');
  const createdSwap = createSwapRes.data;
  assert(createdSwap.id === swapPayload.id, `Swap request ID verified: ${createdSwap.id}`);
  assert(createdSwap.status === 'Pending Audit', `Initial swap status is 'Pending Audit'`);
  assert(createdSwap.netTopUp === expectedNetTopUp, `Net top-up matches formula: ₦${createdSwap.netTopUp.toLocaleString()}`);

  // ----------------------------------------------------
  // STEP 5: Dealership CRM Auto-Routing Pipeline
  // ----------------------------------------------------
  logSub('Step 5: Dealership CRM Auto-Routing Pipeline');

  // Query Dew Autos CRM leads queue
  const dealerLeadsRes = await api('/leads?type=car_swap_tradein', {
    headers: { Authorization: `Bearer ${dealerToken}` },
  });
  assert(dealerLeadsRes.status === 200, 'GET /leads?type=car_swap_tradein returned 200 OK');
  const tradeLeads = dealerLeadsRes.data.data || dealerLeadsRes.data;
  assert(Array.isArray(tradeLeads), 'Received dealer CRM leads list');

  const matchingLead = tradeLeads.find(l =>
    l.buyerPhone === swapPayload.customerPhone &&
    l.vehicleTitle === targetCar.title &&
    l.type === 'car_swap_tradein'
  );
  assert(!!matchingLead, `Trade-in lead auto-routed directly into Dew Autos CRM queue (Lead ID: ${matchingLead?.id})`);
  assert(matchingLead.status === 'new', `Lead status initialized as '${matchingLead.status}'`);
  assert(matchingLead.vehiclePrice === targetCarPrice, `Target vehicle price attached to CRM lead: ₦${matchingLead.vehiclePrice.toLocaleString()}`);
  assert(matchingLead.note.includes('Trade-in offer'), `Trade-in appraisal notes attached: "${matchingLead.note.slice(0, 50)}..."`);

  // Dealer acknowledges trade-in lead
  const ackLeadRes = await api(`/leads/${matchingLead.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dealerToken}` },
    body: JSON.stringify({ status: 'contacted' }),
  });
  assert(ackLeadRes.status === 200, "Dew Autos updated auto-routed CRM lead status to 'contacted'");

  // ----------------------------------------------------
  // STEP 6: Super Admin Swap Moderation & Escrow Desk
  // ----------------------------------------------------
  logSub('Step 6: Super Admin Swap Moderation & Status Lifecycle');

  // 1. Super Admin audits all swaps
  const adminSwapsRes = await api('/swaps');
  assert(adminSwapsRes.status === 200, 'GET /swaps returned 200 OK for Super Admin audit desk');
  const allSwaps = adminSwapsRes.data.data;
  const foundSwap = allSwaps.find(s => s.id === createdSwap.id);
  assert(!!foundSwap, `Created swap found in admin master desk: ${foundSwap?.id}`);
  assert(foundSwap.appraisedEquity === appraisedEquity, `Equity appraisal verified on admin ledger: ₦${foundSwap.appraisedEquity.toLocaleString()}`);

  // 2. Admin advances status to 'Dealer Accepted'
  const acceptRes = await api(`/swaps/${createdSwap.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Dealer Accepted' }),
  });
  assert(acceptRes.status === 200, `Admin PATCH /swaps/${createdSwap.id}/status updated to 'Dealer Accepted'`);

  // 3. Admin dispatches physical swap inspection audit
  const auditRes = await api(`/swaps/${createdSwap.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'In Audit' }),
  });
  assert(auditRes.status === 200, `Admin PATCH /swaps/${createdSwap.id}/status advanced flight to 'In Audit'`);

  // Verify status persistence
  const verifiedSwapsRes = await api('/swaps');
  const verifiedSwap = verifiedSwapsRes.data.data.find(s => s.id === createdSwap.id);
  assert(verifiedSwap.status === 'In Audit', `Swap status persisted in PostgreSQL as '${verifiedSwap.status}'`);

  logHeader('FLOW 5 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 5 VERIFICATION FAILED:', err);
  process.exit(1);
});
