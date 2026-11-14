import { site, socialLinks } from '../data/site';

export const organizationId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;

export function absoluteUrl(path: string): string {
  return new URL(path, site.url).href;
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: site.name,
    alternateName: site.shortName,
    url: site.url,
    description: site.description,
    email: site.email,
    logo: {
      '@type': 'ImageObject',
      url: absoluteUrl('/favicon-512.png'),
      width: 512,
      height: 512,
    },
    image: absoluteUrl('/og-image.png'),
    founder: {
      '@type': 'Person',
      name: site.founder,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: site.email,
      availableLanguage: ['es'],
    },
    areaServed: site.serviceArea,
    sameAs: socialLinks.map((social) => social.url),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: site.name,
    url: site.url,
    description: site.description,
    inLanguage: 'es',
    publisher: { '@id': organizationId },
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    serviceType: input.name,
    url: absoluteUrl(input.url),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    provider: { '@id': organizationId },
    areaServed: site.serviceArea,
    availableLanguage: 'es',
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: Date;
  dateModified?: Date;
  category: string;
  keyword: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.url),
    mainEntityOfPage: absoluteUrl(input.url),
    image: [absoluteUrl(input.image)],
    datePublished: input.datePublished.toISOString(),
    dateModified: (input.dateModified ?? input.datePublished).toISOString(),
    articleSection: input.category,
    keywords: [input.keyword],
    inLanguage: 'es',
    author: {
      '@type': 'Person',
      name: site.founder,
      url: absoluteUrl('/sobre-orinoco/'),
    },
    publisher: { '@id': organizationId },
  };
}
