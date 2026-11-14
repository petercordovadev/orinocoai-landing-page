import { PUBLIC_CAL_URL } from 'astro:env/client';

export interface CalConfig {
  href: string;
  origin: string;
  path: string;
  script: string;
  host: string;
}

function buildCalConfig(): CalConfig {
  let url: URL;
  try {
    url = new URL(PUBLIC_CAL_URL);
  } catch {
    throw new Error(
      'PUBLIC_CAL_URL no es una URL válida. Revisa tu archivo .env o las variables de Cloudflare Pages.',
    );
  }

  const isDev = import.meta.env.DEV;
  const isSecure = url.protocol === 'https:' || (isDev && url.protocol === 'http:');

  if (!isSecure) {
    throw new Error(
      'PUBLIC_CAL_URL debe usar https:// (http:// solo se permite en desarrollo local).',
    );
  }

  const path = url.pathname.replace(/^\/+|\/+$/g, '');
  if (!path) {
    throw new Error('PUBLIC_CAL_URL debe incluir la ruta del evento de agenda.');
  }

  return {
    href: url.href,
    origin: url.origin,
    path,
    script: `${url.origin}/embed.js`,
    host: url.host,
  };
}

export const cal = buildCalConfig();
