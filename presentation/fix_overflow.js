const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');

// For gradient/overlay slides, the issue is body display:flex with full-size children.
// Fix: Remove display:flex from body on overlay-style slides and use the overlay div for layout.
const overflowSlides = ['slide01_title.html', 'slide02_section_intro.html', 'slide06_section_impl.html', 'slide18_thankyou.html'];

for (const file of overflowSlides) {
  const fp = path.join(slidesDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  // Remove display: flex from body (the overlay div handles centering)
  html = html.replace(/body\s*\{[^}]*\}/g, (match) => {
    return match.replace(/display:\s*flex;\s*/g, '');
  });
  fs.writeFileSync(fp, html);
  console.log(`Fixed overflow: ${file}`);
}

// For slide03, the content div extends beyond body. Reduce content bottom margin.
const slide03 = path.join(slidesDir, 'slide03_background.html');
let html03 = fs.readFileSync(slide03, 'utf8');
html03 = html03.replace('bottom: 20pt;', 'bottom: 30pt;');
html03 = html03.replace(/body\s*\{[^}]*\}/g, (match) => {
  return match.replace(/display:\s*flex;\s*/g, '');
});
// Also reduce font sizes slightly to fit
html03 = html03.replace('.col-left ul { margin: 6pt 0; padding-left: 16pt; }', '.col-left ul { margin: 4pt 0; padding-left: 14pt; }');
html03 = html03.replace('.col-left li { font-size: 10.5pt;', '.col-left li { font-size: 9.5pt;');
fs.writeFileSync(slide03, html03);
console.log('Fixed overflow: slide03_background.html');

console.log('All overflow fixes applied.');
