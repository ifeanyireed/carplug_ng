// test_flow10.js - Flow 10 Verification Suite
// Flow 10: VIP Concierge Sourcing & District Map Discovery

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 1000;

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
  const clientIp = options.ip || `192.168.10.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 10 VERIFICATION SUITE');
  console.log(`Target API: ${BASE_URL}`);

  // ----------------------------------------------------
  // Step 1: Authenticate Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Super Admin & Buyer Dr. Chidi)');

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
  assert(buyerAuth.status === 200, 'Authenticated as Buyer Dr. Chidi Nwosu');
  const buyerToken = buyerAuth.data.token;
  assert(buyerAuth.data.user.role === 'buyer', "User role is 'buyer'");

  // ----------------------------------------------------
  // Step 2: VIP Concierge Submission & CRM Pipeline (10.1)
  // ----------------------------------------------------
  logSub('Step 2: VIP Concierge Submission & CRM Lifecycle');

  const conciergePayload = {
    buyerName: 'Dr. Chidi Nwosu',
    buyerPhone: '+234 803 123 4567',
    buyerCity: 'Lagos (Island & Mainland)',
    vehicleTitle: 'Mercedes-Benz GLE 450',
    vehiclePrice: 85000000,
    type: 'concierge',
    note: 'Condition: Foreign Used (Tokunbo) • Priority: Verified Inspection & Low Mileage • Min Year: 2021',
    status: 'new',
  };

  const createLeadRes = await api('/leads', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify(conciergePayload),
  });

  assert(createLeadRes.status === 201, 'POST /leads created VIP concierge lead with 201 Created');
  const createdLead = createLeadRes.data;
  assert(createdLead && createdLead.id, `Lead ID generated: ${createdLead?.id}`);
  assert(createdLead.type === 'concierge', "Lead type confirmed as 'concierge'");
  assert(createdLead.status === 'new', "Lead status initialized as 'new'");
  assert(createdLead.vehiclePrice === 85000000, 'Target budget recorded correctly');

  // Admin CRM Lead Discovery
  const adminLeadsRes = await api('/leads?type=concierge', {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  assert(adminLeadsRes.status === 200, 'GET /leads?type=concierge returned 200 OK for Super Admin');
  assert(Array.isArray(adminLeadsRes.data.data), 'Admin leads returned data array');
  const foundLead = adminLeadsRes.data.data.find((l) => l.id === createdLead.id);
  assert(!!foundLead, 'Submitted VIP concierge lead successfully discovered in Admin CRM queue');
  assert(foundLead.type === 'concierge', "Lead in CRM tagged with VIP 'concierge' badge");

  // RBAC Boundary: Buyer blocked from mutating lead status
  const unauthorizedStatusUpdate = await api(`/leads/${createdLead.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ status: 'contacted' }),
  });
  assert(
    unauthorizedStatusUpdate.status === 403,
    'Buyer blocked from mutating lead status with 403 Forbidden'
  );

  // Admin updates lead status to 'contacted'
  const updateStatus1 = await api(`/leads/${createdLead.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'contacted' }),
  });
  assert(updateStatus1.status === 200, "Admin transitioned lead status to 'contacted'");
  assert(updateStatus1.data.status === 'contacted', "Updated status confirmed as 'contacted'");

  // Admin completes VIP sourcing
  const updateStatus2 = await api(`/leads/${createdLead.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'completed' }),
  });
  assert(updateStatus2.status === 200, "Admin finalized VIP concierge sourcing to 'completed'");

  // ----------------------------------------------------
  // Step 3: Algorithmic Matcher Evaluation (10.2)
  // ----------------------------------------------------
  logSub('Step 3: Algorithmic Matcher Evaluation');

  // Test Case A: Luxury SUV matching
  const matchReqA = {
    makeModel: 'Mercedes-Benz',
    budgetNaira: 85000000,
    condition: 'Foreign Used (Tokunbo)',
    city: 'Lagos',
  };

  const matchResA = await api('/leads/concierge-match', {
    method: 'POST',
    body: JSON.stringify(matchReqA),
  });

  assert(matchResA.status === 200, 'POST /leads/concierge-match returned 200 OK');
  assert(matchResA.data && Array.isArray(matchResA.data.matches), 'Matches array returned');
  assert(matchResA.data.count > 0, `Algorithmic matcher identified ${matchResA.data.count} inventory candidates`);

  const topMatch = matchResA.data.matches[0];
  assert(topMatch && topMatch.id, `Top ranked match vehicle: ${topMatch.title}`);
  assert(topMatch.matchScore >= 70 && topMatch.matchScore <= 99, `Calculated match score valid: ${topMatch.matchScore}%`);
  assert(typeof topMatch.matchReason === 'string' && topMatch.matchReason.length > 0, `Explainable match reasoning: "${topMatch.matchReason}"`);

  // Verify descending sort order by MatchScore
  let isSorted = true;
  for (let i = 1; i < matchResA.data.matches.length; i++) {
    if (matchResA.data.matches[i].matchScore > matchResA.data.matches[i - 1].matchScore) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, 'Candidate vehicles strictly ordered in descending rank by matchScore');

  // Test Case B: Sedans / specific model matching
  const matchReqB = {
    makeModel: 'Toyota Camry',
    budgetNaira: 35000000,
    condition: 'Foreign Used (Tokunbo)',
    city: 'Lagos',
  };

  const matchResB = await api('/leads/concierge-match', {
    method: 'POST',
    body: JSON.stringify(matchReqB),
  });

  assert(matchResB.status === 200, 'Matcher query for Toyota Camry returned 200 OK');
  if (matchResB.data.matches.length > 0) {
    const camryMatch = matchResB.data.matches[0];
    assert(
      (camryMatch.make && camryMatch.make.toLowerCase().includes('toyota')) ||
      (camryMatch.title && camryMatch.title.toLowerCase().includes('camry')),
      `Matched candidate reflects search parameters: ${camryMatch.title}`
    );
  } else {
    console.log('   [INFO] No Camry in budget range; matcher returned 0 candidates cleanly');
  }

  // Test Case C: Certified vehicle bonus scoring verification
  const certifiedMatch = matchResA.data.matches.find((m) => m.trustTier >= 4);
  if (certifiedMatch) {
    assert(
      certifiedMatch.matchReason.includes('150-Point Certified vehicle'),
      'Trust Tier 4+ vehicles receive certified vehicle bonus scoring'
    );
  }

  // ----------------------------------------------------
  // Step 4: District Map Discovery & Showroom Clusters (10.3)
  // ----------------------------------------------------
  logSub('Step 4: District Map Discovery & Dealership Showrooms');

  // 1. Verify Dealership Clusters
  const dealersRes = await api('/dealers', { method: 'GET' });
  assert(dealersRes.status === 200, 'GET /dealers returned 200 OK');
  const dealers = dealersRes.data.data;
  assert(Array.isArray(dealers) && dealers.length >= 3, `Discovered ${dealers.length} registered dealerships`);

  const lekkiDealer = dealers.find((d) => d.location && d.location.toLowerCase().includes('lekki'));
  assert(!!lekkiDealer, `Found showroom cluster in Lekki Phase 1: "${lekkiDealer?.name}" (${lekkiDealer?.location})`);
  assert(lekkiDealer.verifiedCAC === true, 'Lekki showroom has verified CAC badge');

  const ikejaDealer = dealers.find((d) => d.location && d.location.toLowerCase().includes('ikeja'));
  assert(!!ikejaDealer, `Found showroom cluster in Ikeja GRA: "${ikejaDealer?.name}" (${ikejaDealer?.location})`);
  assert(ikejaDealer.verifiedCAC === true, 'Ikeja showroom has verified CAC badge');

  const viDealer = dealers.find((d) => d.location && d.location.toLowerCase().includes('victoria island'));
  assert(!!viDealer, `Found showroom cluster in Victoria Island: "${viDealer?.name}" (${viDealer?.location})`);
  assert(viDealer.verifiedCAC === true, 'Victoria Island showroom has verified CAC badge');

  // 2. Verify District Inventory Geolocation Pins
  const allVehiclesRes = await api('/vehicles?pageSize=50', { method: 'GET' });
  assert(allVehiclesRes.status === 200, 'GET /vehicles?pageSize=50 returned 200 OK for Map Discovery');
  const catalog = allVehiclesRes.data.data;
  assert(Array.isArray(catalog) && catalog.length > 0, `Catalog loaded ${catalog.length} active vehicles`);

  // Lekki District
  const lekkiCars = catalog.filter((v) => v.publicLocation && v.publicLocation.toLowerCase().includes('lekki'));
  assert(lekkiCars.length > 0, `Discovered ${lekkiCars.length} vehicles stationed in Lekki Phase 1 & Ikate district`);
  console.log(`   [INFO] Sample Lekki vehicle: ${lekkiCars[0].title} (Price: ₦${lekkiCars[0].price.toLocaleString()}, Tier ${lekkiCars[0].trustTier})`);

  // Victoria Island / Ikoyi District
  const viCars = catalog.filter(
    (v) =>
      v.publicLocation &&
      (v.publicLocation.toLowerCase().includes('victoria island') || v.publicLocation.toLowerCase().includes('ikoyi'))
  );
  assert(viCars.length > 0, `Discovered ${viCars.length} vehicles stationed in Victoria Island & Ikoyi district`);
  console.log(`   [INFO] Sample VI vehicle: ${viCars[0].title} (Price: ₦${viCars[0].price.toLocaleString()}, Tier ${viCars[0].trustTier})`);

  // Ikeja GRA / Mainland District
  const ikejaCars = catalog.filter((v) => v.publicLocation && v.publicLocation.toLowerCase().includes('ikeja'));
  assert(ikejaCars.length > 0, `Discovered ${ikejaCars.length} vehicles stationed in Ikeja GRA & Allen district`);
  console.log(`   [INFO] Sample Ikeja vehicle: ${ikejaCars[0].title} (Price: ₦${ikejaCars[0].price.toLocaleString()}, Tier ${ikejaCars[0].trustTier})`);

  // ----------------------------------------------------
  // Step 5: Edge Cases & Validation Matrix
  // ----------------------------------------------------
  logSub('Step 5: Edge Cases & Input Validation Matrix');

  // Invalid lead status update rejected
  const invalidStatusRes = await api(`/leads/${createdLead.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'invalid_status_code' }),
  });
  assert(invalidStatusRes.status === 400, 'Invalid status update rejected with 400 Bad Request');

  // Non-existent lead status update returns 404
  const missingLeadRes = await api('/leads/lead-non-existent-99999/status', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'completed' }),
  });
  assert(missingLeadRes.status === 404, 'Status update for non-existent lead returns 404 Not Found');

  // Matcher handles empty criteria without error
  const emptyMatchRes = await api('/leads/concierge-match', {
    method: 'POST',
    body: JSON.stringify({ makeModel: 'NonExistentFlyingCar2099', budgetNaira: 1000 }),
  });
  assert(emptyMatchRes.status === 200, 'Out-of-range search handled cleanly with 200 OK');
  assert(emptyMatchRes.data.count === 0, 'Returned 0 matches for non-existent criteria without panic');

  logHeader('FLOW 10 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n[FATAL ERROR in Flow 10 Suite]:', err);
  process.exit(1);
});
