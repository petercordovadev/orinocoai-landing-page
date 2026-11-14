import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { Resvg } from '@resvg/resvg-js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fontsDir = path.join(root, 'scripts', 'fonts');
const fontFiles = [
  path.join(fontsDir, 'SpaceGrotesk.ttf'),
  path.join(fontsDir, 'Inter.ttf'),
];

const palette = {
  night: '#0B1A1F',
  surface: '#12272E',
  river: '#1E7F6B',
  amber: '#E8A33D',
  cyan: '#4FB3C8',
  ink: '#F4EEE3',
  muted: '#9FB3B5',
};

const assets = {
  hero: path.join(root, 'src', 'assets', 'hero', 'hero-orinoco.webp'),
  services: path.join(root, 'src', 'assets', 'servicios'),
  blog: path.join(root, 'src', 'assets', 'blog'),
};

function wavePath({ width, y, amplitude, frequency, phase, step = 18 }) {
  const points = [];
  for (let x = -40; x <= width + 40; x += step) {
    const t = (x / width) * Math.PI * 2 * frequency + phase;
    points.push(`${x.toFixed(1)} ${(y + Math.sin(t) * amplitude).toFixed(1)}`);
  }
  return `M ${points.join(' L ')}`;
}

function riverLines({ width, height, accent, density = 12, opacity = 0.4 }) {
  const lines = [];
  for (let i = 0; i < density; i += 1) {
    const ratio = i / (density - 1);
    const y = height * (0.12 + ratio * 0.8);
    const amplitude = 18 + Math.sin(i * 1.7) * 28 + ratio * 26;
    const frequency = 1.1 + (i % 5) * 0.18;
    const phase = i * 0.62;
    const color = i === density - 1 ? accent : i % 4 === 0 ? palette.cyan : palette.river;
    const strokeWidth = i === density - 1 ? 4 : 1 + (i % 3) * 0.55;
    const lineOpacity = i === density - 1 ? 0.85 : opacity * (0.35 + ((i * 7) % 10) / 14);
    lines.push(
      `<path d="${wavePath({ width, y, amplitude, frequency, phase })}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" opacity="${lineOpacity.toFixed(2)}" />`,
    );
  }
  return lines.join('\n');
}

function nodes({ width, height, accent, count = 5 }) {
  const positions = [
    [width * 0.18, height * 0.28],
    [width * 0.42, height * 0.55],
    [width * 0.66, height * 0.32],
    [width * 0.82, height * 0.68],
    [width * 0.56, height * 0.8],
    [width * 0.28, height * 0.72],
  ].slice(0, count);
  const links = positions
    .slice(0, -1)
    .map(
      (point, index) =>
        `<line x1="${point[0]}" y1="${point[1]}" x2="${positions[index + 1][0]}" y2="${positions[index + 1][1]}" stroke="${palette.cyan}" stroke-width="1.2" opacity="0.28" />`,
    )
    .join('\n');
  const dots = positions
    .map(
      ([x, y], index) =>
        `<circle cx="${x}" cy="${y}" r="${index === 2 ? 9 : 5}" fill="${index === 2 ? accent : palette.ink}" opacity="${index === 2 ? 0.95 : 0.55}" />`,
    )
    .join('\n');
  return `${links}\n${dots}`;
}

function art({ width, height, accent, variant = 'river', density = 12, focal = 'right' }) {
  const grid = Array.from({ length: Math.ceil(width / 90) }, (_, i) => {
    const x = i * 90;
    return `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${palette.ink}" stroke-width="0.5" opacity="0.035" />`;
  }).join('\n');
  const horizontalGrid = Array.from({ length: Math.ceil(height / 90) }, (_, i) => {
    const y = i * 90;
    return `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${palette.ink}" stroke-width="0.5" opacity="0.035" />`;
  }).join('\n');

  const focalX = focal === 'right' ? width * 0.78 : width * 0.3;
  const focalY = height * 0.24;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.night}" />
      <stop offset="0.6" stop-color="${palette.surface}" />
      <stop offset="1" stop-color="${palette.night}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${accent}" stop-opacity="0.34" />
      <stop offset="0.55" stop-color="${accent}" stop-opacity="0.08" />
      <stop offset="1" stop-color="${accent}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.night}" stop-opacity="0" />
      <stop offset="1" stop-color="${palette.night}" stop-opacity="0.55" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  ${grid}
  ${horizontalGrid}
  <circle cx="${focalX}" cy="${focalY}" r="${Math.min(width, height) * 0.52}" fill="url(#glow)" />
  <g>${riverLines({ width, height, accent, density })}</g>
  ${variant === 'nodes' ? `<g>${nodes({ width, height, accent })}</g>` : ''}
  ${variant === 'rings' ? `<g fill="none" stroke="${palette.cyan}" opacity="0.18"><circle cx="${focalX}" cy="${focalY}" r="${height * 0.2}" stroke-width="1" /><circle cx="${focalX}" cy="${focalY}" r="${height * 0.32}" stroke-width="1" /><circle cx="${focalX}" cy="${focalY}" r="${height * 0.44}" stroke-width="1" /></g>` : ''}
  <rect y="${height * 0.72}" width="${width}" height="${height * 0.28}" fill="url(#fade)" />
  <circle cx="${width - 54}" cy="${height - 46}" r="7" fill="${accent}" />
