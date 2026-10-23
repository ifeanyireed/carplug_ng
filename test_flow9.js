// test_flow9.js - Flow 9 Verification Suite
// Flow 9: Financial Ledger, Webhook Verification & Payouts

const crypto = require('crypto');

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_c72d8273e6f39a8344209bc10cc89c9a12f1e9f6';
let ipCounter = 900;

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

function signPaystackWebhook(bodyString, secretKey) {
  return crypto.createHmac('sha512', secretKey).update(bodyString).digest('hex');
}

async function run() {
  logHeader('CARPLUG NIGERIA - FLOW 9 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Buyer, Technician, Super Admin)');

  // 1. Super Admin: mycarsnigeria@gmail.com
  const adminLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'mycarsnigeria@gmail.com',
      password: STANDARD_PASS,
    }),
  });
  assert(adminLogin.status === 200, 'Authenticated as Super Admin (mycarsnigeria@gmail.com)');
  assert(adminLogin.data.user?.role === 'admin', "User role is 'admin'");
  const adminToken = adminLogin.data.token;

  // 2. Buyer: Dr. Chidi Nwosu
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(buyerLogin.status === 200, 'Authenticated as Buyer Dr. Chidi (buyer.chidi@mycars.ng)');
  const buyerToken = buyerLogin.data.token;
  const buyerId = buyerLogin.data.user.id;

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
  const techUserId = techLogin.data.user.id;

  // ----------------------------------------------------
  // STEP 2: Paystack Webhook HMAC-SHA512 Verification & Tamper Defense
  // ----------------------------------------------------
  logSub('Step 2: Paystack Webhook HMAC-SHA512 Verification & Tamper Defense');

  // Initialize a payment to test webhook reconciliation against
  const testAmount = 45000;
  const initPaymentRes = await api('/payments/initialize', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      type: 'inspection_escrow',
      amount: testAmount,
      entityId: 'v-toyota-camry-2020',
      title: 'Webhook Test Escrow Funding',
      gateway: 'paystack',
    }),
  });
  assert(initPaymentRes.status === 201 || initPaymentRes.status === 200, 'POST /payments/initialize returned 200/201 OK');
  const txn = initPaymentRes.data.transaction || initPaymentRes.data.data;
  const testRef = txn.reference;
  assert(!!testRef, `Test transaction generated with reference: ${testRef}`);

  const webhookBody = JSON.stringify({
    event: 'charge.success',
    data: {
      id: 99881122,
      domain: 'test',
      status: 'success',
      reference: testRef,
      amount: testAmount * 100, // kobo
      gateway_response: 'Successful',
      paid_at: new Date().toISOString(),
      channel: 'card',
      currency: 'NGN',
    },
  });

  // 1. Forged / Missing HMAC Signature -> MUST be rejected with 401 Unauthorized
  const forgedWebhookRes = await api('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-paystack-signature': 'forged_fake_signature_380291482098',
    },
    body: webhookBody,
  });
  assert(forgedWebhookRes.status === 401, 'Tampered/Forged webhook signature rejected with 401 Unauthorized');
  assert(forgedWebhookRes.data.error.includes('Invalid webhook signature'), 'Cryptographic signature mismatch error confirmed');

  // 2. Valid HMAC SHA-512 Signature -> MUST succeed with 200 OK
  const validSignature = signPaystackWebhook(webhookBody, PAYSTACK_SECRET_KEY);
  const validWebhookRes = await api('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-paystack-signature': validSignature,
    },
    body: webhookBody,
  });
  assert(validWebhookRes.status === 200, 'Legitimate Paystack webhook accepted with 200 OK');
  assert(validWebhookRes.data.status === 'success', "Webhook processed status is 'success'");

  // 3. Idempotency Guard: Re-dispatching the exact same webhook must not double-process or fail
  const duplicateWebhookRes = await api('/payments/webhook', {
    method: 'POST',
    headers: {
      'x-paystack-signature': validSignature,
    },
    body: webhookBody,
  });
  assert(duplicateWebhookRes.status === 200, 'Duplicate webhook replay handled idempotently with 200 OK');

  // ----------------------------------------------------
  // STEP 3: Payment Verification Callback Reconciliation (GET /payments/verify/:reference)
  // ----------------------------------------------------
  logSub('Step 3: Payment Verification Callback Reconciliation');

  const verifyRes = await api(`/payments/verify/${testRef}`);
  assert(verifyRes.status === 200, `GET /payments/verify/${testRef} returned 200 OK`);
  const verifyData = verifyRes.data;
  assert(verifyData.status === 'success', "Verification response status confirmed as 'success'");
  assert(verifyData.verified === true, 'Online verification flag confirmed as true');
  assert(verifyData.transaction.reference === testRef, `Transaction reference verified (${verifyData.transaction.reference})`);
  assert(verifyData.transaction.status === 'held_in_escrow', "Escrow status confirmed as 'held_in_escrow'");

  // ----------------------------------------------------
  // STEP 4: Master Ledger Audit & Metrics Breakdown (Super Admin)
  // ----------------------------------------------------
  logSub('Step 4: Master Ledger Audit & Metrics Breakdown');

  // 1. Super Admin retrieves platform ledger
  const ledgerRes = await api('/payments/transactions', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(ledgerRes.status === 200, 'GET /payments/transactions returned 200 OK for Super Admin');
  const ledger = ledgerRes.data;
  assert(typeof ledger.total === 'number' && ledger.total > 0, `Total transactions recorded in ledger: ${ledger.total}`);
  assert(typeof ledger.totalVolume === 'number' && ledger.totalVolume > 0, `Total processed volume: ₦${ledger.totalVolume.toLocaleString()}`);
  assert(typeof ledger.escrowVolume === 'number', `Escrow held reserves: ₦${ledger.escrowVolume.toLocaleString()}`);
  assert(typeof ledger.settledVolume === 'number' && ledger.settledVolume > 0, `Settled volume: ₦${ledger.settledVolume.toLocaleString()}`);
  assert(Array.isArray(ledger.data) && ledger.data.length > 0, `Ledger line items returned: ${ledger.data.length}`);

  // 2. Type-based ledger filtering
  const escrowFilterRes = await api('/payments/transactions?type=inspection_escrow', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(escrowFilterRes.status === 200, 'GET /payments/transactions?type=inspection_escrow filtered successfully');
  assert(escrowFilterRes.data.data.every(t => t.type === 'inspection_escrow'), 'All returned records are inspection_escrow transactions');

  // 3. Multi-Tenant Cross-Access Barrier: Buyer querying ledger sees ONLY their own records
  const buyerLedgerRes = await api('/payments/transactions', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(buyerLedgerRes.status === 200, 'GET /payments/transactions returned 200 OK for Buyer');
  assert(buyerLedgerRes.data.data.every(t => t.userId === buyerId), 'Buyer ledger view strictly isolated to buyer personal transactions');

  // ----------------------------------------------------
  // STEP 5: Technician Payout Governance & Settlement Lifecycle
  // ----------------------------------------------------
  logSub('Step 5: Technician Payout Governance & Settlement Lifecycle');

  // 1. Musa checks current available wallet balance
  const walletRes = await api('/payments/wallet', {
    headers: { Authorization: `Bearer ${techToken}` },
  });
  assert(walletRes.status === 200, 'GET /payments/wallet returned 200 OK for Musa');
  const availableBal = walletRes.data.balance;
  assert(availableBal >= 20000, `Musa wallet has available settled funds: ₦${availableBal.toLocaleString()}`);

  // 2. Musa submits payout request of ₦20,000
  const payoutAmount = 20000;
  const payoutReqRes = await api('/payments/payout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({
      amount: payoutAmount,
      bankName: 'Zenith Bank PLC',
      accountNumber: '2081192834',
      accountName: 'Musa Danladi',
    }),
  });
  assert(payoutReqRes.status === 201, 'POST /payments/payout created payout request with 201 Created');
  const payoutTxn = payoutReqRes.data.transaction;
  assert(payoutTxn.status === 'pending', "Payout status initialized as 'pending'");
  assert(payoutTxn.type === 'tech_payout', "Transaction type is 'tech_payout'");
  assert(payoutTxn.amount === payoutAmount, `Payout amount confirmed at ₦${payoutAmount.toLocaleString()}`);
  const payoutTxnId = payoutTxn.id;

  // 3. Security Check: Non-admins blocked from updating payout status
  const buyerPayoutMod = await api(`/payments/payouts/${payoutTxnId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ status: 'settled' }),
  });
  assert(buyerPayoutMod.status === 403, 'Buyer blocked from approving payout with 403 Forbidden');

  const techPayoutMod = await api(`/payments/payouts/${payoutTxnId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ status: 'settled' }),
  });
  assert(techPayoutMod.status === 403, 'Technician self-approval blocked with 403 Forbidden');

  // 4. Super Admin Approves & Settles Bank Payout
  const settlePayoutRes = await api(`/payments/payouts/${payoutTxnId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'settled',
      notes: 'Disbursed via NIP Instant Bank Settlement REF-NIP-20261022-9018',
    }),
  });
  assert(settlePayoutRes.status === 200, `Admin approved payout (${payoutTxnId}) with 200 OK`);
  assert(settlePayoutRes.data.transaction.status === 'settled', "Payout transaction finalized as 'settled'");

  // ----------------------------------------------------
  // STEP 6: Payout Compliance Rejection & Audit Notes Flow
  // ----------------------------------------------------
  logSub('Step 6: Payout Compliance Rejection & Audit Notes Flow');

  // Musa requests another small payout of ₦10,000
  const smallPayoutRes = await api('/payments/payout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({
      amount: 10000,
      bankName: 'Kuda Microfinance Bank',
      accountNumber: '9998887776',
      accountName: 'Musa Wrong Name',
    }),
  });
  assert(smallPayoutRes.status === 201, 'Second payout created for compliance rejection test');
  const rejectedPayoutId = smallPayoutRes.data.transaction.id;

  // Admin rejects payout due to account name discrepancy
  const rejectReason = 'Account name does not match BVN identity on file';
  const rejectRes = await api(`/payments/payouts/${rejectedPayoutId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'refunded',
      notes: rejectReason,
    }),
  });
  assert(rejectRes.status === 200, `Admin rejected non-compliant payout with 200 OK`);
  assert(rejectRes.data.transaction.status === 'refunded', "Payout transaction marked as 'refunded'");
  assert(rejectRes.data.transaction.notes === rejectReason, 'Compliance rejection reason attached to transaction record');

  logHeader('FLOW 9 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 9 VERIFICATION FAILED:', err);
  process.exit(1);
});
