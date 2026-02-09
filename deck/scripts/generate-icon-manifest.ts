import fs from "node:fs";
import path from "node:path";

const iconsDir = path.resolve(__dirname, "../public/icons");
const outputFile = path.resolve(__dirname, "../lib/icon-manifest.json");
const extensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"];

function scanIcons(dir: string, basePath: string): Record<string, string> {
  const icons: Record<string, string> = {};
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const subIcons = scanIcons(fullPath, `${basePath}/${entry.name}`);
      for (const [name, url] of Object.entries(subIcons)) {
        if (icons[name]) {
          throw new Error(`Duplicate icon name: '${name}'`);
        }
        icons[name] = url;
      }
    } else if (extensions.includes(path.extname(entry.name).toLowerCase())) {
      const name = path.basename(entry.name, path.extname(entry.name));
      if (icons[name]) {
        throw new Error(`Duplicate icon name: '${name}'`);
      }
      icons[name] = `${basePath}/${entry.name}`;
    }
  }
  return icons;
}

const manifest = scanIcons(iconsDir, "/icons");
fs.writeFileSync(outputFile, JSON.stringify(manifest, null, 2));
console.log(`Generated icon manifest with ${Object.keys(manifest).length} icons`);
