const fs = require('fs');
const svg = fs.readFileSync('remix.svg', 'utf8');

const req = [
  "ri-add-line", "ri-arrow-down-s-line", "ri-arrow-left-line", "ri-arrow-left-s-line", "ri-arrow-right-line", 
  "ri-arrow-right-s-line", "ri-arrow-right-up-line", "ri-award-line", "ri-bank-card-line", "ri-check-line", 
  "ri-checkbox-circle-line", "ri-close-circle-line", "ri-close-line", "ri-delete-bin-line", "ri-download-line", 
  "ri-edit-line", "ri-eye-line", "ri-facebook-line", "ri-fire-line", "ri-google-line", "ri-grid-fill", 
  "ri-grid-line", "ri-hand-heart-line", "ri-heart-3-line", "ri-history-line", "ri-instagram-line", 
  "ri-leaf-line", "ri-line-chart-line", "ri-list-check-2", "ri-magic-line", "ri-map-pin-line", "ri-menu-line", 
  "ri-plant-line", "ri-price-tag-3-fill", "ri-refresh-line", "ri-save-line", "ri-scissors-cut-line", 
  "ri-search-eye-line", "ri-search-line", "ri-settings-3-line", "ri-share-line", "ri-shield-user-line", 
  "ri-shopping-bag-3-fill", "ri-shopping-bag-3-line", "ri-shopping-bag-line", "ri-slideshow-3-line", 
  "ri-sparkling-line", "ri-store-2-line", "ri-subtract-line", "ri-tiktok-line", "ri-truck-line", 
  "ri-upload-2-line", "ri-whatsapp-line"
];

let out = `export const ICONS: Record<string, string> = {\n`;

req.forEach(id => {
  // Try matching <symbol ... id="ID" ...>...</symbol>
  const r = new RegExp('<symbol[^>]*id="' + id + '"[^>]*>(.*?)</symbol>');
  const m = svg.match(r);
  if (m) {
    const cleanId = id.replace('ri-', '').replace('-line', '').replace('-fill', '');
    out += `  '${cleanId}': \`${m[1]}\`,\n`;
  } else {
    console.warn('Missing icon:', id);
  }
});

out += `};\n`;

if (!fs.existsSync('src/lib')) {
  fs.mkdirSync('src/lib');
}
fs.writeFileSync('src/lib/icons.ts', out);
console.log('Icons written to src/lib/icons.ts');
