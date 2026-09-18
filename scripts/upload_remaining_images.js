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
  {
    localRel: '/logo_text.png',
    filePath: 'logo_text.png',
    folder: 'carplug/brand',
    publicId: 'logo_text',
    resourceType: 'image',
  },
  {
    localRel: '/apple-touch-icon.png',
    filePath: 'web_app/public/apple-touch-icon.png',
    folder: 'carplug/brand',
    publicId: 'apple-touch-icon',
    resourceType: 'image',
  },
  {
    localRel: '/favicon.ico',
    filePath: 'web_app/public/favicon.ico',
    folder: 'carplug/brand',
    publicId: 'favicon',
    resourceType: 'raw', // .ico is often uploaded as raw or image; let's test image or raw
  },
  {
    localRel: '/icon.png',
    filePath: 'web_app/public/icon.png',
    folder: 'carplug/brand',
    publicId: 'icon',
    resourceType: 'image',
  },
  {
    localRel: '/logo.png',
    filePath: 'web_app/public/logo.png',
    folder: 'carplug/brand',
    publicId: 'logo',
    resourceType: 'image',
  },
  {
    localRel: '/logo_color.avif',
    filePath: 'web_app/public/logo_color.avif',
    folder: 'carplug/brand',
    publicId: 'logo_color',
    resourceType: 'image',
  },
  {
    localRel: '/logo_white.avif',
    filePath: 'web_app/public/logo_white.avif',
    folder: 'carplug/brand',
    publicId: 'logo_white',
    resourceType: 'image',
  },
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

  // Try image resourceType first, fallback to raw if needed
  let endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${asset.resourceType}/upload`;
  let res = await fetch(endpoint, {
    method: 'POST',
    body: formData,
  });

  let data = await res.json();
  if (!res.ok && asset.resourceType === 'raw') {
    // Retry as image
    endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    res = await fetch(endpoint, { method: 'POST', body: formData });
    data = await res.json();
  }

  if (!res.ok) {
    throw new Error(`Upload failed for ${asset.localRel}: ${JSON.stringify(data)}`);
  }

  return data.secure_url;
}

async function main() {
  console.log(`Starting upload of ${ASSETS.length} brand assets to Cloudinary (${cloudName})...`);
  const mappingPath = path.resolve(__dirname, 'cloudinary_mapping.json');
  const mapping = fs.existsSync(mappingPath) ? JSON.parse(fs.readFileSync(mappingPath, 'utf-8')) : {};

  for (let i = 0; i < ASSETS.length; i++) {
    const asset = ASSETS[i];
    process.stdout.write(`[${i + 1}/${ASSETS.length}] Uploading ${asset.filePath} ... `);
    try {
      const url = await uploadFile(asset);
      mapping[asset.localRel] = url;
      console.log(`✓ OK -> ${url}`);
    } catch (err) {
      console.error(`✗ ERROR:`, err.message);
    }
  }

  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`\nUpdated mapping written to ${mappingPath}`);
}

main().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
