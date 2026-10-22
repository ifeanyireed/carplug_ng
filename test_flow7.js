// test_flow7.js - Flow 7 Verification Suite
// Flow 7: In-App Direct Messaging & Real-Time WebSocket Engine

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 700;

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
  const clientIp = options.ip || `192.168.8.${++ipCounter}`;
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

function createWebSocketClient(token) {
  return new Promise((resolve, reject) => {
    const wsUrl = `${WS_BASE_URL}/ws?token=${token}`;
    const ws = new WebSocket(wsUrl);

    const timeout = setTimeout(() => {
      reject(new Error(`WebSocket connection timed out for ${wsUrl}`));
    }, 8000);

    ws.onopen = () => {
      clearTimeout(timeout);
      resolve(ws);
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      reject(new Error(`WebSocket connection error: ${err.message || 'handshake failed'}`));
    };
  });
}

function waitForWebSocketEvent(ws, eventType, timeoutMs = 8000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener('message', handler);
      reject(new Error(`Timed out waiting for WebSocket event '${eventType}' after ${timeoutMs}ms`));
    }, timeoutMs);

    function handler(event) {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === eventType) {
          clearTimeout(timer);
          ws.removeEventListener('message', handler);
          resolve(payload);
        }
      } catch (err) {
        // Ignore non-json frames (e.g. ping/pong)
      }
    }

    ws.addEventListener('message', handler);
  });
}

