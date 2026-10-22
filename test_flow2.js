// test_flow2.js - Flow 2 Verification Suite
// Flow 2: Buyer Discovery, Parametric Search & Valuation Comps

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 200;

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
  const clientIp = options.ip || `192.168.3.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 2 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Public Inventory Discovery & Baseline Metadata
  // ----------------------------------------------------
  logSub('Step 1: Public Inventory Discovery & Metadata Verification');
  const inventory = await api('/vehicles');
  assert(inventory.status === 200, `GET /vehicles returned 200 OK`);
  assert(inventory.data.total >= 16, `Total catalog contains seeded inventory (found ${inventory.data.total} vehicles)`);
  assert(Array.isArray(inventory.data.data), `Inventory returned array of vehicle objects`);

  const firstVehicle = inventory.data.data[0];
  assert(!!firstVehicle.id, `Vehicle record contains ID: ${firstVehicle.id}`);
  assert(!!firstVehicle.title, `Vehicle record contains Title: ${firstVehicle.title}`);
  assert(firstVehicle.price > 0, `Vehicle price is non-zero: ₦${firstVehicle.price.toLocaleString()}`);
  assert(firstVehicle.sellerPhone.includes('***'), `Seller phone is properly masked in public response (${firstVehicle.sellerPhone})`);

  // Test Pagination
  const page1 = await api('/vehicles?page=1&pageSize=4');
  const page2 = await api('/vehicles?page=2&pageSize=4');
  assert(page1.data.data.length === 4, `Page 1 returned 4 items`);
  assert(page2.data.data.length === 4, `Page 2 returned 4 items`);
  assert(page1.data.data[0].id !== page2.data.data[0].id, `Page 1 and Page 2 contain distinct vehicle items`);

  // ----------------------------------------------------
  // STEP 2: Hero Category Tabs & Condition Filtering
  // ----------------------------------------------------
  logSub('Step 2: Hero Category Tabs & Condition Filtering');

  // Condition: Tokunbo (Foreign Used)
  const tokunboRes = await api('/vehicles?condition=tokunbo');
  assert(tokunboRes.status === 200, `GET /vehicles?condition=tokunbo returned 200 OK`);
  assert(tokunboRes.data.data.length > 0, `Found ${tokunboRes.data.data.length} Tokunbo vehicles`);
  const allTokunbo = tokunboRes.data.data.every(v => v.condition === 'Foreign Used (Tokunbo)');
  assert(allTokunbo, `All returned vehicles have condition === 'Foreign Used (Tokunbo)'`);

  // Condition: Brand New
  const brandNewRes = await api('/vehicles?condition=brand_new');
  assert(brandNewRes.status === 200, `GET /vehicles?condition=brand_new returned 200 OK`);
  assert(brandNewRes.data.data.length > 0, `Found ${brandNewRes.data.data.length} Brand New vehicles`);
  const allBrandNew = brandNewRes.data.data.every(v => v.condition === 'Brand New');
  assert(allBrandNew, `All returned vehicles have condition === 'Brand New'`);

  // Condition: Nigerian Used
  const ngUsedRes = await api('/vehicles?condition=nigerian_used');
  assert(ngUsedRes.status === 200, `GET /vehicles?condition=nigerian_used returned 200 OK`);
  assert(ngUsedRes.data.data.length > 0, `Found ${ngUsedRes.data.data.length} Nigerian Used vehicles`);
  const allNgUsed = ngUsedRes.data.data.every(v => v.condition === 'Nigerian Used');
  assert(allNgUsed, `All returned vehicles have condition === 'Nigerian Used'`);

  // ----------------------------------------------------
  // STEP 3: Parametric Facet Search (Make, Body, Price, Year, Search Query)
  // ----------------------------------------------------
  logSub('Step 3: Parametric Facet Filtering & Text Search');

  // Filter by Make: Lexus
  const lexusRes = await api('/vehicles?make=Lexus');
  assert(lexusRes.status === 200, `GET /vehicles?make=Lexus returned 200 OK`);
  assert(lexusRes.data.data.length > 0, `Found ${lexusRes.data.data.length} Lexus vehicles`);
  const allLexus = lexusRes.data.data.every(v => v.make === 'Lexus');
  assert(allLexus, `All results are Lexus vehicles`);

  // Filter by Body Type: SUV
  const suvRes = await api('/vehicles?bodyType=SUV');
  assert(suvRes.status === 200, `GET /vehicles?bodyType=SUV returned 200 OK`);
  assert(suvRes.data.data.length > 0, `Found ${suvRes.data.data.length} SUV vehicles`);
  const allSuv = suvRes.data.data.every(v => v.bodyType === 'SUV');
  assert(allSuv, `All results have bodyType === 'SUV'`);

  // Filter by Price Range: ₦20M to ₦40M
  const priceRangeRes = await api('/vehicles?minPrice=20000000&maxPrice=40000000');
  assert(priceRangeRes.status === 200, `GET /vehicles within ₦20M-₦40M returned 200 OK`);
  assert(priceRangeRes.data.data.length > 0, `Found ${priceRangeRes.data.data.length} vehicles in price bracket`);
  const allInPriceRange = priceRangeRes.data.data.every(v => v.price >= 20000000 && v.price <= 40000000);
  assert(allInPriceRange, `All returned vehicles are strictly between ₦20,000,000 and ₦40,000,000`);

  // Filter by Year Range: 2021 to 2024
  const yearRangeRes = await api('/vehicles?yearMin=2021&yearMax=2024');
  assert(yearRangeRes.status === 200, `GET /vehicles year 2021-2024 returned 200 OK`);
  const allInYearRange = yearRangeRes.data.data.every(v => v.year >= 2021 && v.year <= 2024);
  assert(allInYearRange, `All returned vehicles are manufactured between 2021 and 2024`);

  // Full-Text Search Query: 'Corolla'
  const textSearch = await api('/vehicles?q=Corolla');
  assert(textSearch.status === 200, `GET /vehicles?q=Corolla returned 200 OK`);
  assert(textSearch.data.data.length > 0, `Found matching Corolla listings`);
  const hasCorolla = textSearch.data.data.some(v => v.model === 'Corolla' || v.title.includes('Corolla'));
  assert(hasCorolla, `Search results contain Toyota Corolla`);

  // ----------------------------------------------------
  // STEP 4: Sorting Modes (Price ASC/DESC, Trust Tier)
  // ----------------------------------------------------
  logSub('Step 4: Sorting Modes (Price Ascending, Descending, Trust Tier)');

  // Sort: price_asc
  const ascRes = await api('/vehicles?sortBy=price_asc&pageSize=10');
  const ascPrices = ascRes.data.data.map(v => v.price);
  let isAscending = true;
  for (let i = 0; i < ascPrices.length - 1; i++) {
    if (ascPrices[i] > ascPrices[i + 1]) {
      isAscending = false;
      break;
    }
  }
  assert(isAscending, `sortBy=price_asc ordered prices in monotonic ascending order`);

  // Sort: price_desc
  const descRes = await api('/vehicles?sortBy=price_desc&pageSize=10');
  const descPrices = descRes.data.data.map(v => v.price);
  let isDescending = true;
  for (let i = 0; i < descPrices.length - 1; i++) {
    if (descPrices[i] < descPrices[i + 1]) {
      isDescending = false;
      break;
    }
  }
  assert(isDescending, `sortBy=price_desc ordered prices in monotonic descending order`);

  // Sort: trust
  const trustRes = await api('/vehicles?sortBy=trust&pageSize=5');
  assert(trustRes.data.data[0].trustTier === 5, `sortBy=trust prioritized Tier 5 Premium Verified vehicles`);

  // ----------------------------------------------------
  // STEP 5: Vehicle Details & WhatsApp Lead Telemetry
  // ----------------------------------------------------
  logSub('Step 5: Vehicle Details & WhatsApp Lead Telemetry');

  // Fetch individual vehicle: Lexus RX 350
  const detailRes = await api('/vehicles/v-lexus-rx350-2021');
  assert(detailRes.status === 200, `GET /vehicles/v-lexus-rx350-2021 returned 200 OK`);
  assert(detailRes.data.make === 'Lexus', `Make is 'Lexus'`);
  assert(detailRes.data.model === 'RX', `Model is 'RX'`);
  assert(detailRes.data.year === 2021, `Year is 2021`);
  assert(detailRes.data.customsDoc === true, `Customs SGD document is verified (customsDoc: true)`);
  assert(detailRes.data.trustTier === 5, `Trust Tier is 5 (150-Point Certified / Premium)`);

  // Non-existent vehicle 404
  const missingVeh = await api('/vehicles/v-non-existent-9999');
  assert(missingVeh.status === 404, `Missing vehicle ID returns 404 Not Found`);

  // Fetch contact telemetry & WhatsApp deep link
  const contactRes = await api('/vehicles/v-lexus-rx350-2021/contact');
  assert(contactRes.status === 200, `GET /vehicles/:id/contact returned 200 OK`);
  assert(contactRes.data.whatsappUrl.startsWith('https://wa.me/234'), `WhatsApp deep link generated with Nigerian international prefix (https://wa.me/234...)`);
  assert(contactRes.data.whatsappUrl.includes('Lexus'), `WhatsApp message pre-fills vehicle make ('Lexus')`);
  assert(contactRes.data.whatsappUrl.includes('VIN'), `WhatsApp message pre-fills vehicle VIN`);

  // ----------------------------------------------------
  // STEP 6: Algorithmic Fair-Market Valuation Engine
  // ----------------------------------------------------
  logSub('Step 6: Algorithmic Fair-Market Valuation Engine');

  // Fair market query for 2020 Toyota Camry
  const valRes = await api('/valuation/estimate?make=Toyota&model=Camry&year=2020&condition=Foreign%20Used%20(Tokunbo)&mileage=35000&askingPrice=24800000');
  assert(valRes.status === 200, `GET /valuation/estimate returned 200 OK`);
  assert(valRes.data.status === 'success', `Valuation status is 'success'`);
  const valData = valRes.data.data;
  assert(valData.marketPriceMin > 0 && valData.marketPriceMax > valData.marketPriceMin, `Valuation returned valid market range (₦${valData.marketPriceMin.toLocaleString()} - ₦${valData.marketPriceMax.toLocaleString()})`);
  assert(['great', 'fair', 'high', 'good'].includes(valData.priceRating?.toLowerCase()), `Price rating classification assigned: '${valData.priceRating}'`);
  assert(typeof valData.priceVerdict === 'string' && valData.priceVerdict.length > 10, `Plain-language algorithmic market verdict generated: "${valData.priceVerdict.slice(0, 60)}..."`);

  // Overpriced valuation check
  const overpriceRes = await api('/valuation/estimate', {
    method: 'POST',
    body: JSON.stringify({
      make: 'Toyota',
      model: 'Corolla',
      year: 2018,
      condition: 'Nigerian Used',
      mileage: 80000,
      askingPrice: 75000000, // ₦75M for an 018 Corolla is extremely high
    }),
  });
  assert(overpriceRes.data.data.priceRating === 'high', `Overpriced listing accurately classified with priceRating: 'high'`);

  // ----------------------------------------------------
  // STEP 7: Saved / Favorited Vehicles Lifecycle
  // ----------------------------------------------------
  logSub('Step 7: Saved / Favorited Vehicles Lifecycle (Buyer Dr. Chidi)');

  // 1. Authenticate as Buyer Chidi
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'buyer.chidi@mycars.ng', password: STANDARD_PASS }),
  });
  const buyerToken = buyerLogin.data.token;
  assert(buyerLogin.status === 200, `Authenticated as Dr. Chidi Nwosu`);

  // 2. Unauthenticated saved vehicle request guard
  const unauthSaved = await api('/saved-vehicles');
  assert(unauthSaved.status === 401, `Unauthenticated GET /saved-vehicles blocked with 401 Unauthorized`);

  const unauthSaveAction = await api('/saved-vehicles/v-lexus-rx350-2021', { method: 'POST' });
  assert(unauthSaveAction.status === 401, `Unauthenticated POST /saved-vehicles/:id blocked with 401 Unauthorized`);

  // 3. Save a vehicle: v-lexus-rx350-2021
  const saveRes = await api('/saved-vehicles/v-lexus-rx350-2021', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(saveRes.status === 200 || saveRes.status === 201, `POST /saved-vehicles/:id succeeded (status ${saveRes.status})`);

  // 4. Query saved IDs
  const savedIdsRes = await api('/saved-vehicles/ids', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(savedIdsRes.status === 200, `GET /saved-vehicles/ids returned 200 OK`);
  assert(savedIdsRes.data.ids.includes('v-lexus-rx350-2021'), `Saved IDs array includes 'v-lexus-rx350-2021'`);

  // 5. Query full saved vehicle objects
  const savedList = await api('/saved-vehicles', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(savedList.status === 200, `GET /saved-vehicles returned 200 OK`);
  const foundSaved = savedList.data.data.find(v => v.id === 'v-lexus-rx350-2021');
  assert(!!foundSaved, `Saved vehicles collection contains full vehicle object for Lexus RX 350`);

  // 6. Toggle saved state (Remove via toggle)
  const toggleOff = await api('/saved-vehicles/toggle/v-lexus-rx350-2021', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(toggleOff.status === 200, `POST /saved-vehicles/toggle/:id returned 200 OK`);
  assert(toggleOff.data.isSaved === false, `Toggle removed vehicle (isSaved: false)`);

  // 7. Toggle saved state (Re-add via toggle)
  const toggleOn = await api('/saved-vehicles/toggle/v-lexus-rx350-2021', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(toggleOn.data.isSaved === true, `Toggle re-added vehicle (isSaved: true)`);

  // 8. Delete explicitly
  const deleteSaved = await api('/saved-vehicles/v-lexus-rx350-2021', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(deleteSaved.status === 200, `DELETE /saved-vehicles/:id returned 200 OK`);

  const finalIds = await api('/saved-vehicles/ids', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(!finalIds.data.ids.includes('v-lexus-rx350-2021'), `Vehicle confirmed removed from saved IDs list`);

  // ----------------------------------------------------
  // STEP 8: Vehicle Comparison Simulation
  // ----------------------------------------------------
  logSub('Step 8: Side-by-Side Vehicle Comparison Matrix');

  const carA = await api('/vehicles/v-lexus-rx350-2021');
  const carB = await api('/vehicles/v-toyota-lc300-2024');

  assert(carA.status === 200 && carB.status === 200, `Both comparative candidate vehicles retrieved successfully`);

  console.log(`   Comparison Specs:`);
  console.log(`   - Vehicle A: ${carA.data.title} | ₦${carA.data.price.toLocaleString()} | ${carA.data.condition} | Mileage: ${carA.data.mileage} | Trust Tier: ${carA.data.trustTier}`);
  console.log(`   - Vehicle B: ${carB.data.title} | ₦${carB.data.price.toLocaleString()} | ${carB.data.condition} | Mileage: ${carB.data.mileage} | Trust Tier: ${carB.data.trustTier}`);

  assert(carA.data.price !== carB.data.price, `Comparative pricing delta verified (₦${Math.abs(carA.data.price - carB.data.price).toLocaleString()})`);
  assert(carA.data.condition !== carB.data.condition, `Condition delta verified (${carA.data.condition} vs ${carB.data.condition})`);
  assert(carA.data.engineSize && carB.data.engineSize, `Engine specifications available for comparative matrix (${carA.data.engineSize} vs ${carB.data.engineSize})`);

  logHeader('FLOW 2 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 2 VERIFICATION FAILED:', err);
  process.exit(1);
});
