import nunjucks from 'nunjucks';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatesDir = path.join(__dirname, '../html/templates');
const pagesDir = path.join(__dirname, '../html/pages');
const distDir = path.join(__dirname, '../dist');

// Configure Nunjucks to look in both templates and pages directories
const env = nunjucks.configure([templatesDir, pagesDir], {
  autoescape: true,
  noCache: process.env.NODE_ENV === 'production',
});

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Ensure dist/js directory exists and copy source JS files
const distJsDir = path.join(distDir, 'js');
if (!fs.existsSync(distJsDir)) {
  fs.mkdirSync(distJsDir, { recursive: true });
}

// Copy JS source files to dist/js (for dev server)
const jsSourceDir = path.join(__dirname, '../js');
if (fs.existsSync(jsSourceDir)) {
  const jsFiles = fs.readdirSync(jsSourceDir).filter(file => file.endsWith('.js'));
  jsFiles.forEach(file => {
    const sourcePath = path.join(jsSourceDir, file);
    const destPath = path.join(distJsDir, file);
    fs.copyFileSync(sourcePath, destPath);
  });
  console.log(`✓ Copied ${jsFiles.length} JS files to dist/js`);
}

// Get all .nunjucks and .html files from pages directory
const pageFiles = fs.readdirSync(pagesDir).filter(
  (file) => file.endsWith('.nunjucks') || file.endsWith('.html')
);

// Render each page
pageFiles.forEach((file) => {
  const inputPath = path.join(pagesDir, file);
  const outputFile = file.replace(/\.nunjucks$/, '.html').replace(/\.html$/, '.html');
  const outputPath = path.join(distDir, outputFile);

  try {
    // Use renderFile to render from file path directly
    const html = env.render(inputPath, {});
    fs.writeFileSync(outputPath, html);
    console.log(`✓ Rendered ${file} → ${outputFile}`);
  } catch (error) {
    console.error(`✗ Error rendering ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('Nunjucks templates compiled successfully!');

