const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
const checks = [
  ['manifest name', Boolean(manifest.name)],
  ['standalone display', manifest.display === 'standalone'],
  ['relative start URL', manifest.start_url === './'],
  ['relative scope', manifest.scope === './'],
  ['192 icon', manifest.icons.some(i => i.sizes === '192x192' && fs.existsSync(path.join(root, i.src.replace(/^\.\//, ''))))],
  ['512 icon', manifest.icons.some(i => i.sizes === '512x512' && fs.existsSync(path.join(root, i.src.replace(/^\.\//, ''))))],
  ['service worker', fs.existsSync(path.join(root, 'sw.js'))],
  ['service worker cache version', fs.readFileSync(path.join(root, 'sw.js'), 'utf8').includes('satops-shell-v1.4.0')]
];
for (const [label, ok] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
if (checks.some(([, ok]) => !ok)) process.exit(1);
console.log('Static PWA manifest checks passed. Actual installability must be confirmed on an HTTPS deployment and Android device.');
