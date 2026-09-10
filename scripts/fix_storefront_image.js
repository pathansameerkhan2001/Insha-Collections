const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generatePerfectBanners() {
  const inputWebpPath = path.join(__dirname, '../public/images/hero-storefront-banner-test.webp');
  const fallbackWebpPath = path.join(__dirname, '../public/images/hero-storefront-banner.webp');
  
  const sourcePath = fs.existsSync(inputWebpPath) ? inputWebpPath : fallbackWebpPath;
  const inputBuffer = fs.readFileSync(sourcePath);
  
  console.log('Read source image from:', sourcePath);
  const metadata = await sharp(inputBuffer).metadata();
  console.log(`Dimensions: ${metadata.width}x${metadata.height}`);

  // We want to create a high-definition 2048x1144 banner with the storefront sign positioned
  // at the golden ratio / upper third with 180-200px of headroom above the sign.
  
  const destWebp = path.join(__dirname, '../public/images/hero-storefront-banner.webp');
  const destJpg = path.join(__dirname, '../public/images/hero-storefront-banner.jpg');
  const destPanoramic = path.join(__dirname, '../public/images/hero-storefront-panoramic.jpg');

  // Convert to high-quality webp
  const webpBuffer = await sharp(inputBuffer)
    .resize(2048, 1144, { fit: 'cover', position: 'north' })
    .webp({ quality: 96, effort: 6 })
    .toBuffer();

  const jpgBuffer = await sharp(inputBuffer)
    .resize(2048, 1144, { fit: 'cover', position: 'north' })
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  const panoramicBuffer = await sharp(inputBuffer)
    .resize(2048, 960, { fit: 'cover', position: 'north' })
    .jpeg({ quality: 96, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync(destWebp, webpBuffer);
  fs.writeFileSync(destJpg, jpgBuffer);
  fs.writeFileSync(destPanoramic, panoramicBuffer);

  // Clean up test file if it exists
  if (fs.existsSync(inputWebpPath) && inputWebpPath !== destWebp) {
    try { fs.unlinkSync(inputWebpPath); } catch (_) {}
  }

  console.log('All hero storefront banners generated and saved successfully!');
}

generatePerfectBanners().catch(console.error);
