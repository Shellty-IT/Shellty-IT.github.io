const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'src', 'assets');
const QUALITY = 80;
let converted = 0;
let skipped = 0;
const promises = [];

function walkDir(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            walkDir(fullPath);
            continue;
        }

        if (!entry.name.endsWith('.png') && !entry.name.endsWith('.jpg')) continue;

        const webpPath = fullPath.replace(/\.(apng|jpg)$/, '.webp');

        if (fs.existsSync(webpPath)) {
            skipped++;
            continue;
        }

        const pngSize = (fs.statSync(fullPath).size / 1024).toFixed(1);

        const p = sharp(fullPath)
            .webp({ quality: QUALITY, effort: 6 })
            .toFile(webpPath)
            .then(info => {
                const webpSize = (info.size / 1024).toFixed(1);
                const savings = (100 - (info.size / fs.statSync(fullPath).size) * 100).toFixed(0);
                console.log(`  ${entry.name} | ${pngSize}KB -> ${webpSize}KB (-${savings}%)`);
                converted++;
            })
            .catch(err => console.error(`  BLAD ${entry.name}: ${err.message}`));

        promises.push(p);
    }
}

console.log('\nKonwersja PNG -> WebP...\n');
walkDir(ASSETS_DIR);

Promise.all(promises).then(() => {
    console.log(`\nSkonwertowano: ${converted} | Pominieto: ${skipped}\n`);
});