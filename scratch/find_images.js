const fs = require('fs');
const path = require('path');

function searchFiles(dir, filter, results = []) {
  if (!fs.existsSync(dir)) return results;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    let stat;
    try {
      stat = fs.statSync(filePath);
    } catch (e) {
      continue;
    }
    if (stat.isDirectory()) {
      // Avoid node_modules and .git
      if (file !== 'node_modules' && file !== '.git' && file !== '.astro' && file !== '.wrangler' && file !== 'dist') {
        searchFiles(filePath, filter, results);
      }
    } else {
      if (filter.test(file)) {
        results.push({ path: filePath, size: stat.size, mtime: stat.mtime });
      }
    }
  }
  return results;
}

console.log("--- SEARCHING WORKSPACE ---");
const wsImages = searchFiles("c:\\Users\\jhona\\Downloads\\nuditos-astro-paso1", /\.(png|jpg|jpeg|webp)$/i);
wsImages.sort((a,b) => b.mtime - a.mtime);
wsImages.slice(0, 10).forEach(img => {
  console.log(`Path: ${img.path} | Size: ${img.size} | Time: ${img.mtime}`);
});

console.log("\n--- SEARCHING APP DATA DIR ---");
const appDataImages = searchFiles("C:\\Users\\jhona\\.gemini\\antigravity-ide", /\.(png|jpg|jpeg|webp)$/i);
appDataImages.sort((a,b) => b.mtime - a.mtime);
appDataImages.slice(0, 10).forEach(img => {
  console.log(`Path: ${img.path} | Size: ${img.size} | Time: ${img.mtime}`);
});
