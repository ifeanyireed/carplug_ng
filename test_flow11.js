// test_flow11.js - Flow 11 Verification Suite
// Flow 11: Editorial Blog CMS & Advertising Campaigns

const BASE_URL = process.env.API_URL || 'http://localhost:8080/api';
const STANDARD_PASS = 'Carplug2026!';
let ipCounter = 1100;

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
  const clientIp = options.ip || `192.168.11.${++ipCounter}`;
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
  logHeader('CARPLUG NIGERIA - FLOW 11 VERIFICATION SUITE');
  console.log(`Target API: ${BASE_URL}`);

  // ----------------------------------------------------
  // Step 1: Authenticate Actors
  // ----------------------------------------------------
  logSub('Step 1: Authenticate Actors (Super Admin & Regular Buyer)');

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
  assert(buyerAuth.status === 200, 'Authenticated as Buyer Dr. Chidi');
  const buyerToken = buyerAuth.data.token;
  assert(buyerAuth.data.user.role === 'buyer', "User role is 'buyer'");

  // ----------------------------------------------------
  // Step 2: Public Blog & Articles Discovery (11.1)
  // ----------------------------------------------------
  logSub('Step 2: Public Blog & Articles Discovery');

  // 1. Fetch public articles
  const publicPostsRes = await api('/blog/posts', { method: 'GET' });
  assert(publicPostsRes.status === 200, 'GET /blog/posts returned 200 OK');
  assert(Array.isArray(publicPostsRes.data.data), 'Public posts returned array');
  assert(publicPostsRes.data.total > 0, `Discovered ${publicPostsRes.data.total} published articles`);

  const samplePost = publicPostsRes.data.data[0];
  assert(samplePost.id && samplePost.slug, `Post has ID (${samplePost.id}) and slug (${samplePost.slug})`);
  assert(samplePost.readTime && samplePost.readTime.includes('min read'), `Read time computed: "${samplePost.readTime}"`);
  assert(samplePost.coverImage && samplePost.coverImage.startsWith('http'), 'Post has valid cover image URL');
  assert(samplePost.category && samplePost.category.name, `Post preloaded category: "${samplePost.category?.name}"`);

  // 2. Fetch specific article by slug
  const slugRes = await api(`/blog/posts/${samplePost.slug}`, { method: 'GET' });
  assert(slugRes.status === 200, `GET /blog/posts/${samplePost.slug} returned 200 OK`);
  assert(slugRes.data.data.title === samplePost.title, 'Article title matches slug retrieval');
  assert(Array.isArray(slugRes.data.related), 'Related articles list returned');

  // 3. Filter by category
  const catFilterRes = await api(`/blog/posts?category=${samplePost.category.id}`, { method: 'GET' });
  assert(catFilterRes.status === 200, `GET /blog/posts?category=${samplePost.category.id} returned 200 OK`);
  assert(catFilterRes.data.data.length > 0, `Filtered ${catFilterRes.data.data.length} articles by category`);

  // 4. Keyword search
  const searchWord = samplePost.title.split(' ')[0];
  const searchRes = await api(`/blog/posts?search=${encodeURIComponent(searchWord)}`, { method: 'GET' });
  assert(searchRes.status === 200, `GET /blog/posts?search=${searchWord} returned 200 OK`);
  assert(searchRes.data.data.length > 0, `Found matching search results for "${searchWord}"`);

  // 5. Fetch categories & post counts
  const categoriesRes = await api('/blog/categories', { method: 'GET' });
  assert(categoriesRes.status === 200, 'GET /blog/categories returned 200 OK');
  assert(Array.isArray(categoriesRes.data.data), 'Categories data array returned');
  assert(categoriesRes.data.data.length >= 3, `Discovered ${categoriesRes.data.data.length} blog categories`);
  const catWithPosts = categoriesRes.data.data.find((c) => c.postCount > 0);
  assert(!!catWithPosts, `Category post count aggregation verified (${catWithPosts?.name}: ${catWithPosts?.postCount} posts)`);

  // 6. Fetch tags
  const tagsRes = await api('/blog/tags', { method: 'GET' });
  assert(tagsRes.status === 200, 'GET /blog/tags returned 200 OK');
  assert(Array.isArray(tagsRes.data.data) && tagsRes.data.data.length >= 3, `Discovered ${tagsRes.data.data.length} tags`);

  // ----------------------------------------------------
  // Step 3: Admin Editorial CMS Lifecycle (11.2)
  // ----------------------------------------------------
  logSub('Step 3: Admin Editorial CMS Lifecycle');

  // 1. RBAC Boundaries: Buyer blocked from CMS actions
  const buyerPostAttempt = await api('/admin/blog/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ title: 'Hacked Article' }),
  });
  assert(buyerPostAttempt.status === 403, 'Buyer blocked from creating blog post with 403 Forbidden');

  const buyerCatAttempt = await api('/admin/blog/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ name: 'Hacked Category' }),
  });
  assert(buyerCatAttempt.status === 403, 'Buyer blocked from creating blog category with 403 Forbidden');

  // 2. Admin creates Category
  const testCatName = `QA Tech Review ${Date.now()}`;
  const createCatRes = await api('/admin/blog/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: testCatName,
      description: 'Handover QA automated testing category',
    }),
  });
  assert(createCatRes.status === 201, 'Admin created blog category with 201 Created');
  const createdCat = createCatRes.data.data;
  assert(createdCat && createdCat.id, `Category ID generated: ${createdCat?.id}`);

  // 3. Admin updates Category
  const updateCatRes = await api(`/admin/blog/categories/${createdCat.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      name: `${testCatName} (Updated)`,
      description: 'Updated QA description',
    }),
  });
  assert(updateCatRes.status === 200, 'Admin updated category with 200 OK');
  assert(updateCatRes.data.data.name.includes('(Updated)'), 'Category name update persisted');

  // 4. Admin creates Tag
  const testTagName = `QA-Tag-${Date.now()}`;
  const createTagRes = await api('/admin/blog/tags', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ name: testTagName }),
  });
  assert(createTagRes.status === 201, 'Admin created blog tag with 201 Created');
  const createdTag = createTagRes.data.data;

  // 5. Admin creates Article in Draft status
  const testArticleTitle = `Autonomous EV Testing in Lagos Traffic ${Date.now()}`;
  const articlePayload = {
    title: testArticleTitle,
    excerpt: 'Examining self-driving algorithms on Victoria Island and Third Mainland Bridge.',
    content: '<p>' + 'Detailed test content evaluating sensor fidelity and road conditions in Nigeria. '.repeat(50) + '</p>',
    coverImage: 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679181/carplug/cars/car7.jpg',
    coverImageAlt: 'Autonomous EV on Third Mainland Bridge',
    categoryId: createdCat.id,
    tagIds: [createdTag.id],
    authorName: 'Engr. Reed Babatunde',
    authorRole: 'Head of Automotive Intelligence',
    status: 'draft',
    featured: false,
    metaTitle: testArticleTitle,
    metaDescription: 'Autonomous EV testing in Lagos traffic report.',
  };

  const createPostRes = await api('/admin/blog/posts', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(articlePayload),
  });
  assert(createPostRes.status === 201, 'Admin created draft article with 201 Created');
  const createdPost = createPostRes.data.data;
  assert(createdPost && createdPost.id, `Article ID generated: ${createdPost?.id}`);
  assert(createdPost.status === 'draft', "Article status confirmed as 'draft'");
  assert(createdPost.slug.length > 0, `Article slug auto-generated: "${createdPost.slug}"`);
  assert(createdPost.readTime && createdPost.readTime.includes('min read'), `Word-count read time calculated: "${createdPost.readTime}"`);

  // 6. Verify Draft is hidden from public discovery
  const publicCheckDraft = await api(`/blog/posts/${createdPost.slug}`, { method: 'GET' });
  assert(publicCheckDraft.status === 404, 'Draft article strictly isolated from public blog discovery with 404 Not Found');

  // 7. Verify Draft is visible in Admin CMS query
  const adminDraftQuery = await api(`/admin/blog/posts?status=draft`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminDraftQuery.status === 200, 'GET /admin/blog/posts?status=draft returned 200 OK');
  const foundDraft = adminDraftQuery.data.data.find((p) => p.id === createdPost.id);
  assert(!!foundDraft, 'Draft article discovered in Admin Editorial CMS drafts queue');

  // 8. Admin Publishes the article
  const publishRes = await api(`/admin/blog/posts/${createdPost.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      ...articlePayload,
      status: 'published',
      featured: true,
    }),
  });
  assert(publishRes.status === 200, 'Admin published article with 200 OK');
  assert(publishRes.data.data.status === 'published', "Article status updated to 'published'");
  assert(!!publishRes.data.data.publishedAt, 'Article publishedAt timestamp initialized');

  // 9. Verify Published article is now LIVE on public endpoint
  const publicCheckLive = await api(`/blog/posts/${createdPost.slug}`, { method: 'GET' });
  assert(publicCheckLive.status === 200, 'Published article is now LIVE and accessible to public readers');
  assert(publicCheckLive.data.data.title === testArticleTitle, 'Public article title matches published content');

  // 10. Clean up test article
  const deletePostRes = await api(`/admin/blog/posts/${createdPost.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deletePostRes.status === 200, 'Admin deleted test article with 200 OK');

  // Clean up tag and category
  await api(`/admin/blog/tags/${createdTag.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const deleteCatRes = await api(`/admin/blog/categories/${createdCat.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(deleteCatRes.status === 200, 'Admin deleted test category cleanly with 200 OK');

  // ----------------------------------------------------
  // Step 4: Advertising Engine Lifecycle (11.3)
  // ----------------------------------------------------
  logSub('Step 4: Advertising Engine Lifecycle');

  // 1. Submit ad campaign from public /advertise portal
  const campaignPayload = {
    advertiser: 'Guaranty Trust Auto Fleet',
    placement: 'Homepage Brand Spotlight',
    creativeImage: 'https://res.cloudinary.com/cgiq8vwf/image/upload/v1789679186/carplug/cars/car15.jpg',
    budget: 450000,
    dates: '4 Week(s) Flight',
    targetCity: 'Lagos & Abuja',
  };

  const createCampRes = await api('/campaigns', {
    method: 'POST',
    body: JSON.stringify(campaignPayload),
  });
  assert(createCampRes.status === 201, 'POST /campaigns submitted ad campaign with 201 Created');
  const createdCamp = createCampRes.data;
  assert(createdCamp && createdCamp.id, `Campaign ID generated: ${createdCamp?.id}`);
  assert(createdCamp.status === 'Pending Review', "Publicly submitted campaign queued as 'Pending Review'");

  // 2. Verify pending campaign is NOT rendered in active public slots
  const publicActiveSlots = await api('/campaigns?status=Active', { method: 'GET' });
  assert(publicActiveSlots.status === 200, 'GET /campaigns?status=Active returned 200 OK');
  const inActiveList = publicActiveSlots.data.data.find((c) => c.id === createdCamp.id);
  assert(!inActiveList, 'Unapproved campaign strictly excluded from public active ad slots');

  // 3. Admin Advertising Moderation Queue (/admin/advertising)
  const adminReviewQueue = await api('/campaigns?status=Pending Review', { method: 'GET' });
  assert(adminReviewQueue.status === 200, 'GET /campaigns?status=Pending Review returned 200 OK');
  const foundInQueue = adminReviewQueue.data.data.find((c) => c.id === createdCamp.id);
  assert(!!foundInQueue, 'Campaign successfully discovered in Admin Advertising review queue');

  // 4. RBAC Boundary: Buyer blocked from approving ad campaign
  const unauthorizedApprove = await api(`/campaigns/${createdCamp.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${buyerToken}` },
    body: JSON.stringify({ status: 'Active' }),
  });
  assert(unauthorizedApprove.status === 403, 'Buyer blocked from moderating campaign with 403 Forbidden');

  // 5. Admin Approves Campaign
  const approveCampRes = await api(`/campaigns/${createdCamp.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Active' }),
  });
  assert(approveCampRes.status === 200, "Admin approved campaign banner with status 'Active'");

  // 6. Verify Active Campaign renders in public marketplace slots
  const activeSlotsAfterApproval = await api('/campaigns?status=Active', { method: 'GET' });
  const inActiveListNow = activeSlotsAfterApproval.data.data.find((c) => c.id === createdCamp.id);
  assert(!!inActiveListNow, 'Approved campaign banner now actively rendered across public marketplace ad slots');

  // 7. Admin Pauses Campaign
  const pauseCampRes = await api(`/campaigns/${createdCamp.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Paused' }),
  });
  assert(pauseCampRes.status === 200, "Admin paused campaign with status 'Paused'");

  // ----------------------------------------------------
  // Step 5: Edge Cases & Validation Matrix
  // ----------------------------------------------------
  logSub('Step 5: Edge Cases & Validation Matrix');

  // Non-existent article lookup returns 404
  const nonExistentArticle = await api('/blog/posts/non-existent-article-slug-9999', { method: 'GET' });
  assert(nonExistentArticle.status === 404, 'Non-existent article slug returns 404 Not Found');

  // Non-existent campaign status update returns 404
  const nonExistentCampaign = await api('/campaigns/camp-non-existent-99999/status', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Active' }),
  });
  assert(nonExistentCampaign.status === 404, 'Status update on non-existent campaign returns 404 Not Found');

  // Non-existent article update in Admin CMS returns 404
  const nonExistentPostUpdate = await api('/admin/blog/posts/post-non-existent-99999', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify(articlePayload),
  });
  assert(nonExistentPostUpdate.status === 404, 'Update on non-existent article returns 404 Not Found');

  logHeader('FLOW 11 VERIFICATION COMPLETED WITH 100% SUCCESS!');
}

run().catch((err) => {
  console.error('\n[FATAL ERROR in Flow 11 Suite]:', err);
  process.exit(1);
});
