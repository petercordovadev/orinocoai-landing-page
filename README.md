# Orinoco AI Solutions

Sitio web estático de **Orinoco AI Solutions**, un estudio de automatización e IA aplicada con base en Ciudad Bolívar, Venezuela. El sitio está pensado para publicarse en Cloudflare Pages y está escrito íntegramente en español.

- Sitio: `https://orinocoaisolutions.com`
- Stack: Astro 7, Tailwind CSS 4, Content Collections, TypeScript
- Salida: HTML estático en `dist/`
- Sin framework de UI adicional (no React, no Vue)
- Sin cookies de analítica: Cloudflare Web Analytics se activa desde el panel de Cloudflare Pages

## Requisitos

- Node.js **22.23.4** (ver `.nvmrc`)
- npm 10 o superior

## Inicio rápido

```bash
npm install
cp .env.example .env
# Edita .env con tu URL de Cal.com y tu webhook real
npm run dev
```

El sitio queda disponible en `http://localhost:4321`.

## Variables de entorno

Astro valida las variables con `astro:env` y falla el build si faltan.

| Variable | Contexto | Obligatoria | Descripción |
| --- | --- | --- | --- |
| `PUBLIC_CAL_URL` | Cliente | Sí | URL completa del evento de Cal.com. Ejemplo: `https://cal.com/petercordovadev/auditoria` |
| `PUBLIC_FORM_ENDPOINT` | Cliente | Sí | Endpoint que recibe el formulario de contacto por `POST` en JSON |

Ambas son públicas: se incluyen en el HTML y en el JavaScript del navegador. **No pongas secretos en variables `PUBLIC_*`.**

En Cloudflare Pages, configúralas en **Settings → Environment variables** para Production y Preview. Si tu proyecto necesita fijar la versión de Node, añade `NODE_VERSION=22.23.4`.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Genera el sitio estático en `dist/` |
| `npm run preview` | Previsualiza el build local |
| `npm run check` | Comprueba tipos y errores de Astro |
| `npm run assets` | Regenera ilustraciones, OG image y favicons |

Antes de publicar cualquier cambio:

```bash
npm run check && npm run build
```

## Estructura

```text
docs/
  state-machines.md       Contrato de estados de formulario, Cal, menú, FAQ y build
src/
  assets/                 Ilustraciones propias (hero, servicios, blog)
  components/             Header, footer, tarjetas, formulario, embed de Cal.com, SEO...
  content/
    blog/                 Artículos en Markdown
    servicios/            Servicios en Markdown
  content.config.ts       Esquemas Zod de las colecciones
  data/
    categories.ts         Categorías del blog
    site.ts               Nombre, email, redes, navegación
  layouts/                BaseLayout y LegalLayout
  lib/
    cal.ts                Deriva origen, script y ruta desde PUBLIC_CAL_URL
    cal-embed-machine.ts      Estados explícitos del embed de Cal.com
    contact-form-machine.ts   Estados explícitos del formulario de contacto
    content.ts            Consultas y orden de las colecciones
    format.ts             Fechas, tiempo de lectura
    jsonld.ts             Schemas de Organization, Service, Article, FAQ...
  pages/                  Rutas del sitio
  styles/global.css       Tokens de diseño y estilos globales
public/
  _headers                Cabeceras de seguridad y caché para Cloudflare Pages
  robots.txt
  og-image.png
  favicons
scripts/
  generate-assets.mjs     Generador reproducible de imágenes y favicons
```

## Máquinas de estado

Las partes interactivas y de construcción siguen un contrato explícito de estados. El formulario y el embed de Cal.com usan reducers puros en `src/lib/`; el menú móvil y las preguntas frecuentes se apoyan en `<details>` nativo. El contrato DOM (`data-machine`, `data-state`, `aria-busy`, roles de estado) y las tablas de transición están en [`docs/state-machines.md`](docs/state-machines.md).

## Contenido

### Servicios

Cada archivo en `src/content/servicios/` declara en el frontmatter:

`title`, `shortTitle`, `description`, `summary`, `keyword`, `order`, `image`, `imageAlt`, `deliverables`, `tools`, `faq` y `draft`.

El slug de la URL sale del nombre del archivo. Por ejemplo, `automatizacion-de-procesos.md` se publica en `/servicios/automatizacion-de-procesos/`. No uses guiones bajos en nombres de archivo ni en rutas.

`order` debe ser único: `getServices()` falla el build si hay dos servicios con el mismo valor.

### Blog

Cada archivo en `src/content/blog/` declara:

