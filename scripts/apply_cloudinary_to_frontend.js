const fs = require('fs');
const path = require('path');

const mappingPath = path.resolve(__dirname, 'cloudinary_mapping.json');
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));

// Sort keys longest first to avoid partial prefix collisions
const sortedKeys = Object.keys(mapping).sort((a, b) => b.length - a.length);

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else if (/\.(tsx?|css|jsx?)$/.test(file)) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir(path.resolve(__dirname, '../web_app/src'));
let totalReplaced = 0;
let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let originalContent = content;
  let fileMatches = 0;

  for (const localPath of sortedKeys) {
    if (content.includes(localPath)) {
      const cldUrl = mapping[localPath];
      // Count occurrences
      const count = content.split(localPath).length - 1;
      content = content.replaceAll(localPath, cldUrl);
      fileMatches += count;
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf-8');
    totalReplaced += fileMatches;
    filesModified++;
    console.log(`Updated ${path.relative(path.resolve(__dirname, '..'), file)} (${fileMatches} replacements)`);
  }
});

console.log(`\nReplacement complete! Replaced ${totalReplaced} occurrences across ${filesModified} files.`);
