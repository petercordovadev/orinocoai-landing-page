# AGENTS.md

Instrucciones para agentes que trabajen en el sitio de **Orinoco AI Solutions**.

## 1. Misión del proyecto

Construir y mantener un sitio estático, rápido y honesto para una agencia emergente de automatización e IA aplicada. El sitio debe explicar servicios concretos, publicar contenido útil y facilitar el contacto, sin inflar la empresa ni inventar pruebas sociales.

## 2. Idioma y tono

- Todo el contenido visible va en **español neutro**. No uses inglés salvo en nombres de productos o términos técnicos aceptados.
- Tono profesional, directo y cercano. Sin grandilocuencia, sin “revolucionar”, sin “sinergias” y sin promesas absolutas.
- Habla de procesos, datos y personas antes que de modelos o herramientas.
- Usa “tú” de forma consistente. No mezcles “tú” y “usted” en la misma página.
- Frases claras. Si una idea necesita tres subordinadas para entenderse, reescríbela.
- No uses emojis en el contenido del sitio.

## 3. Reglas de honestidad (no negociables)

No inventes, bajo ninguna circunstancia:

- Testimonios, clientes, casos de estudio o logos de empresas.
- Métricas, porcentajes de ahorro, resultados o retornos de inversión.
- Precios, tarifas o plazos concretos.
- Certificaciones, títulos, años de experiencia o credenciales.
- Datos legales, RIF, dirección postal o número de teléfono.
- Disponibilidad, alianzas o afiliaciones con herramientas.

Tampoco prometas que la IA “nunca se equivoca”, que sustituirá a un equipo o que resolverá el 100 % de los casos. La IA se presenta siempre dentro de un sistema con límites, supervisión y escalado humano.

Si falta un dato real, deja un texto explícito de pendiente o pregunta al propietario. No rellenes el hueco con una invención plausible.

### Datos confirmados

- Nombre: Orinoco AI Solutions.
- Fundador y responsable: Peter Córdova.
- Ubicación: Ciudad Bolívar, Venezuela.
- Email: `hola@orinocoaisolutions.com` (centralizado en `src/data/site.ts`).
- Mercados: Latinoamérica y España.
- Redes: Instagram, Threads, X y LinkedIn personal de `petercordovadev`.
- La página de empresa de LinkedIn está pendiente. Cuando exista, añádela en `site.linkedinCompany`.

## 4. Reglas de SEO

Cada página nueva debe cumplir:

- `<html lang="es">` y una sola etiqueta `<h1>`.
- Título único de aproximadamente 50–60 caracteres, con la propuesta de valor y la marca cuando quepa.
- Meta description única de 120–160 caracteres, escrita para una persona, no para un robot.
- Canonical absoluta generada por `SEO.astro` a partir de `Astro.url.pathname`.
- Open Graph y Twitter Card con imagen absoluta, ancho y alto correctos.
- Jerarquía de encabezados sin saltos (`h1` → `h2` → `h3`).
- Enlaces internos con ruta absoluta y barra final: `/servicios/`, `/blog/`, `/contacto/`.
- Texto alternativo descriptivo en todas las imágenes. No repitas el título si no aporta contexto.
- JSON-LD cuando corresponda:
  - `Organization` y `WebSite`: globales, ya están en `SEO.astro`.
  - `Service` y `FAQPage`: páginas de servicio.
  - `Article`: artículos del blog.
  - `BreadcrumbList`: lo genera `Breadcrumbs.astro`.
  - `Person`: página Sobre Orinoco.
- `noindex, nofollow` solo en `/gracias/` y en la página 404.
- Excluir `/gracias/` y `/404` del sitemap en `astro.config.mjs`.
- No crear rutas en inglés, con guiones bajos ni con mayúsculas.

### Contenido del blog

Frontmatter obligatorio:

```yaml
title: string        # 10–90 caracteres
description: string  # 70–180 caracteres
date: Date
category: "Automatización" | "IA aplicada" | "Integraciones"
image: ImageMetadata
imageAlt: string
keyword: string
```

Campos opcionales: `updatedDate`, `draft`.

Categorías válidas en `src/data/categories.ts`. Si añades una categoría, actualiza el tipo, el array y las rutas de categoría.

### Contenido de servicios

Frontmatter obligatorio: `title`, `shortTitle`, `description`, `summary`, `keyword`, `order`, `image`, `imageAlt`, `deliverables` (mínimo 3), `tools` (mínimo 3), `faq` (mínimo 3) y `draft`.

El slug sale del nombre del archivo. Usa kebab-case y sin guiones bajos.

## 5. Arquitectura y decisiones técnicas

