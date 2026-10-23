const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const required = ['index.html', 'styles.css', 'core.js', 'app.js', 'manifest.webmanifest', 'sw.js', 'icon.svg', 'icon-192.png', 'icon-512.png'];
const missing = required.filter((f) => !fs.existsSync(path.join(root, f)));
if (missing.length) { console.error('Build check failed. Missing:', missing.join(', ')); process.exit(1); }
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const needle of ['core.js', 'app.js', 'manifest.webmanifest', 'page-link', 'page-learning', 'learningEqMargin', 'learningCapacityInterpretation', 'page-capacity', 'page-availability', 'fadeMarginChart', 'linkFormulaGuideTitle', 'capacityGuideTitle', 'availabilityGuideTitle', 'hpaSaturationWatts', 'roadmapTwoOutputTitle', 'page-reports']) {
  if (!html.includes(needle)) { console.error(`Build check failed. index.html missing expected reference: ${needle}`); process.exit(1); }
}
console.log(`Static build check passed (${required.length} core assets found).`);

const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
if (!app.includes('function renderFadeMarginChart') || !app.includes('Core.calculateFadeMarginProfile')) { console.error('Build check failed. Fade-margin chart renderer is missing.'); process.exit(1); }
console.log('Fade-margin chart wiring check passed.');

const core = fs.readFileSync(path.join(root, 'core.js'), 'utf8');
if (!core.includes('function dbwToWatts') || !core.includes('function wattsToDbw')) { console.error('Build check failed. dBW/W conversion helpers are missing.'); process.exit(1); }
console.log('Formula-guide and power-unit conversion wiring check passed.');
