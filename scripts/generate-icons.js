const sharp = require('sharp');

// Criar um ícone PNG simples
const createIcon = async (size) => {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3B82F6"/>
          <stop offset="50%" style="stop-color:#8B5CF6"/>
          <stop offset="100%" style="stop-color:#EC4899"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.16}" fill="url(#gradient)"/>
      <text x="${size/2}" y="${size * 0.65}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" text-anchor="middle" fill="white">F</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(`public/icon-${size}.png`);
  
  console.log(`Ícone ${size}x${size} criado com sucesso!`);
};

// Gerar ícones
createIcon(192);
createIcon(512);
