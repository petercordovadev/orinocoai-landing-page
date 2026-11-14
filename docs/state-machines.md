# Máquinas de estado del sitio

Este documento describe los estados explícitos de las partes interactivas y de construcción del sitio. La regla general es: **si algo cambia con el tiempo o con la interacción, debe tener un estado con nombre y una transición definida**.

No se usa una librería de máquinas de estado. Las dos máquinas con JavaScript viven en módulos puros de TypeScript y el componente solo se encarga del DOM y de la red. Las partes que el navegador ya resuelve bien (`<details>`) se quedan en HTML nativo.

## Contrato DOM

| Atributo | Uso |
| --- | --- |
| `data-machine="..."` | Identifica la máquina en el DOM. |
| `data-state="..."` | Estado actual. Es la fuente de verdad observable para personas, pruebas y agentes. |
| `aria-busy="true"` | Solo mientras se espera una operación asíncrona. |
| `role="status"` + `aria-live="polite"` | Cambios informativos. |
| `role="alert"` + `aria-live="assertive"` | Errores. |

## Formulario de contacto

- Componente: `src/components/ContactForm.astro`
- Máquina: `src/lib/contact-form-machine.ts`
- Raíz: `<form data-machine="contact-form">`

### Estados

| Estado | Significado |
| --- | --- |
| `idle` | Formulario listo. |
| `invalid` | La validación falló y hay errores visibles. |
| `submitting` | La petición está en curso. El botón está deshabilitado y el formulario tiene `aria-busy`. |
| `success` | El mensaje se recibió (o el honeypot se activó). |
| `error` | La petición falló. Los valores se conservan y se muestra el correo directo. |
| `unconfigured` | No hay endpoint configurado. Se muestra el correo directo. |

### Transiciones

| Desde | Evento | Hacia | Efecto |
| --- | --- | --- | --- |
| `idle`, `invalid`, `success`, `error`, `unconfigured` | `INVALID` | `invalid` | Muestra errores y enfoca el primer campo inválido. |
| `idle`, `invalid`, `success`, `error`, `unconfigured` | `ENDPOINT_MISSING` | `unconfigured` | Muestra error y enlace de correo. |
| `idle`, `invalid`, `success`, `error`, `unconfigured` | `SEND` | `submitting` | Deshabilita el botón, marca `aria-busy` y cambia la etiqueta a “Enviando…”. |
| `submitting` | `SUCCESS` | `success` | Limpia campos y errores, y muestra la confirmación. |
| `submitting` | `FAILURE` | `error` | Conserva los valores y muestra el error y el correo directo. |
| `invalid` | `FIELD_FIXED` | `idle` | Solo cuando ya no queda ningún campo con `aria-invalid`. |
| `idle`, `invalid`, `success`, `error`, `unconfigured` | `SPAM` | `success` | Honeypot: limpia el formulario y simula éxito. |
| Cualquiera | `RESET` | `idle` | Vuelve al estado inicial. |

### Invariantes

- El payload y el honeypot (`website`) no cambian.
- El formulario no redirige: el éxito y el error se muestran en la misma página.
- Un segundo `submit` mientras el estado es `submitting` se ignora.
- Los errores de campo se limpian al escribir o cambiar el campo.
- `aria-busy` solo existe en `submitting`.

## Cal.com

- Componente: `src/components/CalEmbed.astro`
- Máquina: `src/lib/cal-embed-machine.ts`
- Raíz: `<div data-machine="cal-embed">`

### Estados

| Estado | Significado |
| --- | --- |
| `facade` | Tarjeta inicial con el botón “Ver disponibilidad” y el enlace directo. |
| `loading` | Script y iframe en proceso. `aria-busy` está activo. |
| `ready` | El iframe existe y tiene título accesible. |
| `error` | Pasaron 15 segundos sin iframe, o falló la inicialización. |
| `unavailable` | Falta configuración de Cal.com. Se muestra el enlace directo. |

### Transiciones

| Desde | Evento | Hacia | Efecto |
| --- | --- | --- | --- |
| `facade` | `LOAD` | `loading` | Oculta la tarjeta, muestra el objetivo y el indicador de carga. |
| `facade` | `CONFIG_MISSING` | `unavailable` | Muestra el error y el enlace directo. |
| `loading` | `IFRAME_READY` | `ready` | Oculta la carga, quita `aria-busy` y titula el iframe. |
| `loading` | `TIMEOUT` | `error` | Muestra el error y el enlace directo. |

`error` y `unavailable` son terminales a propósito: la recuperación fiable es el enlace directo al calendario, no reinicializar el iframe.

### Invariantes

- Toda la configuración sale de `PUBLIC_CAL_URL` a través de `src/lib/cal.ts`.
- No hay `cal.com` escrito a mano en componentes ni textos.
- El embed es diferido y siempre tiene fallback a enlace directo.
- En `/contacto/` se carga automáticamente al acercarse a la sección (`autoLoad` por defecto). El botón sigue disponible.
- La copia de la página debe describir el comportamiento real: carga al acercarse o al pulsar el botón.

## Menú móvil

- Componente: `src/components/Header.astro`
- Raíz: `<details data-machine="mobile-menu">`

| Estado | Significado |
| --- | --- |
| `closed` | Menú cerrado. |
| `open` | Menú abierto. |

El estado real es el atributo nativo `open` de `<details>`; `data-state` solo lo refleja. El nombre accesible cambia con dos textos `sr-only` y `group-open`, así que funciona incluso sin JavaScript. Un script pequeño añade:

- Cierre con `Escape` y foco de vuelta en `summary`.
- Cierre al pulsar fuera del menú.
- Cierre al cambiar a escritorio (`min-width: 1024px`).
- Cierre al pulsar un enlace interno.

## Preguntas frecuentes

- Componente: `src/components/Faq.astro`
- Raíz: `<div data-machine="faq">`

Cada `<details>` es una máquina nativa de dos estados (`abierto`/`cerrado`). No hay JavaScript. Se permite más de una respuesta abierta a propósito para que el lector pueda comparar. El primer elemento se abre por defecto.

## Navegación

`Header.astro` deriva el estado activo de `Astro.url.pathname` y lo expone con `aria-current="page"`. No es una máquina: no tiene transiciones en el cliente.

## Flujo de conversión

Hay dos caminos y no comparten estado en el cliente:

- Formulario: el éxito se muestra en `/contacto/`; no redirige, por requisito del proyecto.
- Cal.com: la redirección posterior a la reserva se configura en Cal.com hacia `/gracias/`, que es `noindex, nofollow`.

No unificar ambos caminos sin revisar el contrato del formulario y la configuración de Cal.com.

## Contenido y build

- `draft: true` excluye el contenido de rutas, RSS, sitemap, relacionados y categorías.
- `date` es metadato de visualización y orden; no programa publicaciones. Para programar, haría falta un build o un deploy hook.
- `order` en servicios debe ser único; `getServices()` falla el build si hay duplicados.
- Una categoría sin artículos publicados muestra su estado vacío.

## Configuración

- `PUBLIC_CAL_URL` es obligatoria y `src/lib/cal.ts` falla en el build si falta o es inválida.
- `PUBLIC_FORM_ENDPOINT` es obligatoria para `astro:env`. El estado `unconfigured` es una defensa para valores vacíos o inválidos; no sustituye la validación del build.
