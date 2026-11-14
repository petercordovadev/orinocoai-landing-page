export const categoryNames = ['Automatización', 'IA aplicada', 'Integraciones'] as const;

export type CategoryName = (typeof categoryNames)[number];

export interface Category {
  name: CategoryName;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  {
    name: 'Automatización',
    slug: 'automatizacion',
    description:
      'Procesos, flujos de trabajo y tareas repetitivas que pueden dejar de depender de la memoria y de las hojas de cálculo.',
  },
  {
    name: 'IA aplicada',
    slug: 'ia-aplicada',
    description:
      'Agentes, asistentes y automatizaciones con IA que resuelven problemas concretos del negocio, con límites y supervisión humana.',
  },
  {
    name: 'Integraciones',
    slug: 'integraciones',
    description:
      'Herramientas que se hablan entre sí para que los datos dejen de vivir en silos y la operación fluya sin copiar y pegar.',
  },
];

export function categorySlug(name: CategoryName): string {
  return categories.find((category) => category.name === name)?.slug ?? 'sin-categoria';
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
