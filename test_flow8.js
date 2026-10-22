// test_flow8.js - Flow 8 Verification Suite
// Flow 8: KYC Compliance & Document Verification Queue

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 800;

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
  const clientIp = options.ip || `192.168.9.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 8 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Seller, Dealer, Tech, Admin)');

  // 1. Private Seller: Babatunde Olumide
  const sellerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'seller.babatunde@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(sellerLogin.status === 200, 'Authenticated as Private Seller Babatunde (seller.babatunde@mycars.ng)');
  const sellerToken = sellerLogin.data.token;
  const sellerId = sellerLogin.data.user.id;

  // 2. Dealer: Crown Continental Autos
  const dealerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'dealer.crown@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(dealerLogin.status === 200, 'Authenticated as Dealer Crown Continental (dealer.crown@mycars.ng)');
  const dealerToken = dealerLogin.data.token;

  // 3. Technician: Musa Danladi
  const techLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'tech.musa@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(techLogin.status === 200, 'Authenticated as Technician Musa Danladi (tech.musa@mycars.ng)');
  const techToken = techLogin.data.token;

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
  // STEP 2: RBAC Security Boundary Enforcements
  // ----------------------------------------------------
  logSub('Step 2: RBAC Compliance Queue Access Boundaries');

  // 1. Unauthenticated document submission blocked with 401
  const unauthSub = await api('/verifications', {
    method: 'POST',
    body: JSON.stringify({
      entityType: 'seller_nin',
      documentUrl: 'https://cloudinary.com/dummy.pdf',
    }),
  });
  assert(unauthSub.status === 401, 'Unauthenticated document submission blocked with 401 Unauthorized');

  // 2. Non-admin attempting to access master verification queue blocked with 403
  const buyerQueueAccess = await api('/verifications', {
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  assert(buyerQueueAccess.status === 403, 'Private seller blocked from master verification queue with 403 Forbidden');

  const dealerQueueAccess = await api('/verifications', {
    headers: { Authorization: `Bearer ${dealerToken}` },
  });
  assert(dealerQueueAccess.status === 403, 'Dealer blocked from master verification queue with 403 Forbidden');

  // 3. Invalid entityType rejected with 400
  const invalidTypeRes = await api('/verifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({
      entityType: 'invalid_doc_type',
      documentUrl: 'https://cloudinary.com/dummy.pdf',
    }),
  });
  assert(invalidTypeRes.status === 400, 'Invalid entityType rejected with 400 Bad Request');

  // ----------------------------------------------------
  // STEP 3: Seller NIN Compliance Submission
  // ----------------------------------------------------
  logSub('Step 3: Private Seller NIN Compliance Submission');

  const ninSlipUrl = 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679253/carplug/kyc/nin-slip-babatunde.pdf';
  const ninNumber = '12345678901';

  const sellerNinRes = await api('/verifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({
      entityType: 'seller_nin',
      documentUrl: ninSlipUrl,
      vin: `NIN: ${ninNumber}`,
      notes: 'Federal Government of Nigeria NIMC National Identification Number Slip',
    }),
  });
  assert(sellerNinRes.status === 201, 'POST /verifications queued Seller NIN with 201 Created');
  const ninVer = sellerNinRes.data.data;
  assert(ninVer.status === 'pending', "NIN verification initialized as 'pending'");
  assert(ninVer.entityType === 'seller_nin', "entityType confirmed as 'seller_nin'");
  const ninVerId = ninVer.id;

  // Verify Seller sees submission in /verifications/me
  const myVerRes = await api('/verifications/me', {
    headers: { Authorization: `Bearer ${sellerToken}` },
  });
  assert(myVerRes.status === 200, 'GET /verifications/me returned 200 OK for Seller');
  const myDocs = myVerRes.data.data;
  const foundNin = myDocs.find(d => d.id === ninVerId);
  assert(!!foundNin, 'Submitted NIN appears in seller personal compliance records');

  // ----------------------------------------------------
  // STEP 4: Dealer CAC Document Submission
  // ----------------------------------------------------
  logSub('Step 4: Dealership CAC Certificate Submission');

  const cacCertUrl = 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679253/carplug/kyc/cac-cert-crown.pdf';
  const dealerCacRes = await api('/verifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${dealerToken}` },
    body: JSON.stringify({
      entityType: 'dealer_cac',
      entityId: 'dealer-crown-autos',
      documentUrl: cacCertUrl,
      vin: 'RC-1490284',
      notes: 'Corporate Affairs Commission Certificate of Incorporation for Crown Continental Autos Ltd',
    }),
  });
  assert(dealerCacRes.status === 201, 'POST /verifications queued Dealer CAC with 201 Created');
  const cacVer = dealerCacRes.data.data;
  assert(cacVer.status === 'pending', "CAC verification status initialized as 'pending'");
  const cacVerId = cacVer.id;

  // ----------------------------------------------------
  // STEP 5: Customs SGD Document Submission for Vehicle
  // ----------------------------------------------------
  logSub('Step 5: Nigerian Customs Single Goods Declaration (SGD) Submission');

  // Candidate vehicle with Local Registration: v-ford-explorer-2018
  const targetVehId = 'v-ford-explorer-2018';
  const targetVehVin = '1FM5K8F84JGA81920';
  const sgdDocUrl = 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679253/carplug/kyc/customs-sgd-1FM5K8F84JGA81920.pdf';

  const customsSgdRes = await api('/verifications', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({
      entityType: 'customs_sgd',
      entityId: targetVehId,
      vin: targetVehVin,
      documentUrl: sgdDocUrl,
      notes: 'Nigerian Customs Service C-Numbered Single Goods Declaration (SGD) Bill of Entry',
    }),
  });
  assert(customsSgdRes.status === 201, 'POST /verifications queued Customs SGD document with 201 Created');
  const sgdVer = customsSgdRes.data.data;
  assert(sgdVer.status === 'pending', "Customs SGD verification initialized as 'pending'");
  const sgdVerId = sgdVer.id;

  // ----------------------------------------------------
  // STEP 6: Super Admin Compliance Queue & Audits
  // ----------------------------------------------------
  logSub('Step 6: Super Admin Compliance Queue & Review Desk');

  // Super Admin queries pending verifications
  const adminQueueRes = await api('/verifications?status=pending', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminQueueRes.status === 200, 'GET /verifications?status=pending returned 200 OK for Super Admin');
  const pendingDocs = adminQueueRes.data.data;
  assert(pendingDocs.some(d => d.id === ninVerId), 'Seller NIN found in admin pending compliance queue');
  assert(pendingDocs.some(d => d.id === cacVerId), 'Dealer CAC found in admin pending compliance queue');
  assert(pendingDocs.some(d => d.id === sgdVerId), 'Customs SGD found in admin pending compliance queue');

  // ----------------------------------------------------
  // STEP 7: Automated Compliance Approval Actions & Side-Effects
  // ----------------------------------------------------
  logSub('Step 7: Automated Compliance Approval Actions & Platform Side-Effects');

  // 1. Admin Approves Seller NIN
  const approveNinRes = await api(`/verifications/${ninVerId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'approved',
      notes: 'NIN verified successfully against NIMC database',
    }),
  });
  assert(approveNinRes.status === 200, `Admin approved Seller NIN verification (${ninVerId})`);

  // Verify Seller KYC side-effects in PostgreSQL
  const refreshedSellerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'seller.babatunde@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(refreshedSellerLogin.data.user?.isIdentityVerified === true, 'Side-Effect 1A: Seller isIdentityVerified promoted to true');
  assert(refreshedSellerLogin.data.user?.kycStatus === 'approved', "Side-Effect 1B: Seller kycStatus promoted to 'approved'");

  // 2. Admin Approves Dealer CAC
  const approveCacRes = await api(`/verifications/${cacVerId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'approved',
      notes: 'CAC verified against Corporate Affairs Commission public portal',
    }),
  });
  assert(approveCacRes.status === 200, `Admin approved Dealer CAC verification (${cacVerId})`);

  // Verify Dealer Showroom side-effect
  const refreshedDealerShop = await api('/dealers/crown-continental-autos');
  assert(refreshedDealerShop.status === 200, 'GET /dealers/crown-continental-autos returned 200 OK');
  assert(refreshedDealerShop.data.verifiedCAC === true, 'Side-Effect 2: Dealer showroom verifiedCAC set to true');

  // 3. Admin Approves Vehicle Customs SGD
  const approveSgdRes = await api(`/verifications/${sgdVerId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'approved',
      notes: 'Customs SGD duty paid in full; C-number verified at Tin Can Island Command',
    }),
  });
  assert(approveSgdRes.status === 200, `Admin approved Customs SGD verification (${sgdVerId})`);

  // Verify Vehicle Listing promotion side-effects
  const upgradedVehicleRes = await api(`/vehicles/${targetVehId}`);
  assert(upgradedVehicleRes.status === 200, `GET /vehicles/${targetVehId} returned 200 OK`);
  const upgradedCar = upgradedVehicleRes.data;
  assert(upgradedCar.customsDoc === true, 'Side-Effect 3A: Vehicle customsDoc promoted to true');
  assert(upgradedCar.customsStatus === 'Fully Cleared', "Side-Effect 3B: Vehicle customsStatus promoted to 'Fully Cleared'");
  assert(upgradedCar.trustTier >= 3, `Side-Effect 3C: Vehicle Trust Tier promoted to Tier ${upgradedCar.trustTier} (${upgradedCar.trustTierLabel})`);

  logHeader('FLOW 8 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 8 VERIFICATION FAILED:', err);
  process.exit(1);
});
