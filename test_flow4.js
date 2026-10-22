// test_flow4.js - Flow 4 Verification Suite
// Flow 4: Dealer Storefronts, Showrooms & Centrally Managed Subscription Quotas

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 400;

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
  const clientIp = options.ip || `192.168.5.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 4 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Dew Autos, Crown, Buyer, Admin)');

  // 1. Dealer 1: Dew Autos (carsplug0@gmail.com)
  const dewLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'carsplug0@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  assert(dewLogin.status === 200, 'Authenticated as Dew Autos (carsplug0@gmail.com)');
  assert(dewLogin.data.user?.role === 'dealer', "User role is 'dealer'");
  const dewToken = dewLogin.data.token;
  const dewUserId = dewLogin.data.user.id;

  // 2. Dealer 2: Crown Continental Autos (dealer.crown@mycars.ng)
  const crownLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'dealer.crown@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(crownLogin.status === 200, 'Authenticated as Crown Continental (dealer.crown@mycars.ng)');
  const crownToken = crownLogin.data.token;

  // 3. Buyer: Dr. Chidi Nwosu
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(buyerLogin.status === 200, 'Authenticated as Dr. Chidi (buyer.chidi@mycars.ng)');
  const buyerToken = buyerLogin.data.token;

  // 4. Super Admin: mycarsnigeria@gmail.com
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
  // STEP 2: Public Dealers Directory (GET /dealers)
  // ----------------------------------------------------
  logSub('Step 2: Public Dealers Directory Verification');

  const dealersRes = await api('/dealers');
  assert(dealersRes.status === 200, 'GET /dealers returned 200 OK');
  const dealers = dealersRes.data.data;
  assert(Array.isArray(dealers) && dealers.length >= 2, `Directory contains certified dealerships (Count: ${dealers.length})`);

  const dewShop = dealers.find(d => d.slug === 'reed-motors-lagos' || d.email === 'carsplug0@gmail.com');
  assert(!!dewShop, 'Dew Autos verified in public directory');
  assert(dewShop.verifiedCAC === true, 'Dew Autos possesses official verifiedCAC: true badge');
  assert(dewShop.rating >= 4.5, `Dew Autos displays verified dealer rating: ${dewShop.rating}/5.0`);
  assert(dewShop.activeListingsCount > 0, `Active listings count dynamically computed: ${dewShop.activeListingsCount} vehicles`);

  const crownShop = dealers.find(d => d.slug === 'crown-continental-autos');
  assert(!!crownShop, 'Crown Continental verified in public directory');
  assert(crownShop.verifiedCAC === true, 'Crown Continental possesses verifiedCAC: true badge');

  // ----------------------------------------------------
  // STEP 3: Dedicated Showroom Storefront & Inventory
  // ----------------------------------------------------
  logSub('Step 3: Storefront & Showroom Inventory Lookup');

  // 1. Showroom profile by slug
  const storefrontRes = await api(`/dealers/${dewShop.slug}`);
  assert(storefrontRes.status === 200, `GET /dealers/${dewShop.slug} returned 200 OK`);
  const storefront = storefrontRes.data;
  assert(storefront.name === 'Dew Autos' || storefront.name.includes('Dew'), `Showroom name verified: "${storefront.name}"`);
  assert(!!storefront.address && storefront.address.includes('Lekki'), `Showroom address verified: "${storefront.address}"`);
  assert(!!storefront.operatingHours, `Business operating hours verified: "${storefront.operatingHours}"`);
  assert(!!storefront.whatsapp, `WhatsApp lead contact verified: "${storefront.whatsapp}"`);

  // 2. Showroom inventory query
  const inventoryRes = await api(`/dealers/${dewShop.slug}/inventory`);
  assert(inventoryRes.status === 200, `GET /dealers/${dewShop.slug}/inventory returned 200 OK`);
  const lotVehicles = inventoryRes.data.data;
  assert(Array.isArray(lotVehicles) && lotVehicles.length > 0, `Live inventory lot loaded with ${lotVehicles.length} vehicles`);

  const sampleCar = lotVehicles[0];
  assert(sampleCar.sellerPhone.includes('***'), `Seller phone securely masked in public view (${sampleCar.sellerPhone})`);
  assert(sampleCar.price > 0, `Vehicle price populated: ₦${sampleCar.price.toLocaleString()}`);
  assert(sampleCar.trustTier >= 1, `Trust tier verified: Tier ${sampleCar.trustTier} (${sampleCar.trustTierLabel || 'Verified'})`);

  // ----------------------------------------------------
  // STEP 4: Showroom Profile Editor & Cross-Tenant Security
  // ----------------------------------------------------
  logSub('Step 4: Showroom Profile Editor & Cross-Tenant Protection');

  const updatedTagline = `Nigeria's Premier Certified Dealership & Trust Center [${Date.now()}]`;
  const updatedWhatsapp = '+2348035004401';

  // 1. Authorized modification by owner (Dew Autos)
  const updateRes = await api(`/dealers/${dewShop.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify({
      tagline: updatedTagline,
      whatsapp: updatedWhatsapp,
    }),
  });
  assert(updateRes.status === 200, `Owner PUT /dealers/${dewShop.id} succeeded with 200 OK`);
  assert(updateRes.data.data.tagline === updatedTagline, 'Showroom tagline successfully updated');

  // Verify change reflects immediately on public storefront
  const publicRefresh = await api(`/dealers/${dewShop.slug}`);
  assert(publicRefresh.data.tagline === updatedTagline, 'Public storefront renders updated tagline in real-time');

  // 2. Cross-Tenant Barrier: Intruder Dealer Crown attempts to modify Dew Autos' shop
  const intruderDealerUpdate = await api(`/dealers/${dewShop.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${crownToken}` },
    body: JSON.stringify({
      tagline: 'Defaced by Crown Continental',
    }),
  });
  assert(intruderDealerUpdate.status === 403, 'Intruder dealer blocked from modifying competitor showroom with 403 Forbidden');

  // 3. Buyer role attempts to modify dealership
  const buyerUpdate = await api(`/dealers/${dewShop.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      tagline: 'Defaced by Buyer',
    }),
  });
  assert(buyerUpdate.status === 403, 'Buyer role blocked from modifying dealership with 403 Forbidden');

  // ----------------------------------------------------
  // STEP 5: Centralized Subscription Quota Enforcement
  // ----------------------------------------------------
  logSub('Step 5: Centralized Subscription Quota Enforcement');

  // 1. Query Dew Autos current subscription
  const currentSubRes = await api('/dealers/me/subscription', {
    headers: { Authorization: `Bearer ${dewToken}` },
  });
  assert(currentSubRes.status === 200, 'GET /dealers/me/subscription returned 200 OK');
  const initialSub = currentSubRes.data;
  assert(typeof initialSub.listingsLimit === 'number', `Current listings limit: ${initialSub.listingsLimit}`);
  assert(typeof initialSub.activeListingsCount === 'number', `Active listings count: ${initialSub.activeListingsCount}`);
  assert(initialSub.daysRemaining >= 0, `Billing days remaining: ${initialSub.daysRemaining} days`);

  // 2. Temporarily switch Dew Autos to Starter Showroom (limit = 3)
  const downgradeRes = await api('/dealers/subscription/upgrade', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify({ plan: 'Starter Showroom' }),
  });
  assert(downgradeRes.status === 200, 'Switched to Starter Showroom (limit: 3)');
  assert(downgradeRes.data.subscription?.listingsLimit === 3, 'Subscription listingsLimit verified as 3');

  // Verify that active listings (4) exceed Starter quota (3)
  const starterSubRes = await api('/dealers/me/subscription', {
    headers: { Authorization: `Bearer ${dewToken}` },
  });
  assert(starterSubRes.data.activeListingsCount >= 3, `Dew Autos active count (${starterSubRes.data.activeListingsCount}) reaches/exceeds Starter limit (3)`);

  // 3. Attempt to add a new vehicle on Starter Showroom (MUST be blocked with 403 Quota Exceeded)
  const timestamp = Date.now();
  const excessVehiclePayload = {
    title: `2022 Toyota RAV4 XLE AWD (${timestamp})`,
    year: 2022,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XLE AWD',
    bodyType: 'SUV',
    condition: 'Foreign Used (Tokunbo)',
    mileage: 28000,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineSize: '2.5L 4-Cylinder',
    vin: `4T3BFREV${timestamp.toString().slice(-6)}`,
    price: 36000000,
    publicLocation: 'Lekki Phase 1, Lagos',
    exactLocation: 'Plot 14 Admiralty Way',
    images: ['https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679185/carplug/cars/car14.jpg'],
  };

  const quotaBlockRes = await api('/vehicles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify(excessVehiclePayload),
  });
  assert(quotaBlockRes.status === 403, 'Vehicle creation blocked with 403 Forbidden due to quota limit');
  assert(quotaBlockRes.data.code === 'QUOTA_EXCEEDED', `Server returned quota exceeded error code ('${quotaBlockRes.data.code}')`);

  // ----------------------------------------------------
  // STEP 6: Plan Tier Upgrade & Quota Expansion
  // ----------------------------------------------------
  logSub('Step 6: Plan Tier Upgrade & Quota Expansion');

  // Upgrade plan to Pro Shop (limit: 60)
  const upgradeRes = await api('/dealers/subscription/upgrade', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify({ plan: 'Pro Shop' }),
  });
  assert(upgradeRes.status === 200, 'POST /dealers/subscription/upgrade upgraded to Pro Shop');
  assert(upgradeRes.data.subscription?.listingsLimit === 60, 'Subscription listingsLimit expanded to 60');

  // Now create the vehicle on the upgraded tier (MUST succeed)
  const allowedCreateRes = await api('/vehicles', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify(excessVehiclePayload),
  });
  assert(allowedCreateRes.status === 201, 'Vehicle creation succeeded with 201 Created after quota upgrade');
  const createdCarId = allowedCreateRes.data.id;
  assert(!!createdCarId, `Generated vehicle ID: ${createdCarId}`);

  // Clean-up the newly created vehicle
  const deleteRes = await api(`/vehicles/${createdCarId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${dewToken}` },
  });
  assert(deleteRes.status === 200, 'Temporary test vehicle deleted cleanly');

  // Restore Dew Autos to Premium Shop
  const restoreSubRes = await api('/dealers/subscription/upgrade', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify({ plan: 'Premium Shop' }),
  });
  assert(restoreSubRes.status === 200, 'Restored Dew Autos back to Premium Shop');
  assert(restoreSubRes.data.subscription?.listingsLimit === 9999, 'Premium Shop listing limit restored to 9999 (Unlimited)');

  // ----------------------------------------------------
  // STEP 7: WhatsApp Lead Telemetry & CRM Routing
  // ----------------------------------------------------
  logSub('Step 7: WhatsApp Lead Telemetry & CRM Routing');

  // Buyer clicks "Chat on WhatsApp"
  const leadPayload = {
    type: 'whatsapp_click',
    sellerId: dewShop.id,
    buyerName: 'Dr. Chidi Nwosu',
    buyerPhone: '+2348021112233',
    buyerEmail: 'buyer.chidi@mycars.ng',
    buyerCity: 'Victoria Island, Lagos',
    vehicleTitle: '2021 Mercedes-Benz GLC 300 4MATIC',
    vehiclePrice: 42000000,
    note: 'Buyer initiated direct WhatsApp consultation via showroom storefront',
  };

  const leadCreateRes = await api('/leads', {
    method: 'POST',
    body: JSON.stringify(leadPayload),
  });
  assert(leadCreateRes.status === 201, 'POST /leads logged WhatsApp lead telemetry with 201 Created');
  const createdLeadId = leadCreateRes.data.id;
  assert(!!createdLeadId, `Telemetry lead recorded with ID: ${createdLeadId}`);

  // Dealer queries CRM leads inbox
  const dealerLeadsRes = await api('/leads', {
    headers: { Authorization: `Bearer ${dewToken}` },
  });
  assert(dealerLeadsRes.status === 200, 'GET /leads returned 200 OK for dealership CRM inbox');
  const leads = dealerLeadsRes.data.data || dealerLeadsRes.data;
  const foundLead = Array.isArray(leads) && leads.find(l => l.id === createdLeadId);
  assert(!!foundLead, 'WhatsApp telemetry lead appeared in Dew Autos dealer CRM inbox');
  assert(foundLead.type === 'whatsapp_click', `Lead categorized with type: '${foundLead.type}'`);

  // Dealer updates lead status to 'contacted'
  const updateStatusRes = await api(`/leads/${createdLeadId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${dewToken}` },
    body: JSON.stringify({ status: 'contacted' }),
  });
  assert(updateStatusRes.status === 200, "PATCH /leads/:id/status updated lead to 'contacted'");

  logHeader('FLOW 4 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 4 VERIFICATION FAILED:', err);
  process.exit(1);
});