```yaml
---
title: "Título del artículo"
description: "Descripción de 70 a 180 caracteres."
date: 2026-11-02
category: "Automatización" # Automatización | IA aplicada | Integraciones
image: "../../assets/blog/mi-imagen.webp"
imageAlt: "Texto alternativo descriptivo."
keyword: "palabra clave principal"
---
```

El esquema está en `src/content.config.ts` y el build falla si un campo no cumple las validaciones. Las categorías válidas están en `src/data/categories.ts`.

`draft` es la única puerta de publicación. `date` es metadato de visualización y orden: un artículo con fecha futura se publica igualmente en el siguiente build. Para programar contenido haría falta un build o un deploy hook, no solo la fecha.

Rutas generadas:

- `/blog/` — listado y destacado
- `/blog/categoria/[categoria]/` — filtro por categoría
- `/blog/[slug]/` — artículo
- `/rss.xml` — feed RSS

## Integración con Cal.com

Todo se deriva de una única variable, `PUBLIC_CAL_URL`:

- `href`: URL completa para abrir la agenda en una pestaña nueva.
- `origin`: origen de Cal.com, usado para cargar el script.
- `path`: ruta del evento (`usuario/evento`) que se pasa al embed.
- `script`: `${origin}/embed.js`.

No hay ningún `cal.com` escrito a mano en el código. Si cambias de usuario o de evento, solo actualiza `PUBLIC_CAL_URL`.

El embed se carga de forma diferida: aparece una tarjeta con un botón y el calendario se inicializa cuando el usuario interactúa o cuando la sección se acerca al viewport. En `/contacto/` la carga automática está activa por defecto (`autoLoad`); la copia de la página lo indica. Si falla o falta configuración, se muestra un enlace directo al calendario. El estado del embed está modelado en `src/lib/cal-embed-machine.ts`.

### Redirección después de reservar

En Cal.com, abre el tipo de evento de `PUBLIC_CAL_URL` y configura la redirección posterior a la reserva (**Redirect on booking** o la opción equivalente de tu plan) hacia:

```text
https://orinocoaisolutions.com/gracias/
```

La página `/gracias/` está marcada con `noindex, nofollow` y excluida del sitemap. Si tu plan de Cal.com no permite redirección, la confirmación se mostrará dentro del propio calendario; el resto del sitio seguirá funcionando.

## Formulario de contacto

`ContactForm.astro` valida en el navegador y envía un `POST` JSON a `PUBLIC_FORM_ENDPOINT`.

Contrato del payload:

```json
{
  "name": "Nombre",
  "email": "nombre@dominio.com",
  "company": "Empresa o null",
  "message": "Descripción del caso",
  "privacy": true,
  "source": "orinocoaisolutions.com/contacto",
  "page": "https://orinocoaisolutions.com/contacto/",
  "sentAt": "2026-11-02T12:00:00.000Z"
}
```

Requisitos del endpoint:

- Aceptar `Content-Type: application/json`.
- Responder al preflight `OPTIONS` con las cabeceras CORS adecuadas.
- Devolver un estado `2xx` cuando el mensaje se recibe correctamente.
- Permitir CORS desde `https://orinocoaisolutions.com` y, en desarrollo, desde `http://localhost:4321`.
- No redirigir la petición: el formulario muestra el éxito o el error en la misma página.
- Responder en menos de 15 segundos (el cliente cancela la petición después).

El formulario incluye un campo honeypot llamado `website`. Si llega con contenido, se ignora el envío. No sustituyas el honeypot por una validación que bloquee usuarios reales.

El endpoint de `.env.example` es un placeholder. `PUBLIC_FORM_ENDPOINT` es obligatoria para `astro:env`, así que un build sin la variable falla. El estado `unconfigured` del formulario es una defensa para valores vacíos o inválidos y muestra el enlace de correo directo.

## Despliegue en Cloudflare Pages

1. Sube el repositorio a GitHub, GitLab o Bitbucket.
2. En Cloudflare, entra en **Workers & Pages → Create → Pages → Connect to Git**.
3. Selecciona el repositorio.
4. Configura el build:
   - **Framework preset:** Astro (o “None”)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
5. Añade `PUBLIC_CAL_URL` y `PUBLIC_FORM_ENDPOINT` en **Environment variables** (Production y Preview).
6. Despliega.
7. En **Custom domains**, añade `orinocoaisolutions.com` y el dominio `www` si lo usas. Configura el DNS según indique Cloudflare.
8. En **Metrics → Web Analytics**, activa la analítica. Cloudflare la inyecta automáticamente en las páginas; no hay token que pegar en el código.

