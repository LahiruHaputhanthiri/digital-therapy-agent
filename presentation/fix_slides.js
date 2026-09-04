const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const files = fs.readdirSync(slidesDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const fp = path.join(slidesDir, file);
  let html = fs.readFileSync(fp, 'utf8');

  // Fix image paths: ../../academic_evidence/screenshots/XX/ -> img/
  html = html.replace(/\.\.\/\.\.\/academic_evidence\/screenshots\/[^/]+\//g, 'img/');
  // Fix model paths: ../../models/ -> img/
  html = html.replace(/\.\.\/\.\.\/models\//g, 'img/');

  // Fix overflow: add overflow: hidden to body and reduce padding on gradient slides
  // The flex body with display:flex causes 2.3pt overflow - add box-sizing
  if (!html.includes('box-sizing')) {
    html = html.replace(
      /body\s*\{/g,
      'body { box-sizing: border-box;'
    );
    // Also fix children
    html = html.replace(
      /<style>/,
      '<style>\n* { box-sizing: border-box; }'
    );
  }

  fs.writeFileSync(fp, html);
  console.log(`Fixed: ${file}`);
}
console.log('All slides fixed.');
