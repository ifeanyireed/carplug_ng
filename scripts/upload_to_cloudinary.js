const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Parse backend/.env
const envFile = fs.readFileSync(path.resolve(__dirname, '../backend/.env'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = (match[2] || '').trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing Cloudinary credentials in backend/.env");
  process.exit(1);
}

const ASSETS = [
  // Cars
  ...[1, 2, 3, 4, 5, 7, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(n => ({
    localRel: `/images/cars/car${n}.jpeg`,
    filePath: `web_app/public/images/cars/car${n}.jpeg`,
    folder: 'carplug/cars',
    publicId: `car${n}`,
    resourceType: 'image',
  })),
  // Brands
  { localRel: '/images/brands/bmw.svg', filePath: 'web_app/public/images/brands/bmw.svg', folder: 'carplug/brands', publicId: 'bmw', resourceType: 'image' },
  { localRel: '/images/brands/ford.svg', filePath: 'web_app/public/images/brands/ford.svg', folder: 'carplug/brands', publicId: 'ford', resourceType: 'image' },
  { localRel: '/images/brands/infiniti.png', filePath: 'web_app/public/images/brands/infiniti.png', folder: 'carplug/brands', publicId: 'infiniti', resourceType: 'image' },
  { localRel: '/images/brands/lexus.png', filePath: 'web_app/public/images/brands/lexus.png', folder: 'carplug/brands', publicId: 'lexus', resourceType: 'image' },
  { localRel: '/images/brands/mercedes.png', filePath: 'web_app/public/images/brands/mercedes.png', folder: 'carplug/brands', publicId: 'mercedes', resourceType: 'image' },
  { localRel: '/images/brands/mitsubishi.png', filePath: 'web_app/public/images/brands/mitsubishi.png', folder: 'carplug/brands', publicId: 'mitsubishi', resourceType: 'image' },
  { localRel: '/images/brands/toyota.png', filePath: 'web_app/public/images/brands/toyota.png', folder: 'carplug/brands', publicId: 'toyota', resourceType: 'image' },
  // Articles
  { localRel: '/images/articles/news1.jpeg', filePath: 'web_app/public/images/articles/news1.jpeg', folder: 'carplug/articles', publicId: 'news1', resourceType: 'image' },
  { localRel: '/images/articles/news2.jpeg', filePath: 'web_app/public/images/articles/news2.jpeg', folder: 'carplug/articles', publicId: 'news2', resourceType: 'image' },
  { localRel: '/images/articles/news3.jpeg', filePath: 'web_app/public/images/articles/news3.jpeg', folder: 'carplug/articles', publicId: 'news3', resourceType: 'image' },
  { localRel: '/images/articles/news4.jpeg', filePath: 'web_app/public/images/articles/news4.jpeg', folder: 'carplug/articles', publicId: 'news4', resourceType: 'image' },
  // Stories (mp4)
  { localRel: '/images/stories/story1.mp4', filePath: 'web_app/public/images/stories/story1.mp4', folder: 'carplug/stories', publicId: 'story1', resourceType: 'video' },
  { localRel: '/images/stories/story2.mp4', filePath: 'web_app/public/images/stories/story2.mp4', folder: 'carplug/stories', publicId: 'story2', resourceType: 'video' },
  { localRel: '/images/stories/story3.mp4', filePath: 'web_app/public/images/stories/story3.mp4', folder: 'carplug/stories', publicId: 'story3', resourceType: 'video' },
  // Root assets
  { localRel: '/hero-car.webp', filePath: 'web_app/public/hero-car.webp', folder: 'carplug/brand', publicId: 'hero-car', resourceType: 'image' },
  { localRel: '/images/cars/hero-car.webp', filePath: 'web_app/public/hero-car.webp', folder: 'carplug/brand', publicId: 'hero-car', resourceType: 'image' },
  { localRel: '/logo.png', filePath: 'web_app/public/logo.png', folder: 'carplug/brand', publicId: 'logo', resourceType: 'image' },
  { localRel: '/image.png', filePath: 'web_app/public/image.png', folder: 'carplug/brand', publicId: 'image', resourceType: 'image' },
  { localRel: '/mycarsng-logo.png', filePath: 'web_app/public/mycarsng-logo.png', folder: 'carplug/brand', publicId: 'mycarsng-logo', resourceType: 'image' },
];

async function uploadFile(asset) {
  const fullPath = path.resolve(__dirname, '..', asset.filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${fullPath}`);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const params = {
    folder: asset.folder,
    overwrite: 'true',
    public_id: asset.publicId,
    timestamp: timestamp.toString(),
  };

  // Sort keys alphabetically for signature
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(k => `${k}=${params[k]}`).join('&') + apiSecret;
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex');

  const fileBuffer = fs.readFileSync(fullPath);
  const filename = path.basename(fullPath);

  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), filename);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', asset.folder);
  formData.append('public_id', asset.publicId);
  formData.append('overwrite', 'true');
  formData.append('signature', signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${asset.resourceType}/upload`;
  const res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Upload failed for ${asset.localRel}: ${JSON.stringify(data)}`);
  }

  return data.secure_url;
}

async function main() {
  console.log(`Starting upload of ${ASSETS.length} assets to Cloudinary (${cloudName})...`);
  const mapping = {};

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    process.stdout.write(`[${i + 1}/${ASSETS.length}] Uploading ${asset.filePath} ... `);
    try {
      const url = await uploadFile(asset);
      mapping[asset.localRel] = url;
      console.log(`✓ OK -> ${url}`);
    } catch (err) {
      console.error(`✗ ERROR:`, err.message);
      process.exit(1);
    }
  }

  const outputPath = path.resolve(__dirname, 'cloudinary_mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`\nAll assets successfully uploaded! Manifest written to ${outputPath}`);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
