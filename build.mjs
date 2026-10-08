// Bundles everything into one double-clickable file: windows-of-bengaluru.html
// Usage: npm install && npm run build
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';

const out = await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  format: 'esm',
  minify: true,
  write: false,
  target: ['es2020', 'safari15', 'chrome90', 'firefox90'],   // Safari 15+ (2021) and later
});
const js = out.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
// the stylesheet lives in src/, so its font paths start with ../ — inlined at the root they don't
const css = readFileSync('src/styles.css', 'utf8').replaceAll('../assets/', 'assets/');
const html = readFileSync('index.html', 'utf8')
  .replace('<link rel="stylesheet" href="src/styles.css">', `<style>\n${css}\n</style>`)
  .replace('<script type="module" src="src/main.js"></script>', () => `<script type="module">\n${js}\n</script>`);
writeFileSync('windows-of-bengaluru.html', html);
console.log(`built windows-of-bengaluru.html (${(html.length / 1024).toFixed(0)} KB)`);
