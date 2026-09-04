const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const overflowSlides = ['slide01_title.html', 'slide02_section_intro.html', 'slide06_section_impl.html', 'slide18_thankyou.html'];

for (const file of overflowSlides) {
  const fp = path.join(slidesDir, file);
  let html = fs.readFileSync(fp, 'utf8');
  
  // The problem is .bg and .overlay are position:absolute + 100% dimensions
  // which the overflow checker sees as overflowing.
  // Fix: make .bg and .overlay use explicit pixel values that fit inside body.
  // The body is 720pt x 405pt. The absolute children are 100% x 100% which should be fine.
  // The real issue is likely the h1 margin or text content pushing the overlay div beyond bounds.
  
  // Ensure no default margins on h1
  html = html.replace(
    /html \{ background: #ffffff; \}/,
    'html { background: #ffffff; margin: 0; padding: 0; }'
  );
  
  // Make sure overlay is clipped
  html = html.replace(
    /\.overlay \{/g,
    '.overlay { overflow: hidden;'
  );
  
  // Clamp bg image 
  html = html.replace(
    /\.bg \{/g,
    '.bg { overflow: hidden;'
  );

  fs.writeFileSync(fp, html);
  console.log(`Fixed: ${file}`);
}
console.log('Done');
