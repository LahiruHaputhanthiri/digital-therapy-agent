const sharp = require('sharp');
const path = require('path');

async function createGradient(filename, c1, c2, angle = '135') {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1}"/>
        <stop offset="100%" style="stop-color:${c2}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'slides', filename));
}

async function createSolidRect(filename, color, w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${color}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'slides', filename));
}

async function createAccentBar(filename, color, w = 1920, h = 8) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="100%" height="100%" fill="${color}"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'slides', filename));
}

async function createCircleShape(filename, color, size = 200) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}" opacity="0.15"/>
  </svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, 'slides', filename));
}

async function main() {
  // Deep Teal + Dark Navy palette for mental health / academic project
  // Primary: #0D4F4F (Deep Teal), Secondary: #1A1A2E (Dark Navy)
  // Accent: #00B4D8 (Bright Cyan), Warm: #F77F00 (Amber), Light: #EDF2F4

  // Title slide gradient: Deep teal to dark navy
  await createGradient('bg_title.png', '#0D4F4F', '#1A1A2E');
  // Section header gradient: Slightly lighter
  await createGradient('bg_section.png', '#134E5E', '#16222A');
  // Content slides: Clean white with subtle blue tint
  await createSolidRect('bg_content.png', '#F8FAFB', 1920, 1080);
  // Ending slide gradient
  await createGradient('bg_ending.png', '#1A1A2E', '#0D4F4F');

  // Accent bars
  await createAccentBar('accent_teal.png', '#00B4D8');
  await createAccentBar('accent_amber.png', '#F77F00');

  // Decorative circles
  await createCircleShape('circle_teal.png', '#00B4D8', 300);
  await createCircleShape('circle_amber.png', '#F77F00', 200);

  console.log('All assets generated.');
}

main().catch(console.error);
