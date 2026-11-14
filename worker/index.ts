/**
 * API del formulario de contacto.
 *
 * El Worker sirve el sitio estático desde `./dist` y solo ejecuta este código
 * en `/api/*`. El resto de rutas las resuelve Cloudflare directamente desde
 * los assets, sin invocar el script.
 *
 * Variables y bindings:
 * - `ORINOCO_FORMS_QUEUE`: namespace KV donde se guardan los mensajes.
 * - `ADMIN_TOKEN`: secreto para leer la bandeja desde `/api/admin/messages`.
 */

interface KVNamespace {
  put(
    key: string,
    value: string,
    options?: { metadata?: Record<string, unknown>; expirationTtl?: number },
  ): Promise<void>;
  get(key: string, type: 'json'): Promise<unknown>;
  list(options?: { prefix?: string; limit?: number }): Promise<{ keys: Array<{ name: string }> }>;
}

interface Env {
  ORINOCO_FORMS_QUEUE: KVNamespace;
  ADMIN_TOKEN: string;
}

const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_COMPANY = 120;
const MAX_MESSAGE = 5000;
const MAX_PAGE = 500;
const MAX_SOURCE = 200;
const RETENTION_SECONDS = 60 * 60 * 24 * 180;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function read(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contacto') {
      return handleContact(request, env);
    }

    if (url.pathname === '/api/admin/messages') {
      return handleAdmin(request, env);
    }

    return json(404, { ok: false, error: 'not-found' });
  },
};

async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json(405, { ok: false, error: 'method' });

  const contentType = (request.headers.get('Content-Type') ?? '').toLowerCase();
  if (!contentType.startsWith('application/json')) {
    return json(415, { ok: false, error: 'content-type' });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, error: 'too-large' });

  let data: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return json(400, { ok: false, error: 'json' });
    }
    data = parsed as Record<string, unknown>;
  } catch {
    return json(400, { ok: false, error: 'json' });
  }

  // Honeypot: los bots que rellenan todo reciben un falso éxito.
  if (read(data.website) !== '') return json(200, { ok: true });

  const name = read(data.name);
  const email = read(data.email);
  const company = read(data.company);
  const message = read(data.message);
  const page = read(data.page).slice(0, MAX_PAGE);
  const source = read(data.source).slice(0, MAX_SOURCE);

  if (name.length < 2 || name.length > MAX_NAME) {
    return json(400, { ok: false, field: 'name' });
  }
  if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
    return json(400, { ok: false, field: 'email' });
  }
  if (message.length < 20 || message.length > MAX_MESSAGE) {
    return json(400, { ok: false, field: 'message' });
  }
  if (company.length > MAX_COMPANY) {
    return json(400, { ok: false, field: 'company' });
  }
  if (data.privacy !== true) {
    return json(400, { ok: false, field: 'privacy' });
  }

  const receivedAt = new Date().toISOString();
  const key = `contact/${receivedAt}/${crypto.randomUUID()}`;

  await env.ORINOCO_FORMS_QUEUE.put(
    key,
    JSON.stringify({ name, email, company, message, page, source, receivedAt }),
    {
      metadata: { name, email, receivedAt },
      expirationTtl: RETENTION_SECONDS,
    },
  );

  return json(200, { ok: true });
}

async function handleAdmin(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return json(405, { ok: false, error: 'method' });

  const authorization = request.headers.get('Authorization') ?? '';
  if (!env.ADMIN_TOKEN || authorization !== `Bearer ${env.ADMIN_TOKEN}`) {
    return json(401, { ok: false, error: 'unauthorized' });
  }

  const url = new URL(request.url);
  const requested = Number(url.searchParams.get('limit') ?? '25');
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(Math.trunc(requested), 1), 100)
    : 25;

  const list = await env.ORINOCO_FORMS_QUEUE.list({ prefix: 'contact/', limit });
  const items = await Promise.all(
    list.keys.map(async (entry) => {
      const value = (await env.ORINOCO_FORMS_QUEUE.get(entry.name, 'json')) as Record<
        string,
        unknown
      > | null;
      return { key: entry.name, ...(value ?? {}) };
    }),
  );

  return json(200, { ok: true, count: items.length, items });
}