El archivo `.nvmrc` fija Node `22.23.4`. Si Cloudflare usa otra versión, define `NODE_VERSION=22.23.4` en las variables de entorno del proyecto.

### Cabeceras y caché

`public/_headers` se copia a `dist/_headers` y Cloudflare Pages lo aplica:

- Cabeceras de seguridad básicas (`nosniff`, `X-Frame-Options`, `Referrer-Policy`, HSTS, Permissions-Policy).
- `Content-Security-Policy` con `frame-ancestors 'none'`, `base-uri 'self'`, `object-src 'none'` y `form-action 'self'`.
- `X-Permitted-Cross-Domain-Policies: none`.
- Caché inmutable de un año para los assets con hash de `/_astro/*`.
- Caché de una hora para `/rss.xml`.

La CSP de scripts y estilos se genera en build con `security.csp` de Astro (`astro.config.mjs`). Astro calcula los hashes SHA-256 de los scripts inline de cada página y añade `https://cal.com` como origen permitido para el embed. La política de `frame-ancestors` va en `_headers` porque los navegadores ignoran esa directiva dentro de `<meta>`.

> Si cambias `PUBLIC_CAL_URL` a un dominio distinto de `cal.com`, actualiza también los orígenes permitidos en `security.csp` o el navegador bloqueará `embed.js`.

## SEO técnico

- `lang="es"` en todas las páginas.
- Título, descripción, canonical y Open Graph por página.
- `og:image` absoluta; las imágenes de blog y servicios usan sus dimensiones reales.
- JSON-LD: `Organization`, `WebSite`, `BreadcrumbList`, `Service`, `FAQPage`, `Article` y `Person`.
- Sitemap generado por `@astrojs/sitemap` en `/sitemap-index.xml`.
- `robots.txt` con referencia al sitemap.
- `/gracias/` y `/404` con `noindex, nofollow` y excluidos del sitemap.
- Imágenes optimizadas con `<Image>` de Astro y formatos WebP.
- Fuentes autoalojadas con Fontsource y precarga de los subsets latinos.

## Assets de marca

Las ilustraciones, la imagen Open Graph y los favicons se generan con:

```bash
npm run assets
```

El script `scripts/generate-assets.mjs` usa `sharp` y `@resvg/resvg-js`, y las fuentes de `scripts/fonts/` (con sus licencias OFL). Las fuentes autoalojadas se distribuyen bajo SIL Open Font License; los textos completos están en `public/licenses/`.

Si prefieres usar fotografías o ilustraciones propias:

1. Reemplaza los archivos de `src/assets/hero/`, `src/assets/servicios/` o `src/assets/blog/` manteniendo el nombre, o actualiza la ruta en el frontmatter.
2. Mantén proporciones razonables (por ejemplo, 1200×800 para servicios y 1200×630 para blog).
3. Actualiza `imageAlt` con una descripción real.
4. Si cambias el logo o la marca, regenera también `public/og-image.png` y los favicons.

## Accesibilidad y rendimiento

- Contraste verificado sobre los fondos oscuros: cuerpo, texto atenuado, cian y ámbar cumplen AA. El verde `river` se usa en bordes y elementos decorativos, no como color de texto normal.
- Navegación con teclado, enlace “Saltar al contenido”, foco visible y `aria-current` en la navegación.
- Imágenes con `alt`, formulario con etiquetas y mensajes de error asociados.
- Estados de envío y del calendario anunciados con `role="status"`/`role="alert"` y `aria-busy`.
- `prefers-reduced-motion` respetado.
- Objetivo Lighthouse: 95+ en rendimiento, accesibilidad, buenas prácticas y SEO.

## Pendientes antes de publicar

- [ ] Reemplazar el email de ejemplo `hola@orinocoaisolutions.com` si el definitivo es otro (`src/data/site.ts`).
- [ ] Configurar un `PUBLIC_FORM_ENDPOINT` real y probar el envío.
- [ ] Confirmar la redirección de Cal.com a `/gracias/`.
- [ ] Añadir la URL de la página de empresa de LinkedIn en `site.linkedinCompany` cuando exista.
- [ ] Revisar los textos legales con asesoría profesional si el negocio opera con clientes de la UE.
- [ ] Ejecutar Lighthouse sobre el dominio desplegado.

## Estado del repositorio

Este proyecto se ha construido y validado en local. No se ha desplegado, no se ha creado un remoto y no se han hecho commits ni push. El despliegue en Cloudflare Pages queda a cargo del propietario del proyecto.
