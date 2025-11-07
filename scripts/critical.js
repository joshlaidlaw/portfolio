import { generate } from 'critical';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

try {
  const { html, css } = await generate({
    base: distDir,
    src: 'index.html',
    width: 320,
    height: 800,
    minify: true,
    inline: true,
  });

  fs.writeFileSync(indexPath, html);
  console.log('Critical CSS inlined successfully!');
} catch (error) {
  console.error('Critical CSS generation failed:', error);
  process.exit(1);
}