</svg>`;
}

async function writeWebp(svg, output, width) {
  await sharp(Buffer.from(svg))
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 84, effort: 5 })
    .toFile(output);
}

function ogImage() {
  const width = 1200;
  const height = 630;
  const waves = riverLines({ width, height, accent: palette.amber, density: 10, opacity: 0.5 });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${palette.night}" />
      <stop offset="0.68" stop-color="${palette.surface}" />
      <stop offset="1" stop-color="${palette.night}" />
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${palette.cyan}" stop-opacity="0.3" />
      <stop offset="1" stop-color="${palette.cyan}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${palette.night}" stop-opacity="0.96" />
      <stop offset="0.55" stop-color="${palette.night}" stop-opacity="0.72" />
      <stop offset="1" stop-color="${palette.night}" stop-opacity="0" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <g opacity="0.8">${waves}</g>
  <circle cx="980" cy="120" r="420" fill="url(#glow)" />
  <rect width="${width}" height="${height}" fill="url(#veil)" />
  <g font-family="Space Grotesk">
    <text x="80" y="118" font-size="18" font-weight="500" letter-spacing="3.4" fill="${palette.cyan}">AUTOMATIZACIÓN · IA APLICADA</text>
    <text x="80" y="264" font-size="76" font-weight="700" letter-spacing="-2.5" fill="${palette.ink}">Orinoco</text>
    <text x="80" y="342" font-size="76" font-weight="500" letter-spacing="-2.5" fill="${palette.muted}">AI Solutions</text>
  </g>
  <line x1="80" y1="396" x2="228" y2="396" stroke="${palette.amber}" stroke-width="4" stroke-linecap="round" />
  <g font-family="Inter">
    <text x="80" y="462" font-size="27" fill="${palette.ink}">Menos trabajo manual. Más tiempo para decidir.</text>
    <text x="80" y="548" font-size="19" fill="${palette.muted}">orinocoaisolutions.com</text>
  </g>
  <circle cx="1120" cy="548" r="6" fill="${palette.amber}" />
</svg>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="15" fill="${palette.night}" />
  <path d="M17 45c0-13.5 7.2-23 17.4-23 9.2 0 14.1 6.1 14.1 13.4 0 8.2-5.8 14.1-14.4 14.1" fill="none" stroke="${palette.cyan}" stroke-width="5" stroke-linecap="round" />
  <path d="M17 45c4.8 2.5 10.4 2.3 15.7-.4" fill="none" stroke="${palette.river}" stroke-width="4" stroke-linecap="round" />
  <circle cx="46" cy="18" r="4.5" fill="${palette.amber}" />
</svg>`;
}

async function renderPng(svg, output, width) {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: {
      fontFiles,
      loadSystemFonts: false,
      defaultFontFamily: 'Inter',
    },
  })
    .render()
    .asPng();
  await writeFile(output, png);
}

async function main() {
  await mkdir(path.dirname(assets.hero), { recursive: true });
  await mkdir(assets.services, { recursive: true });
  await mkdir(assets.blog, { recursive: true });
  await mkdir(path.join(root, 'public'), { recursive: true });

  await writeWebp(
    art({ width: 1200, height: 1200, accent: palette.amber, variant: 'river', density: 15, focal: 'right' }),
    assets.hero,
    1200,
  );

  const serviceArt = [
    ['automatizacion-de-procesos', palette.amber, 'river', 14],
    ['chatbots-y-agentes-de-ia', palette.cyan, 'rings', 11],
    ['integraciones-entre-herramientas', palette.river, 'nodes', 12],
  ];
  for (const [slug, accent, variant, density] of serviceArt) {
    await writeWebp(
      art({ width: 1200, height: 800, accent, variant, density, focal: slug === 'chatbots-y-agentes-de-ia' ? 'left' : 'right' }),
      path.join(assets.services, `${slug}.webp`),
      1200,
    );
  }

  const blogArt = [
    ['procesos-a-automatizar', palette.amber, 'river', 13],
    ['agentes-de-ia-atencion-cliente', palette.cyan, 'rings', 10],
    ['integrar-herramientas', palette.river, 'nodes', 12],
  ];
  for (const [slug, accent, variant, density] of blogArt) {
    await writeWebp(
      art({ width: 1200, height: 630, accent, variant, density, focal: slug === 'agentes-de-ia-atencion-cliente' ? 'left' : 'right' }),
      path.join(assets.blog, `${slug}.webp`),
      1200,
    );
  }

  await renderPng(ogImage(), path.join(root, 'public', 'og-image.png'), 1200);
  await renderPng(faviconSvg(), path.join(root, 'public', 'favicon-512.png'), 512);
  await renderPng(faviconSvg(), path.join(root, 'public', 'apple-touch-icon.png'), 180);
  await renderPng(faviconSvg(), path.join(root, 'public', 'favicon-32.png'), 32);
  await writeFile(path.join(root, 'public', 'favicon.svg'), faviconSvg());

  console.log('Assets generados correctamente.');
}

await main();
