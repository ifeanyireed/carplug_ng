// test_flow6.js - Flow 6 Verification Suite
// Flow 6: Certified 150-Point Inspection, Escrow Deposit & Tier 5 Upgrade

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 600;

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
  const clientIp = options.ip || `192.168.7.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 6 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Buyer, Technician, Super Admin)');

  // 1. Buyer: Dr. Chidi Nwosu
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(buyerLogin.status === 200, 'Authenticated as Buyer Dr. Chidi (buyer.chidi@mycars.ng)');
  assert(buyerLogin.data.user?.role === 'buyer', "User role is 'buyer'");
  assert(buyerLogin.data.user?.isVerified === true, 'Buyer account is email-verified');
  const buyerToken = buyerLogin.data.token;
  const buyerId = buyerLogin.data.user.id;

  // 2. Technician: Musa Danladi, ASE-Cert
  const techLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'tech.musa@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(techLogin.status === 200, 'Authenticated as Technician Musa Danladi (tech.musa@mycars.ng)');
  assert(techLogin.data.user?.role === 'technician', "User role is 'technician'");
  const techToken = techLogin.data.token;
  const techUserId = techLogin.data.user.id;

  // 3. Super Admin
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'mycarsnigeria@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  assert(adminLogin.status === 200, 'Authenticated as Super Admin (mycarsnigeria@gmail.com)');
  const adminToken = adminLogin.data.token;

  // 4. Intruder Dealer: Crown Continental
  const crownLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'dealer.crown@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  const crownToken = crownLogin.data.token;

  // ----------------------------------------------------
  // STEP 2: RBAC Security Boundary Enforcements
  // ----------------------------------------------------
  logSub('Step 2: RBAC Security Boundary Enforcements');

  // 1. Unauthenticated payment initialization blocked with 401
  const unauthPayment = await api('/payments/initialize', {
    method: 'POST',
    body: JSON.stringify({
      type: 'inspection_escrow',
      amount: 45000,
    }),
  });
  assert(unauthPayment.status === 401, 'Unauthenticated payment initialization blocked with 401 Unauthorized');

  // 2. Inspection creation without funded escrow blocked with 400
  const noEscrowInsp = await api('/inspections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      vehicleId: 'v-dummy-car',
      technicianId: techUserId,
    }),
  });
  assert(noEscrowInsp.status === 400, 'Inspection creation without escrow blocked with 400 Bad Request');
  assert(noEscrowInsp.data.error.includes('escrowTransactionId is required'), 'Correct validation error returned');

  // 3. Buyer attempting to submit inspection report blocked with 403
  const buyerReportBlock = await api('/inspections/insp-dummy/report', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ overallScore: 90 }),
  });
  assert(buyerReportBlock.status === 403, 'Buyer role blocked from submitting inspection reports with 403 Forbidden');

  // ----------------------------------------------------
  // STEP 3: Escrow Payment Initialization (POST /payments/initialize)
  // ----------------------------------------------------
  logSub('Step 3: Escrow Payment Initialization (₦45,000)');

  // Identify candidate vehicle for inspection
  const vehiclesRes = await api('/vehicles');
  assert(vehiclesRes.status === 200, 'GET /vehicles returned 200 OK');
  const targetVehicle = vehiclesRes.data.data.find(v => v.trustTier < 5) || vehiclesRes.data.data[0];
  assert(!!targetVehicle, `Target vehicle for inspection: "${targetVehicle.title}" (${targetVehicle.id})`);
  console.log(`   [INFO] Current Vehicle Trust Tier: Tier ${targetVehicle.trustTier} (${targetVehicle.trustTierLabel || 'Pre-Audit'})`);

  const escrowAmount = 45000; // Premium Diagnostic Tier fee
  const initPaymentRes = await api('/payments/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      type: 'inspection_escrow',
      amount: escrowAmount,
      entityId: targetVehicle.id,
      title: `150-Point Certified Inspection Escrow: ${targetVehicle.title}`,
      gateway: 'paystack',
    }),
  });
  assert(initPaymentRes.status === 200 || initPaymentRes.status === 201, 'POST /payments/initialize returned 200/201 OK');
  const escrowTxn = initPaymentRes.data.transaction || initPaymentRes.data.data;
  assert(!!escrowTxn && !!escrowTxn.id, `Escrow transaction generated: ${escrowTxn?.id}`);
  assert(escrowTxn.status === 'held_in_escrow', `Transaction status initialized as 'held_in_escrow'`);
  assert(escrowTxn.amount === escrowAmount, `Escrow amount confirmed at ₦${escrowAmount.toLocaleString()}`);
  const escrowTxnId = escrowTxn.id;

  // ----------------------------------------------------
  // STEP 4: Inspection Order Creation & Double-Spend Defense
  // ----------------------------------------------------
  logSub('Step 4: Inspection Order Creation & Double-Spend Defense');

  const timestamp = Date.now();
  const inspectionPayload = {
    id: `insp-qa-${timestamp.toString().slice(-6)}`,
    vehicleId: targetVehicle.id,
    vehicleTitle: targetVehicle.title,
    vehicleVin: targetVehicle.vin,
    buyerId: buyerId,
    escrowTransactionId: escrowTxnId,
    technicianId: techUserId,
    technicianName: 'Musa Danladi, ASE-Cert',
    inspectionTier: 'Premium Diagnostic',
    status: 'requested',
    scheduledDate: '2026-11-28',
  };

  const createInspRes = await api('/inspections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify(inspectionPayload),
  });
  assert(createInspRes.status === 201, 'POST /inspections created dispatch with 201 Created');
  const inspection = createInspRes.data;
  assert(inspection.id === inspectionPayload.id, `Inspection ID verified: ${inspection.id}`);
  assert(inspection.status === 'requested', `Inspection initial status is 'requested'`);
  assert(inspection.escrowTransactionId === escrowTxnId, `Escrow transaction bound to inspection (${inspection.escrowTransactionId})`);

  // Double-spend guard: attempt to reuse the exact same escrow transaction
  const duplicateEscrowRes = await api('/inspections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      ...inspectionPayload,
      id: `insp-qa-duplicate-${Date.now()}`,
    }),
  });
  assert(duplicateEscrowRes.status === 400, 'Duplicate use of same escrow transaction blocked with 400 Bad Request');
  assert(duplicateEscrowRes.data.error.includes('already been linked'), 'Double-spend defense confirmed');

  // ----------------------------------------------------
  // STEP 5: Technician Dispatch Queue & Status Progression
  // ----------------------------------------------------
  logSub('Step 5: Technician Dispatch Queue & Status Progression');

  // Musa queries his active dispatches
  const techQueueRes = await api('/technicians/me/inspections', {
    headers: { Authorization: `Bearer ${techToken}` },
  });
  assert(techQueueRes.status === 200, 'GET /technicians/me/inspections returned 200 OK for Musa');
  const queue = techQueueRes.data.data || techQueueRes.data;
  const assignedDispatch = Array.isArray(queue) && queue.find(i => i.id === inspection.id);
  assert(!!assignedDispatch, `Assigned inspection found in Musa's technician console: ${assignedDispatch?.id}`);
  assert(assignedDispatch.vehicleTitle === targetVehicle.title, 'Vehicle title matches booked listing');

  // Musa updates status to 'in_progress'
  const progressRes = await api(`/inspections/${inspection.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ status: 'in_progress' }),
  });
  assert(progressRes.status === 200, `PATCH /inspections/${inspection.id}/status updated to 'in_progress'`);

  // Intruder dealer attempting to submit report for Musa's dispatch
  const dealerHijackReport = await api(`/inspections/${inspection.id}/report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${crownToken}` },
    body: JSON.stringify({ overallScore: 95 }),
  });
  assert(dealerHijackReport.status === 403, 'Intruder dealer blocked from submitting report with 403 Forbidden');

  // ----------------------------------------------------
  // STEP 6: Report Submission & Atomic Database Actions
  // ----------------------------------------------------
  logSub('Step 6: Digital 150-Point Report Submission & Atomic Actions');

  const reportPayload = {
    overallScore: 88,
    technicianSummary: 'Comprehensive 150-point diagnostic audit completed. Powertrain in excellent condition. OBD-II telemetry clear of DTC fault codes. Brake pads 75% life.',
    repairCostMin: 35000,
    repairCostMax: 70000,
    categories: [
      { name: 'Engine & Transmission', score: 92, defects: 'Pristine cylinder compression' },
      { name: 'Electrical & OBD-II', score: 95, defects: 'Zero active or pending DTC codes' },
      { name: 'Suspension & Steering', score: 84, defects: 'Minor front lower control arm bushing wear' },
      { name: 'Brakes & Tyres', score: 86, defects: 'Tyre tread depth 6.2mm across all 4 wheels' },
      { name: 'Body & Chassis Laser Scan', score: 89, defects: 'Original factory paint; no structural welds' },
      { name: 'Interior & AC Climate', score: 82, defects: 'Cabin air filter due for routine replacement' },
    ],
    media: [
      'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679185/carplug/cars/car14.jpg',
      'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679186/carplug/cars/car15.jpg',
    ],
  };

  const submitRes = await api(`/inspections/${inspection.id}/report`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify(reportPayload),
  });
  assert(submitRes.status === 200, `Musa POST /inspections/${inspection.id}/report succeeded with 200 OK`);

  const reportData = submitRes.data;
  assert(reportData.data.status === 'completed', "Inspection report status finalized as 'completed'");
  assert(reportData.escrowTransaction?.status === 'settled', "Atomic Action 1: Escrow transaction released to 'settled'");
  assert(reportData.earningTransaction?.amount === escrowAmount, `Atomic Action 2: Musa credited with ₦${escrowAmount.toLocaleString()} earnings`);
  assert(reportData.earningTransaction?.type === 'inspection_earning', "Earning categorized as 'inspection_earning'");

  // Verify Vehicle Atomic Upgrade to Tier 5
  const upgradedVehicleRes = await api(`/vehicles/${targetVehicle.id}`);
  assert(upgradedVehicleRes.status === 200, `GET /vehicles/${targetVehicle.id} returned 200 OK`);
  const upgradedCar = upgradedVehicleRes.data;
  assert(upgradedCar.trustTier === 5, `Atomic Action 3: Vehicle upgraded to Trust Tier 5 (Current: Tier ${upgradedCar.trustTier})`);
  assert(upgradedCar.trustTierLabel.includes('Tier 5') || upgradedCar.trustTierLabel.includes('150-Point'), `Trust Tier label updated: "${upgradedCar.trustTierLabel}"`);
  assert(upgradedCar.healthScore === 88, `Vehicle health score updated to: ${upgradedCar.healthScore}% Certified`);
  assert(upgradedCar.latestInspectionId === inspection.id, `Linked latestInspectionId verified (${upgradedCar.latestInspectionId})`);

  // ----------------------------------------------------
  // STEP 7: Technician Wallet Balance & Bank Payout Lifecycle
  // ----------------------------------------------------
  logSub('Step 7: Technician Wallet & Bank Payout Lifecycle');

  // 1. Musa checks wallet balance
  const walletRes = await api('/payments/wallet', {
    headers: { Authorization: `Bearer ${techToken}` },
  });
  assert(walletRes.status === 200, 'GET /payments/wallet returned 200 OK for Musa');
  const wallet = walletRes.data;
  assert(wallet.balance >= escrowAmount, `Musa available balance reflects released fee: ₦${wallet.balance.toLocaleString()}`);
  assert(wallet.currency === 'NGN', `Wallet currency is NGN`);

  // 2. Musa requests bank payout of ₦40,000
  const payoutAmount = 40000;
  const payoutRes = await api('/payments/payout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({
      amount: payoutAmount,
      bankName: 'Access Bank Nigeria',
      accountNumber: '0123456789',
      accountName: 'Musa Danladi',
    }),
  });
  assert(payoutRes.status === 201, 'POST /payments/payout created payout request with 201 Created');
  const payoutTxn = payoutRes.data.transaction;
  assert(payoutTxn.status === 'pending', "Payout initial status is 'pending'");
  assert(payoutTxn.type === 'tech_payout', "Transaction type is 'tech_payout'");
  assert(payoutTxn.amount === payoutAmount, `Payout amount is ₦${payoutAmount.toLocaleString()}`);
  const payoutTxnId = payoutTxn.id;

  // 3. Super Admin audits master ledger and settles payout
  const adminTxnsRes = await api(`/payments/transactions?type=tech_payout`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminTxnsRes.status === 200, 'GET /payments/transactions returned 200 OK for Super Admin');
  const txns = adminTxnsRes.data.data;
  const foundPayout = txns.find(t => t.id === payoutTxnId);
  assert(!!foundPayout, `Pending payout identified in master admin ledger (${foundPayout?.id})`);

  // 4. Admin settles payout
  const settlePayoutRes = await api(`/payments/payouts/${payoutTxnId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'settled',
      notes: 'Disbursed via NIP Instant Transfer REF-NIP-998811',
    }),
  });
  assert(settlePayoutRes.status === 200, `Admin PATCH /payments/payouts/${payoutTxnId}/status updated status to 'settled'`);

  // 5. Musa re-verifies wallet balance reflects deduction
  const updatedWalletRes = await api('/payments/wallet', {
    headers: { Authorization: `Bearer ${techToken}` },
  });
  assert(updatedWalletRes.status === 200, 'Musa re-queried wallet balance');
  const updatedWallet = updatedWalletRes.data;
  assert(updatedWallet.balance === wallet.balance - payoutAmount, `Wallet correctly decremented by payout amount (New Balance: ₦${updatedWallet.balance.toLocaleString()})`);

  logHeader('FLOW 6 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 6 VERIFICATION FAILED:', err);
  process.exit(1);
});
