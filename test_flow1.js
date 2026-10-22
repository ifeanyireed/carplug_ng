// test_flow1.js - Flow 1 Verification Suite
// Flow 1: Authentication, Onboarding & Role-Based Access Control (RBAC)

const { execSync } = require('child_process');

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';

const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 10;

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
  const clientIp = options.ip || `192.168.2.${++ipCounter}`;
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

function getOTPFromDB(email) {
  try {
    const raw = execSync(`./backend/bin/get_otp "${email}" 2>/dev/null`, { encoding: 'utf8' });
    const match = raw.trim().match(/(\d{6})$/);
    if (match) return match[1];
    return raw.trim().slice(-6);
  } catch (err) {
    console.warn('   [WARN] Could not retrieve OTP via helper binary:', err.message);
    return null;
  }
}

async function run() {
  logHeader('CARPLUG NIGERIA - FLOW 1 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);

  // ----------------------------------------------------
  // STEP 1: Baseline Health Check
  // ----------------------------------------------------
  logSub('Step 1: Baseline Health Check (GET /health)');
  const health = await api('/health', { method: 'GET' });
  assert(health.status === 200, `Health check returned 200 OK (got ${health.status})`);
  assert(health.data.database === 'connected', `Database connection is active (${health.data.database})`);

  // ----------------------------------------------------
  // STEP 2: Authenticate Pre-Seeded Test Accounts across All 5 Roles
  // ----------------------------------------------------
  logSub('Step 2: Authenticate Pre-Seeded Accounts Across All 5 Roles');

  const testAccounts = [
    { role: 'admin', email: 'mycarsnigeria@gmail.com', name: 'Super Admin' },
    { role: 'dealer', email: 'carsplug0@gmail.com', name: 'Dew Autos (Dealer 1)' },
    { role: 'dealer', email: 'dealer.crown@mycars.ng', name: 'Crown Continental (Dealer 2)' },
    { role: 'seller', email: 'seller.babatunde@mycars.ng', name: 'Babatunde Olumide (Seller)' },
    { role: 'technician', email: 'tech.musa@mycars.ng', name: 'Musa Danladi (Technician)' },
    { role: 'buyer', email: 'buyer.chidi@mycars.ng', name: 'Dr. Chidi Nwosu (Buyer)' },
  ];

  const tokens = {};

  for (const acc of testAccounts) {
    const login = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: acc.email, password: STANDARD_PASS }),
    });

    assert(login.status === 200, `Login succeeded for ${acc.name} (${acc.email})`);
    assert(login.data.user?.role === acc.role, `Account role matches expected '${acc.role}' (got '${login.data.user?.role}')`);
    assert(typeof login.data.token === 'string' && login.data.token.length > 20, `Valid JWT returned for ${acc.role}`);

    tokens[acc.role] = login.data.token;

    // Verify GET /auth/me with Bearer token
    const me = await api('/auth/me', {
      method: 'GET',
      headers: { Authorization: `Bearer ${login.data.token}` },
    });
    assert(me.status === 200, `/auth/me resolved profile for ${acc.name}`);
    assert(me.data.user?.email === acc.email, `/auth/me returned correct email '${acc.email}'`);
  }

  // Test invalid credentials
  const badLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'buyer.chidi@mycars.ng', password: 'WrongPassword123!' }),
  });
  assert(badLogin.status === 401, `Invalid password rejected with 401 Unauthorized (got ${badLogin.status})`);

  // ----------------------------------------------------
  // STEP 3: Rate Limiting & Anti-Brute-Force Enforcement
  // ----------------------------------------------------
  logSub('Step 3: Rate Limiting Defense Verification');
  const fixedRateIp = '10.99.88.77';
  let rateLimited = false;
  for (let i = 1; i <= 6; i++) {
    const res = await api('/auth/login', {
      method: 'POST',
      ip: fixedRateIp,
      body: JSON.stringify({ email: 'rate.limit.test@mycars.ng', password: 'wrong' }),
    });
    if (res.status === 429) {
      rateLimited = true;
      break;
    }
  }
  assert(rateLimited, `RateLimit middleware actively blocks brute-force attacks with 429 Too Many Requests`);

  // ----------------------------------------------------
  // STEP 4: User Registration Validation & Constraints
  // ----------------------------------------------------
  logSub('Step 4: User Registration Validation & Constraints');

  const timestamp = Date.now();
  const testEmail = `qa_tester_${timestamp}@mycars.ng`;

  // Weak password test (< 8 chars)
  const weakPassRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Weak Password Tester',
      email: `weak_${timestamp}@example.com`,
      password: 'short',
      role: 'buyer',
    }),
  });
  assert(weakPassRes.status === 400, `Weak password (<8 chars) rejected with 400 Bad Request`);

  // Invalid email format test
  const badEmailRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bad Email Tester',
      email: 'not-an-email',
      password: STANDARD_PASS,
      role: 'buyer',
    }),
  });
  assert(badEmailRes.status === 400, `Malformed email rejected with 400 Bad Request`);

  // Valid registration
  console.log(`   Registering fresh candidate account: ${testEmail}...`);
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Handover QA Candidate',
      email: testEmail,
      phone: '+2348099887766',
      password: STANDARD_PASS,
      role: 'buyer',
    }),
  });
  assert(regRes.status === 201, `Candidate registration returned 201 Created`);
  assert(regRes.data.user?.isVerified === false, `New account initialized with isVerified=false`);
  assert(regRes.data.user?.role === 'buyer', `Account role initialized as 'buyer'`);
  let candidateToken = regRes.data.token;

  // Duplicate email registration test
  const dupRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Duplicate Email Tester',
      email: testEmail,
      password: STANDARD_PASS,
      role: 'buyer',
    }),
  });
  assert(dupRes.status === 409, `Duplicate email registration blocked with 409 Conflict`);

  // ----------------------------------------------------
  // STEP 5: Privilege Escalation Prevention
  // ----------------------------------------------------
  logSub('Step 5: Privilege Escalation Prevention');

  const rogueEmail = `rogue_admin_${timestamp}@mycars.ng`;
  const rogueRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rogue Admin Attempt',
      email: rogueEmail,
      password: STANDARD_PASS,
      role: 'admin', // Attempting to register as admin!
    }),
  });
  assert(rogueRes.status === 201, `Registration accepted without crashing`);
  assert(rogueRes.data.user?.role === 'buyer', `Server silently downgraded rogue 'admin' role to 'buyer' (got '${rogueRes.data.user?.role}')`);

  // Verify in /auth/me that role is buyer in database
  const rogueMe = await api('/auth/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${rogueRes.data.token}` },
  });
  assert(rogueMe.data.user?.role === 'buyer', `Persisted database role is strictly 'buyer'`);

  // ----------------------------------------------------
  // STEP 6: Email Verification Guard & OTP Flow
  // ----------------------------------------------------
  logSub('Step 6: Email Verification Enforcement & OTP Verification');

  // Attempt role upgrade while unverified -> must return 403 Forbidden
  const unverifiedUpgrade = await api('/auth/upgrade-role', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({ role: 'seller' }),
  });
  assert(unverifiedUpgrade.status === 403, `Unverified user blocked from upgrading role with 403 Forbidden (RequireVerifiedEmail middleware working)`);

  // Test invalid OTP code submission
  const badOTP = await api('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      code: '000000',
      type: 'signup',
    }),
  });
  assert(badOTP.status === 400, `Incorrect OTP rejected with 400 Bad Request`);

  // Retrieve valid OTP generated for testEmail
  console.log(`   Fetching OTP code for ${testEmail}...`);
  const otpCode = getOTPFromDB(testEmail);
  if (otpCode && /^\d{6}$/.test(otpCode)) {
    console.log(`   Retrieved valid OTP code from database: ${otpCode}`);

    const verifyRes = await api('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        code: otpCode,
        type: 'signup',
      }),
    });
    assert(verifyRes.status === 200, `Valid OTP code verification returned 200 OK`);
    assert(verifyRes.data.user?.isVerified === true, `User profile updated to isVerified=true`);
    assert(typeof verifyRes.data.token === 'string', `New verified JWT token issued`);
    candidateToken = verifyRes.data.token;

    // Test replay attack: Re-using the same OTP code should fail
    const reuseOTP = await api('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: testEmail,
        code: otpCode,
        type: 'signup',
      }),
    });
    assert(reuseOTP.status === 400, `Re-use of already consumed OTP rejected with 400 Bad Request`);
  } else {
    console.log('   [INFO] OTP helper binary returned null; skipping dynamic OTP verify step.');
  }

  // ----------------------------------------------------
  // STEP 7: Verified Role Upgrade Flow (Buyer -> Seller -> Dealer)
  // ----------------------------------------------------
  logSub('Step 7: Role Upgrade Lifecycle (Buyer -> Seller -> Dealer)');

  // Upgrade candidate to Seller
  const upgradeSeller = await api('/auth/upgrade-role', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({ role: 'seller' }),
  });
  assert(upgradeSeller.status === 200, `Role upgrade to 'seller' returned 200 OK`);
  assert(upgradeSeller.data.user?.role === 'seller', `Candidate role upgraded to 'seller'`);
  candidateToken = upgradeSeller.data.token;

  // Upgrade candidate to Dealer (Auto-provisions DealerShop)
  const upgradeDealer = await api('/auth/upgrade-role', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({ role: 'dealer' }),
  });
  assert(upgradeDealer.status === 200, `Role upgrade to 'dealer' returned 200 OK`);
  assert(upgradeDealer.data.user?.role === 'dealer', `Candidate role upgraded to 'dealer'`);
  candidateToken = upgradeDealer.data.token;

  // Check that DealerShop was provisioned
  const dealerShop = await api('/dealers/me', {
    method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert(dealerShop.status === 200, `Dealer shop profile auto-provisioned upon dealer upgrade`);

  // Attempt invalid role upgrade
  const badUpgrade = await api('/auth/upgrade-role', {
    method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({ role: 'superadmin' }),
  });
  assert(badUpgrade.status === 400, `Invalid target role upgrade rejected with 400 Bad Request`);

  // ----------------------------------------------------
  // STEP 8: Route Guards & RBAC Boundary Enforcement
  // ----------------------------------------------------
  logSub('Step 8: Route Guards & RBAC Boundary Matrix');

  // 1. Unauthenticated request to /auth/me
  const unauthMe = await api('/auth/me');
  assert(unauthMe.status === 401, `Unauthenticated /auth/me rejected with 401 Unauthorized`);

  // 2. Malformed token
  const badToken = await api('/auth/me', {
    headers: { Authorization: 'Bearer totally_invalid_token' },
  });
  assert(badToken.status === 401, `Tampered/malformed JWT rejected with 401 Unauthorized`);

  // 3. Admin-only route (/api/admin/metrics) protection
  const buyerAdminTry = await api('/admin/metrics', {
    headers: { Authorization: `Bearer ${tokens['buyer']}` },
  });
  assert(buyerAdminTry.status === 403, `Buyer access to /admin/metrics blocked with 403 Forbidden`);

  const sellerAdminTry = await api('/admin/metrics', {
    headers: { Authorization: `Bearer ${tokens['seller']}` },
  });
  assert(sellerAdminTry.status === 403, `Seller access to /admin/metrics blocked with 403 Forbidden`);

  const dealerAdminTry = await api('/admin/metrics', {
    headers: { Authorization: `Bearer ${tokens['dealer']}` },
  });
  assert(dealerAdminTry.status === 403, `Dealer access to /admin/metrics blocked with 403 Forbidden`);

  const techAdminTry = await api('/admin/metrics', {
    headers: { Authorization: `Bearer ${tokens['technician']}` },
  });
  assert(techAdminTry.status === 403, `Technician access to /admin/metrics blocked with 403 Forbidden`);

  const superAdminAccess = await api('/admin/metrics', {
    headers: { Authorization: `Bearer ${tokens['admin']}` },
  });
  assert(superAdminAccess.status === 200, `Super Admin access to /admin/metrics granted with 200 OK`);

  // 4. Dealer-only route (/api/dealers/me) protection
  const buyerDealerTry = await api('/dealers/me', {
    headers: { Authorization: `Bearer ${tokens['buyer']}` },
  });
  assert(buyerDealerTry.status === 403, `Buyer access to /dealers/me blocked with 403 Forbidden`);

  const dealerAccess = await api('/dealers/me', {
    headers: { Authorization: `Bearer ${tokens['dealer']}` },
  });
  assert(dealerAccess.status === 200, `Dealer access to /dealers/me granted with 200 OK`);

  // 5. Technician-only route (/api/technicians/me/inspections) protection
  const sellerTechTry = await api('/technicians/me/inspections', {
    headers: { Authorization: `Bearer ${tokens['seller']}` },
  });
  assert(sellerTechTry.status === 403, `Seller access to /technicians/me/inspections blocked with 403 Forbidden`);

  const techAccess = await api('/technicians/me/inspections', {
    headers: { Authorization: `Bearer ${tokens['technician']}` },
  });
  assert(techAccess.status === 200, `Technician access to /technicians/me/inspections granted with 200 OK`);

  // ----------------------------------------------------
  // STEP 9: Profile Mutation & Password Rotation
  // ----------------------------------------------------
  logSub('Step 9: Profile Mutation & Password Change');

  const updatedName = 'QA Verified Lead Specialist';
  const updatedPhone = '+2348031122334';
  const profileRes = await api('/auth/profile', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      name: updatedName,
      phone: updatedPhone,
    }),
  });
  assert(profileRes.status === 200, `Profile update returned 200 OK`);

  // Verify profile reflection
  const verifyMe = await api('/auth/me', {
    headers: { Authorization: `Bearer ${candidateToken}` },
  });
  assert(verifyMe.data.user?.name === updatedName, `Profile name persisted: '${verifyMe.data.user?.name}'`);
  assert(verifyMe.data.user?.phone === updatedPhone, `Profile phone persisted: '${verifyMe.data.user?.phone}'`);

  // Password change with incorrect current password
  const badPassChange = await api('/auth/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      currentPassword: 'WrongCurrentPassword!',
      newPassword: 'BrandNewPassword2026!',
    }),
  });
  assert(badPassChange.status === 400, `Password change with incorrect current password rejected with 400 Bad Request`);

  // Password change with correct current password
  const newSecret = 'BrandNewPassword2026!';
  const goodPassChange = await api('/auth/password', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}` },
    body: JSON.stringify({
      currentPassword: STANDARD_PASS,
      newPassword: newSecret,
    }),
  });
  assert(goodPassChange.status === 200, `Password change with valid current password succeeded with 200 OK`);

  // Verify old password fails
  const oldLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: STANDARD_PASS }),
  });
  assert(oldLogin.status === 401, `Login with old password now rejected with 401 Unauthorized`);

  // Verify new password succeeds
  const newLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testEmail, password: newSecret }),
  });
  assert(newLogin.status === 200, `Login with new rotated password succeeded with 200 OK`);

  logHeader('FLOW 1 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 1 VERIFICATION FAILED:', err);
  process.exit(1);
});
