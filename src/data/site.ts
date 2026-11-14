export const site = {
  name: 'Orinoco AI Solutions',
  shortName: 'Orinoco AI',
  url: 'https://orinocoaisolutions.com',
  description:
    'Automatización e IA aplicada a negocios. Diseñamos procesos, agentes e integraciones que reducen el trabajo manual y ordenan tu operación.',
  email: 'hola@orinocoaisolutions.com',
  founder: 'Peter Córdova',
  locale: 'es_ES',
  language: 'es',
  location: 'Ciudad Bolívar, Venezuela',
  serviceArea: ['Latinoamérica', 'España'],
  socials: [
    {
      name: 'Instagram',
      handle: '@petercordovadev',
      url: 'https://www.instagram.com/petercordovadev/',
    },
    {
      name: 'Threads',
      handle: '@petercordovadev',
      url: 'https://www.threads.net/@petercordovadev',
    },
    {
      name: 'X',
      handle: '@petercordovadev',
      url: 'https://x.com/petercordovadev',
    },
    {
      name: 'LinkedIn',
      handle: 'petercordovadev',
      url: 'https://www.linkedin.com/in/petercordovadev/',
    },
  ],
  // Cuando exista la página de empresa, añade aquí la URL y aparecerá en el footer y en sameAs.
  linkedinCompany: null as string | null,
  nav: [
    { label: 'Inicio', href: '/' },
    { label: 'Servicios', href: '/servicios/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'Sobre Orinoco', href: '/sobre-orinoco/' },
    { label: 'Contacto', href: '/contacto/' },
  ],
};

export const socialLinks = [
  ...site.socials,
  ...(site.linkedinCompany
    ? [{ name: 'LinkedIn empresa', handle: 'Orinoco AI Solutions', url: site.linkedinCompany }]
    : []),
];
