const fs = require('fs');
const path = require('path');

const src1 = "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813764.jpg";
const src2 = "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813851.jpg";
const src3 = "C:\\Users\\jhona\\.gemini\\antigravity-ide\\brain\\add23d53-dfe1-497a-978d-c44beb15d3f4\\media__1782068813867.jpg";

const destDir = "c:\\Users\\jhona\\Downloads\\nuditos-astro-paso1\\public";

fs.copyFileSync(src1, path.join(destDir, "combo-flores-amarillas-tulipanes.jpg"));
fs.copyFileSync(src2, path.join(destDir, "combo-girasol-virgencita.jpg"));
fs.copyFileSync(src3, path.join(destDir, "combo-orquidea-gatito.jpg"));

console.log("Images copied to public/ successfully!");
