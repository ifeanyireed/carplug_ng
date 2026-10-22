// test_flow3.js - Flow 3 Verification Suite
// Flow 3: Private Seller Vehicle Listing & Ownership Security

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 300;

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
  const clientIp = options.ip || `192.168.4.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 3 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Private Seller Babatunde
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Private Seller Babatunde');
  const sellerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'seller.babatunde@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(sellerLogin.status === 200, `Authenticated as Babatunde Olumide (seller.babatunde@mycars.ng)`);
  assert(sellerLogin.data.user?.role === 'seller', `User role is 'seller'`);
  assert(sellerLogin.data.user?.isVerified === true, `Seller account is email-verified (isVerified: true)`);
  const sellerToken = sellerLogin.data.token;
  const sellerId = sellerLogin.data.user.id;

  // Also authenticate an intruder (Dealer Crown) and a Buyer (Dr. Chidi)
  const dealerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'dealer.crown@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  const dealerToken = dealerLogin.data.token;

  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  const buyerToken = buyerLogin.data.token;

  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'mycarsnigeria@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  const adminToken = adminLogin.data.token;

  // ----------------------------------------------------
  // STEP 2: Algorithmic Valuation Pre-Listing Estimate
  // ----------------------------------------------------
  logSub('Step 2: Valuation-to-Sell Pre-Listing Estimate');
  const valRes = await api('/valuation/estimate', {
    method: 'POST',
    body: JSON.stringify({
      make: 'Toyota',
      model: 'Highlander',
      year: 2019,
      condition: 'Nigerian Used',
      mileage: 65000,
      askingPrice: 28000000,
    }),
  });
  assert(valRes.status === 200, `POST /valuation/estimate returned 200 OK`);
  const val = valRes.data.data;
  assert(val.marketPriceMin > 0 && val.marketPriceMax > 0, `Computed market price band: ₦${val.marketPriceMin.toLocaleString()} - ₦${val.marketPriceMax.toLocaleString()}`);
  assert(!!val.priceRating, `Price rating classified as '${val.priceRating}'`);
  assert(typeof val.priceVerdict === 'string', `Plain-language verdict generated: "${val.priceVerdict.slice(0, 50)}..."`);

  // ----------------------------------------------------
  // STEP 3: Role & Auth Guard Boundary Enforcements
  // ----------------------------------------------------
  logSub('Step 3: Role & Auth Guard Boundary Enforcements');

  // Unauthenticated vehicle creation
  const unauthCreate = await api('/vehicles', {
    method: 'POST',
    body: JSON.stringify({ make: 'Toyota', model: 'Corolla', year: 2020, price: 15000000 }),
  });
  assert(unauthCreate.status === 401, `Unauthenticated vehicle creation blocked with 401 Unauthorized`);

  // Buyer role attempting vehicle creation (RoleGuard: only seller, dealer, admin)
  const buyerCreate = await api('/vehicles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ make: 'Toyota', model: 'Corolla', year: 2020, price: 15000000 }),
  });
  assert(buyerCreate.status === 403, `Buyer role blocked from creating vehicle with 403 Forbidden`);

  // ----------------------------------------------------
  // STEP 4: Private Seller Vehicle Creation
  // ----------------------------------------------------
  logSub('Step 4: Private Seller Vehicle Creation (POST /vehicles)');

  const timestamp = Date.now();
  const vehiclePayload = {
    title: `2019 Toyota Highlander XLE AWD (${timestamp})`,
    year: 2019,
    make: 'Toyota',
    model: 'Highlander',
    trim: 'XLE AWD',
    bodyType: 'SUV',
    condition: 'Nigerian Used',
    mileage: 65000,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineSize: '3.5L V6',
    vin: `4T3ZK3BB5KU${timestamp.toString().slice(-6)}`,
    price: 28000000,
    publicLocation: 'Surulere, Lagos',
    exactLocation: 'Adeniran Ogunsanya St, Surulere',
    images: [
      'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679180/carplug/cars/car5.jpg',
      'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679186/carplug/cars/car15.jpg',
    ],
  };

  const createRes = await api('/vehicles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify(vehiclePayload),
  });

  assert(createRes.status === 201, `POST /vehicles returned 201 Created`);
  const createdVeh = createRes.data;
  const newVehId = createdVeh.id;
  assert(!!newVehId, `Vehicle ID generated: ${newVehId}`);
  assert(createdVeh.sellerType === 'private', `Seller type assigned as 'private'`);
  assert(createdVeh.sellerId === sellerId || createdVeh.sellerId === 'seller-babatunde', `Seller ID bound to Babatunde (${createdVeh.sellerId})`);
  assert(createdVeh.marketPriceMin > 0, `Algorithmic valuation min auto-computed (₦${createdVeh.marketPriceMin.toLocaleString()})`);
  assert(createdVeh.marketPriceMax > 0, `Algorithmic valuation max auto-computed (₦${createdVeh.marketPriceMax.toLocaleString()})`);
  assert(!!createdVeh.priceRating, `Price rating auto-assigned ('${createdVeh.priceRating}')`);

  // ----------------------------------------------------
  // STEP 5: Public Catalog Sync & Seller Inventory Discovery
  // ----------------------------------------------------
  logSub('Step 5: Catalog Synchronization & Seller Inventory Discovery');

  // Discover via public ID lookup
  const getVeh = await api(`/vehicles/${newVehId}`);
  assert(getVeh.status === 200, `GET /vehicles/${newVehId} returned 200 OK`);
  assert(getVeh.data.title === vehiclePayload.title, `Vehicle title matches created listing`);
  assert(getVeh.data.sellerPhone.includes('***'), `Seller phone masked in public view (${getVeh.data.sellerPhone})`);

  // Query seller inventory by sellerId
  const sellerVehicles = await api(`/vehicles?sellerId=${createdVeh.sellerId}`);
  assert(sellerVehicles.status === 200, `GET /vehicles?sellerId=${createdVeh.sellerId} returned 200 OK`);
  const foundInList = sellerVehicles.data.data.some(v => v.id === newVehId);
  assert(foundInList, `New vehicle listing appears in seller inventory queue`);

  // ----------------------------------------------------
  // STEP 6: Cross-Tenant Ownership Protection (The 403 Barrier)
  // ----------------------------------------------------
  logSub('Step 6: Cross-Tenant Ownership Protection (The 403 Barrier)');

  // Intruder 1: Dealer Crown attempts to modify Babatunde's car
  const dealerHijack = await api(`/vehicles/${newVehId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${dealerToken}` },
    body: JSON.stringify({ price: 1000000, title: 'Hijacked by Crown Continental' }),
  });
  assert(dealerHijack.status === 403, `Unauthorized dealer modification blocked with 403 Forbidden`);

  // Intruder 2: Buyer Chidi attempts to delete Babatunde's car
  const buyerDelete = await api(`/vehicles/${newVehId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(buyerDelete.status === 403, `Unauthorized buyer deletion blocked with 403 Forbidden`);

  // Intruder 3: Dealer Crown attempts to delete Babatunde's car
  const dealerDelete = await api(`/vehicles/${newVehId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${dealerToken}` },
  });
  assert(dealerDelete.status === 403, `Unauthorized dealer deletion blocked with 403 Forbidden`);

  // ----------------------------------------------------
  // STEP 7: Legitimate Owner Vehicle Modification
  // ----------------------------------------------------
  logSub('Step 7: Legitimate Owner Vehicle Modification');

  const updatedPrice = 27000000;
  const updatedMileage = 65500;
  const updateRes = await api(`/vehicles/${newVehId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({
      price: updatedPrice,
      mileage: updatedMileage,
      // Attempt sellerId hijacking in body (server must ignore)
      sellerId: 'usr-malicious-takeover',
    }),
  });

  assert(updateRes.status === 200, `Owner PUT /vehicles/${newVehId} succeeded with 200 OK`);
  assert(updateRes.data.price === updatedPrice, `Vehicle price successfully updated to ₦${updatedPrice.toLocaleString()}`);
  assert(updateRes.data.mileage === updatedMileage, `Vehicle mileage successfully updated to ${updatedMileage.toLocaleString()} km`);
  assert(updateRes.data.sellerId !== 'usr-malicious-takeover', `Ownership tampering discarded; sellerId preserved (${updateRes.data.sellerId})`);

  // ----------------------------------------------------
  // STEP 8: Administrative Governance Override
  // ----------------------------------------------------
  logSub('Step 8: Administrative Governance Override');

  const adminUpdate = await api(`/vehicles/${newVehId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      featured: true,
      healthScore: 85,
    }),
  });
  assert(adminUpdate.status === 200, `Super Admin PUT override succeeded with 200 OK`);
  assert(adminUpdate.data.featured === true, `Admin successfully flagged listing as featured: true`);

  // ----------------------------------------------------
  // STEP 9: Owner Listing Deletion & Clean-up
  // ----------------------------------------------------
  logSub('Step 9: Owner Listing Deletion & Clean-up');

  const deleteRes = await api(`/vehicles/${newVehId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  assert(deleteRes.status === 200, `Owner DELETE /vehicles/${newVehId} succeeded with 200 OK`);

  // Verify vehicle is completely removed from public retrieval
  const verifyGone = await api(`/vehicles/${newVehId}`);
  assert(verifyGone.status === 404, `Subsequent GET /vehicles/${newVehId} returns 404 Not Found`);

  logHeader('FLOW 3 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 3 VERIFICATION FAILED:', err);
  process.exit(1);
});
