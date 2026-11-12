import * as THREE from 'three';

/**
 * Generates an emissive tech mosaic texture procedurally on an HTML5 canvas at runtime.
 * Zero external downloads or CDN requests.
 */
export function createMosaicTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep dark obsidian navy base
  ctx.fillStyle = '#050a1c';
  ctx.fillRect(0, 0, size, size);

  // Grid of technological mosaic blocks
  const gridSize = 16;
  const tileSize = size / gridSize;

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      const rand = Math.random();
      const px = x * tileSize;
      const py = y * tileSize;

      if (rand > 0.88) {
        // Glowing electric cyan pixel
        ctx.fillStyle = '#37d3fc';
        ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
      } else if (rand > 0.75) {
        // Lavender/ice blue tile
        ctx.fillStyle = '#0e2a52';
        ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
      } else if (rand > 0.6) {
        // Subtle circuit line
        ctx.strokeStyle = 'rgba(55, 211, 252, 0.25)';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
      }
    }
  }

  // Draw cyber circuitry traces
  ctx.strokeStyle = 'rgba(55, 211, 252, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * size, Math.random() * size);
    ctx.lineTo(Math.random() * size, Math.random() * size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Generates procedural canvas textures for the 4 thin glowing sample cards:
 * 1. Aadhaar (Fictional: Aarav Sharma • XXXX XXXX 1234)
 * 2. PAN (Fictional: Priya Verma • ABCDE1234F)
 * 3. GSTIN (Fictional: Vikram Enterprises • 29AAAAA0000A1Z5)
 * 4. Passport (Fictional: Ananya Rao • P1234567)
 * Strictly fictional sample data with "SAMPLE ONLY" mark; no government emblems or logos.
 */
export function createSampleCardTexture(cardIndex: number): THREE.CanvasTexture {
  const width = 380;
  const height = 240;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const cardsData = [
    { title: 'IDENTITY SPECIMEN', name: 'Aarav Sharma', idNum: 'XXXX XXXX 1234', type: 'AADHAAR REF' },
    { title: 'TAX IDENTIFIER', name: 'Priya Verma', idNum: 'ABCDE1234F', type: 'FIN-PAN REF' },
    { title: 'COMMERCE REGISTRY', name: 'Vikram Enterprises', idNum: '29AAAAA0000A1Z5', type: 'GSTIN REF' },
    { title: 'TRAVEL DOCUMENT', name: 'Ananya Rao', idNum: 'P1234567', type: 'PASSPORT REF' },
  ];

  const data = cardsData[cardIndex % cardsData.length];

  // Dark translucent background with glow border
  ctx.fillStyle = 'rgba(5, 10, 28, 0.88)';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#37d3fc';
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, width - 8, height - 8);

  // Inner subtle border
  ctx.strokeStyle = 'rgba(55, 211, 252, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Header
  ctx.fillStyle = '#37d3fc';
  ctx.font = 'bold 12px monospace';
  ctx.fillText(data.type, 24, 38);

  // Watermark "SAMPLE ONLY"
  ctx.fillStyle = 'rgba(213, 221, 253, 0.2)';
  ctx.font = 'bold 22px monospace';
  ctx.fillText('SAMPLE ONLY // DPDP MASKED', 24, 76);

  // Field Name
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('NAME:', 24, 115);
  ctx.fillStyle = '#d5ddfd';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(data.name, 24, 138);

  // Field Number
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('IDENTIFIER:', 24, 172);
  ctx.fillStyle = '#37d3fc';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(data.idNum, 24, 196);

  // Chip graphic
  ctx.fillStyle = 'rgba(55, 211, 252, 0.25)';
  ctx.fillRect(width - 70, 26, 44, 34);
  ctx.strokeStyle = '#37d3fc';
  ctx.strokeRect(width - 70, 26, 44, 34);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
