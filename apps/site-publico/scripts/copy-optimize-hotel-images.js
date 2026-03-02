/**
 * Script para copiar e otimizar imagens dos hotéis de D:\Backup Windows Kingiston\Pictures
 * para public/images/hotels/{hotel-id}/ - WebP, leve e com boa qualidade
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_BASE = 'D:\\Backup Windows Kingiston\\Pictures';
const DEST_BASE = path.join(__dirname, '../public/images/hotels');

// Mapeamento: nome exato da pasta em Pictures → hotel id
const FOLDER_TO_HOTEL_ID = {
  'Lagoa Eco Towers reservei': 'lagoa-eco-towers',
  'Piazza DiRoma Caldas Novas': 'piazza-diroma',
  'Spazzio diRoma': 'spazzio-diroma',
  'Lacqua Di Roma': 'lacqua-diroma',
  'Praias do Lago Eco Resort': 'praias-do-lago-eco-resort',
  'Resort do lago Reservei Viagens': 'resort-do-lago',
  'Fiori DiRoma': 'diroma-fiori',
  'Hotel Parque Das Primaveras': 'hotel-parque-das-primaveras',
  'Hotel CTC': 'hotel-ctc',
  'Hotel Marina Flat': 'hotel-marina-flat',
  'Golden Dolphin Express': 'golden-dolphin-express',
  'HotSprings B3 Hotéis': 'hotsprings-b3-hoteis',
  'Império Romano': 'imperio-romano',
  'LAGOA QUENTE Hotel': 'lagoa-quente-hotel',
  'Rio das Pedras Thermas Hotel': 'rio-das-pedras-thermas',
  'Thermas do Bandeirante': 'thermas-do-bandeirante',
  'Thermas Place': 'thermas-place',
  'Aquarius Residence': 'aquarius-residence',
  'ARARAS Apart Service': 'araras-apart-service',
  'Boulevard Prive Suite Hotel': 'boulevard-prive-suite',
  'casa da madeira': 'casa-da-madeira',
  'Diroma Exclusive': 'diroma-exclusive',
  'Eldorado Flat': 'eldorado-flat',
  'Everest Flat Service': 'everest-flat-service',
  'Fiore Prime': 'fiore-prime-flat',
  'Fiore Prime Flat': 'fiore-prime-flat',
  'Le Jardin Suítes': 'le-jardin-suites',
  'Paradise Flat Residence': 'paradise-flat-residence',
  'Recanto do Bosque - Flat Service': 'recanto-do-bosque-flat',
  'The Villeneuve Residence': 'the-villeneuve-residence',
  'ALDEIA DO LAGO': 'aldeia-do-lago',
  'Aldeia do Lago': 'aldeia-do-lago',
  'Alta Vista Thermas': 'alta-vista-thermas',
  'Ecologic Park': 'ecologic-park',
  'Ecologic Ville Resort': 'ecologic-ville-resort',
  'ilhas do lago': 'ilhas-do-lago',
  'parque veredas': 'parque-veredas',
  'Parque Veredas': 'parque-veredas',
  'Prive das Thermas': 'prive-das-thermas',
  'recanto do bosque': 'recanto-do-bosque',
  'Recanto do Bosque': 'recanto-do-bosque',
  'riviera': 'riviera-sem-ruidos',
  'T. BANDEIRANTES 1003A-001': 't-bandeirantes',
  'AGUAS DA FONTE': 'aguas-da-fonte',
};

const IMG_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImage(srcPath, destPath) {
  await sharp(srcPath)
    .resize(1200, 800, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(destPath);
}

async function processFolder(folderName) {
  const hotelId = FOLDER_TO_HOTEL_ID[folderName];
  if (!hotelId) return { skipped: true, folder: folderName };

  const srcDir = path.join(SOURCE_BASE, folderName);
  if (!fs.existsSync(srcDir)) {
    console.warn(`  Pasta não encontrada: ${srcDir}`);
    return { skipped: true, folder: folderName, reason: 'not_found' };
  }

  const files = fs.readdirSync(srcDir)
    .filter((f) => IMG_EXT.includes(path.extname(f).toLowerCase()))
    .sort()
    .slice(0, 6);

  if (files.length === 0) {
    console.warn(`  Nenhuma imagem em: ${folderName}`);
    return { skipped: true, folder: folderName, reason: 'no_images' };
  }

  const destDir = path.join(DEST_BASE, hotelId);
  fs.mkdirSync(destDir, { recursive: true });

  for (let i = 0; i < files.length; i++) {
    const src = path.join(srcDir, files[i]);
    const dest = path.join(destDir, `${i + 1}.webp`);
    try {
      await optimizeImage(src, dest);
    } catch (err) {
      console.warn(`  Erro ao processar ${files[i]}:`, err.message);
    }
  }

  return { skipped: false, folder: folderName, hotelId, count: files.length };
}

async function main() {
  console.log('Iniciando cópia e otimização de imagens...');
  console.log('Origem:', SOURCE_BASE);
  console.log('Destino:', DEST_BASE);

  if (!fs.existsSync(SOURCE_BASE)) {
    console.error('Pasta de origem não encontrada!');
    process.exit(1);
  }

  fs.mkdirSync(DEST_BASE, { recursive: true });

  const folders = fs.readdirSync(SOURCE_BASE, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  let processed = 0;
  let skipped = 0;

  for (const folder of folders) {
    const result = await processFolder(folder);
    if (result.skipped) {
      skipped++;
    } else {
      processed++;
      console.log(`  OK: ${folder} → ${result.hotelId} (${result.count} imagens)`);
    }
  }

  console.log(`\nConcluído. ${processed} pastas processadas, ${skipped} ignoradas.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