async function run() {
  logHeader('CARPLUG NIGERIA - FLOW 7 VERIFICATION SUITE');
  console.log('Target API:', BASE_URL);
  console.log('WebSocket Gateway:', `${WS_BASE_URL}/ws`);

  // ----------------------------------------------------
  // STEP 1: Authenticate Stakeholder Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Buyer, Private Seller, Intruder)');

  // 1. Buyer: Dr. Chidi Nwosu
  const buyerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'buyer.chidi@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(buyerLogin.status === 200, 'Authenticated as Buyer Dr. Chidi (buyer.chidi@mycars.ng)');
  assert(buyerLogin.data.user?.isVerified === true, 'Buyer account is email-verified');
  const buyerToken = buyerLogin.data.token;
  const buyerId = buyerLogin.data.user.id;

  // 2. Private Seller: Babatunde Olumide
  const sellerLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'seller.babatunde@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(sellerLogin.status === 200, 'Authenticated as Seller Babatunde (seller.babatunde@mycars.ng)');
  const sellerToken = sellerLogin.data.token;
  const sellerId = sellerLogin.data.user.id;

  // 3. Bystander / Eavesdropper: Technician Musa Danladi
  const techLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'tech.musa@mycars.ng',
      password: STANDARD_PASS,
    }),
  });
  assert(techLogin.status === 200, 'Authenticated as Technician Musa Danladi (tech.musa@mycars.ng)');
  const techToken = techLogin.data.token;

  // ----------------------------------------------------
  // STEP 2: Security & Privacy Guard Boundaries
  // ----------------------------------------------------
  logSub('Step 2: Security & Privacy Guard Boundaries');

  // Discover candidate vehicle belonging to Babatunde
  const sellerVehicles = await api(`/vehicles?sellerId=${sellerId}`);
  assert(sellerVehicles.status === 200, 'GET /vehicles?sellerId=... returned 200 OK');
  const vehicle = sellerVehicles.data.data[0];
  assert(!!vehicle, `Target listing found: "${vehicle.title}" (${vehicle.id})`);

  // 1. Unauthenticated thread creation blocked with 401
  const unauthThread = await api('/conversations', {
    method: 'POST',
    body: JSON.stringify({ vehicleId: vehicle.id }),
  });
  assert(unauthThread.status === 401, 'Unauthenticated thread initialization blocked with 401 Unauthorized');

  // 2. Seller self-messaging prevented with 400
  const selfChat = await api('/conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${sellerToken}` },
    body: JSON.stringify({ vehicleId: vehicle.id, message: 'Messaging myself' }),
  });
  assert(selfChat.status === 400, 'Seller self-conversation prevented with 400 Bad Request');
  assert(selfChat.data.error.includes('own vehicle listing'), 'Self-conversation boundary message confirmed');

  // ----------------------------------------------------
  // STEP 3: Direct Thread Initialization (POST /conversations)
  // ----------------------------------------------------
  logSub('Step 3: Direct Thread Initialization & Idempotent Resume');

  const initialText = `Hello Babatunde, is this ${vehicle.title} available for inspection this Saturday?`;
  const startThreadRes = await api('/conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({
      vehicleId: vehicle.id,
      message: initialText,
    }),
  });
  assert(startThreadRes.status === 201 || startThreadRes.status === 200, 'POST /conversations initialized thread');
  const conv = startThreadRes.data;
  const convId = conv.id;
  assert(!!convId, `Conversation thread established with ID: ${convId}`);
  assert(conv.buyerId === buyerId, `Buyer identity bound to thread (${conv.buyerId})`);
  assert(conv.sellerId === sellerId, `Seller identity bound to thread (${conv.sellerId})`);
  assert(conv.vehicleTitle === vehicle.title, `Vehicle title linked: "${conv.vehicleTitle}"`);
  assert(conv.lastMessage === initialText, `Initial message persisted as lastMessage`);

  // Verify Idempotent Resume: Calling again returns existing thread with 200 OK
  const resumeThreadRes = await api('/conversations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ vehicleId: vehicle.id }),
  });
  assert(resumeThreadRes.status === 200, 'Subsequent thread initialization returns 200 OK (idempotent resume)');
  assert(resumeThreadRes.data.id === convId, 'Re-used existing conversation ID without thread duplication');

  // ----------------------------------------------------
  // STEP 4: Real-Time WebSocket Bi-Directional Delivery
  // ----------------------------------------------------
  logSub('Step 4: Real-Time WebSocket Bi-Directional Message Delivery');

  // 1. Establish concurrent WebSocket connections
  const wsBuyer = await createWebSocketClient(buyerToken);
  assert(wsBuyer.readyState === WebSocket.OPEN, "Buyer WebSocket gateway connected (State: OPEN)");

  const wsSeller = await createWebSocketClient(sellerToken);
  assert(wsSeller.readyState === WebSocket.OPEN, "Seller WebSocket gateway connected (State: OPEN)");

  // 2. Buyer sends follow-up negotiation offer via REST API
  const buyerOfferText = "Can you do ₦12.5M for instant full payment?";
  const sellerMessagePromise = waitForWebSocketEvent(wsSeller, 'new_message');

  const buyerSendRes = await api(`/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ body: buyerOfferText }),
  });
  assert(buyerSendRes.status === 201, `Buyer POST /conversations/${convId}/messages returned 201 Created`);

  // Verify Seller received the message over WebSocket in real time
  const sellerReceivedEvent = await sellerMessagePromise;
  assert(sellerReceivedEvent.type === 'new_message', "Seller received 'new_message' event over WebSocket");
  assert(sellerReceivedEvent.message.body === buyerOfferText, `Message body received in real time: "${sellerReceivedEvent.message.body}"`);
  assert(sellerReceivedEvent.message.senderId === buyerId, `Verified senderId is Buyer (${sellerReceivedEvent.message.senderId})`);
  assert(sellerReceivedEvent.conversationId === convId, `ConversationId matches thread (${sellerReceivedEvent.conversationId})`);

  // 3. Seller replies via WebSocket payload (or REST)
  const sellerReplyText = "The lowest I can accept is ₦13.0M for quick transfer. It is clean first-body.";
  const buyerMessagePromise = waitForWebSocketEvent(wsBuyer, 'new_message');

  // Test client-sent WebSocket chat message frame
  wsSeller.send(JSON.stringify({
    type: 'chat_message',
    conversationId: convId,
    body: sellerReplyText,
  }));

  // Verify Buyer received Seller's reply over WebSocket in real time
  const buyerReceivedEvent = await buyerMessagePromise;
  assert(buyerReceivedEvent.type === 'new_message', "Buyer received 'new_message' event over WebSocket");
  assert(buyerReceivedEvent.message.body === sellerReplyText, `Seller reply received in real time: "${buyerReceivedEvent.message.body}"`);
  assert(buyerReceivedEvent.message.senderId === sellerId, `Verified senderId is Seller (${buyerReceivedEvent.message.senderId})`);

  // ----------------------------------------------------
  // STEP 5: Real-Time Typing Indicators (Ephemeral Signals)
  // ----------------------------------------------------
  logSub('Step 5: Real-Time Typing Indicators (Ephemeral Signals)');

  const sellerTypingPromise = waitForWebSocketEvent(wsSeller, 'user_typing');

  // Buyer emits typing indicator frame
  wsBuyer.send(JSON.stringify({
    type: 'typing',
    conversationId: convId,
  }));

  const typingEvent = await sellerTypingPromise;
  assert(typingEvent.type === 'user_typing', "Seller received 'user_typing' event over WebSocket");
  assert(typingEvent.conversationId === convId, `Typing conversationId matches (${typingEvent.conversationId})`);
  assert(typingEvent.userId === buyerId, `Typing user matches Buyer (${typingEvent.userId})`);

  // Clean-up WebSocket connections (simulating page navigation / browser reload)
  wsBuyer.close();
  wsSeller.close();

  // ----------------------------------------------------
  // STEP 6: Eavesdropping & Cross-Tenant Barrier (403)
  // ----------------------------------------------------
  logSub('Step 6: Eavesdropping & Cross-Tenant Access Protection');

  // Intruder Technician Musa attempts to view Dr. Chidi & Babatunde's private messages
  const intruderView = await api(`/conversations/${convId}/messages`, {
    headers: { Authorization: `Bearer ${techToken}` },
  });
  assert(intruderView.status === 403, 'Intruder technician blocked from viewing messages with 403 Forbidden');

  // Intruder Technician Musa attempts to post into the conversation
  const intruderSend = await api(`/conversations/${convId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${techToken}` },
    body: JSON.stringify({ body: 'Intruder injecting unsolicited advertisement' }),
  });
  assert(intruderSend.status === 403, 'Intruder technician blocked from sending messages with 403 Forbidden');

  // ----------------------------------------------------
  // STEP 7: History Persistence, Reload & Unread Badging
  // ----------------------------------------------------
  logSub('Step 7: History Persistence, Reload & Unread Badging');

  // 1. Buyer queries conversation list to verify unread badges
  // (Seller sent the last message via WebSocket, which Buyer has not yet marked read via GET /messages)
  const buyerConvsRes = await api('/conversations', {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(buyerConvsRes.status === 200, 'GET /conversations returned 200 OK for Buyer');
  const buyerConvs = buyerConvsRes.data;
  const activeBuyerConv = buyerConvs.find(c => c.id === convId);
  assert(!!activeBuyerConv, `Thread appears in buyer conversation inbox (${activeBuyerConv?.id})`);
  assert(activeBuyerConv.unreadCount >= 1, `Unread badge calculated accurately: ${activeBuyerConv.unreadCount} unread message(s)`);

  // 2. Buyer opens the conversation thread (marks messages as read)
  const historyRes = await api(`/conversations/${convId}/messages`, {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(historyRes.status === 200, `GET /conversations/${convId}/messages returned 200 OK`);
  const messages = historyRes.data;
  assert(Array.isArray(messages) && messages.length >= 3, `Complete message history reloaded from PostgreSQL (${messages.length} messages)`);

  // Verify chronological order and content integrity
  assert(messages[0].body === initialText, 'First message matches initial buyer inquiry');
  assert(messages[1].body === buyerOfferText, 'Second message matches buyer negotiation offer');
  assert(messages[2].body === sellerReplyText, 'Third message matches seller counter-offer');

  // 3. Verify unread badge automatically cleared to 0 after viewing
  const convMetadataRes = await api(`/conversations/${convId}`, {
    headers: { Authorization: `Bearer ${buyerToken}` },
  });
  assert(convMetadataRes.status === 200, `GET /conversations/${convId} returned 200 OK`);
  assert(convMetadataRes.data.unreadCount === 0, 'Unread badge automatically cleared to 0 after viewing history');

  logHeader('FLOW 7 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n❌ FLOW 7 VERIFICATION FAILED:', err);
  process.exit(1);
});
