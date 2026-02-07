// Copy repo attached_assets into client/public so Vite includes them in dist (for /attached_assets/ URLs)
const fs = require("fs");
const path = require("path");

const repoAssets = path.join(__dirname, "..", "..", "attached_assets");
const publicDir = path.join(__dirname, "..", "public", "attached_assets");

if (!fs.existsSync(repoAssets)) {
  console.warn("copy-attached-assets: source not found, skipping");
  process.exit(0);
}

fs.mkdirSync(path.dirname(publicDir), { recursive: true });
if (fs.existsSync(publicDir)) fs.rmSync(publicDir, { recursive: true });
fs.cpSync(repoAssets, publicDir, { recursive: true });
console.log("copy-attached-assets: copied attached_assets to public/");
