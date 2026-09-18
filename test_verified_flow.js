const http = require('http');
const mysql = require('mysql2/promise');

const API_HOST = process.env.API_HOST || 'mycarsng-api-dev.onrender.com';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  const email = `seller_unverified_${Date.now()}@example.com`;
  console.log('1. Registering user:', email);
  const reg = await request(
    {
      hostname: API_HOST,
      port: 8080,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Unverified Seller',
      email: email,
      password: 'password123',
      role: 'seller',
    }
  );
  console.log('Register Status:', reg.status, 'User IsVerified:', reg.data.user.isVerified);
  const token = reg.data.token;

  console.log('\n2. Attempting POST /api/vehicles with unverified account...');
  const createVehicleRes = await request(
    {
      hostname: API_HOST,
      port: 8080,
      path: '/api/vehicles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      title: '2022 Toyota Corolla LE',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      price: 18500000,
      condition: 'foreign_used',
      state: 'Lagos',
      city: 'Ikeja',
      mileage: 32000,
      transmission: 'automatic',
      fuelType: 'petrol',
    }
  );
  console.log('CreateVehicle (Unverified) Status:', createVehicleRes.status);
  console.log('CreateVehicle Response:', JSON.stringify(createVehicleRes.data));

  // 3. Mark user verified directly or via OTP
  // Let's connect to the DB and find the OTP for this email
  console.log('\n3. Retrieving OTP from database...');
  const db = await mysql.createConnection({
    host: 'srv2113.hstgr.io',
    port: 3306,
    user: 'u721451974_carplug_ng',
    password: '*Reedb4b4',
    database: 'u721451974_carplug_ng_db',
  });

  const [rows] = await db.execute(
    'SELECT code FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
    [email]
  );
  const otpCode = rows[0]?.code;
  console.log('Retrieved OTP code:', otpCode);

  console.log('\n4. Verifying OTP via /api/auth/verify-otp...');
  const verifyRes = await request(
    {
      hostname: API_HOST,
      port: 8080,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: email,
      code: otpCode,
    }
  );
  console.log('Verify OTP Status:', verifyRes.status, 'Verified:', verifyRes.data.user?.isVerified);
  const verifiedToken = verifyRes.data.token || token;

  console.log('\n5. Retrying POST /api/vehicles with now-verified account...');
  const retryCreateRes = await request(
    {
      hostname: API_HOST,
      port: 8080,
      path: '/api/vehicles',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${verifiedToken}`,
      },
    },
    {
      title: '2022 Toyota Corolla LE',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      price: 18500000,
      condition: 'foreign_used',
      state: 'Lagos',
      city: 'Ikeja',
      mileage: 32000,
      transmission: 'automatic',
      fuelType: 'petrol',
    }
  );
  console.log('Retry CreateVehicle Status:', retryCreateRes.status);
  console.log('Created Vehicle ID:', retryCreateRes.data.id || retryCreateRes.data.data?.id);

  await db.end();
}

run().catch(console.error);