- Astro con `output: 'static'`. No introduzcas SSR ni adaptadores de servidor sin una razón aprobada.
- Tailwind CSS 4 mediante `@tailwindcss/vite`. Los tokens están en `src/styles/global.css`.
- No añadas React, Vue ni Svelte salvo que sea imprescindible y esté justificado.
- Contenido con Content Collections y esquemas Zod en `src/content.config.ts`. No desactives las validaciones.
- Fuentes autoalojadas con Fontsource: Space Grotesk para títulos, Inter para cuerpo.
- Paleta:
  - Fondo: `#0B1A1F`
  - Superficie: `#12272E`
  - Primario: `#1E7F6B`
  - Acento/CTA: `#E8A33D`
  - Secundario: `#4FB3C8`
  - Texto: `#F4EEE3`
  - Texto atenuado: `#9FB3B5`
- El verde primario no se usa para texto normal sobre fondo oscuro (contraste insuficiente). El ámbar se usa para CTA y enlaces clave, con texto oscuro.
- Verifica contraste AA antes de añadir combinaciones nuevas. No uses texto atenuado con opacidades inferiores al 80 % sobre superficies.
- Respeta `prefers-reduced-motion`.

### Cal.com

- Una sola variable: `PUBLIC_CAL_URL`.
- Deriva `href`, `origin`, `path` y `script` desde `src/lib/cal.ts`.
- No escribas `cal.com` a mano en componentes, páginas ni textos.
- El embed debe seguir siendo diferido y tener fallback a enlace directo.
- La redirección posterior a la reserva se configura en Cal.com hacia `/gracias/`.
- `/gracias/` no se indexa.

### Formulario

- Endpoint: `PUBLIC_FORM_ENDPOINT`.
- Método: `POST` JSON.
- Campos: `name`, `email`, `company` (opcional), `message`, `privacy`, `source`, `page`, `sentAt`.
- Honeypot: `website`.
- El formulario no debe redirigir; muestra éxito o error en la misma página.
- No pongas secretos en variables `PUBLIC_*`.
- Si cambias el contrato del payload, actualiza `README.md`.

## 6. Flujo de trabajo obligatorio

Para cada cambio:

1. **Escribe** el cambio en el archivo correcto, respetando la estructura y el estilo existentes.
2. **Valida** con:

   ```bash
   npm run check && npm run build
   ```

3. **Revisa** el resultado: enlaces internos, metadatos, títulos, JSON-LD, sitemap y comportamiento responsive.
4. **Commit** con un mensaje descriptivo en español o inglés consistente:
   - `feat: añade página de casos`
   - `fix: corrige canonical del blog`
   - `content: publica artículo sobre integraciones`
5. **Push** al remoto configurado.

No hagas commit ni push si el build falla. No hagas push a producción sin que el propietario lo haya pedido y sin un remoto configurado. En este repositorio no hay remoto ni despliegue todavía: no los crees por iniciativa propia.

### Antes de cada commit

```bash
npm run check && npm run build
```

Comprueba además:

- Que no se haya añadido `.env` ni credenciales.
- Que `dist/` y `.astro/` sigan ignorados.
- Que los enlaces internos nuevos apunten a rutas existentes.
- Que las páginas nuevas tengan título, descripción y canonical.
- Que no se hayan inventado datos de empresa, clientes o resultados.

## 7. Archivos que no debes tocar sin permiso

- `src/data/site.ts`: email, redes y navegación. Cambiar el email afecta a todo el sitio.
- `src/pages/privacidad.astro` y `src/pages/terminos.astro`: textos legales. No inventes jurisdicciones, direcciones ni datos fiscales.
- `astro.config.mjs`: sitio, sitemap y esquema de entorno.
- `scripts/generate-assets.mjs` y `scripts/fonts/`: generación de marca y licencias.
- `public/_headers`: cabeceras de seguridad y caché.

## 8. Despliegue

- Cloudflare Pages, build `npm run build`, salida `dist/`.
- Variables: `PUBLIC_CAL_URL`, `PUBLIC_FORM_ENDPOINT`.
- Node: `22.23.4` (`.nvmrc`); añadir `NODE_VERSION=22.23.4` si Cloudflare no respeta el archivo.
- Cloudflare Web Analytics se activa desde el panel; no hay token en el código.
- No despliegues ni conectes el repositorio sin autorización explícita.

## 9. Checklist de calidad

- [ ] `npm run check` sin errores.
- [ ] `npm run build` sin errores.
- [ ] Una sola `h1` por página.
- [ ] Título y descripción únicos.
- [ ] Canonical correcta y absoluta.
- [ ] Open Graph con imagen y dimensiones.
- [ ] Enlaces internos sin 404.
- [ ] Imágenes con `alt`.
- [ ] Formulario con etiquetas y errores accesibles.
- [ ] Embed de Cal.com con fallback.
- [ ] Contraste AA.
- [ ] Sin datos inventados.
- [ ] Sin secretos en el repositorio.
