import { getCollection, type CollectionEntry } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;
export type Service = CollectionEntry<'servicios'>;

// `draft` is the only publish gate. `date` is display/order metadata, not scheduling.
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getServices(): Promise<Service[]> {
  const services = await getCollection('servicios', ({ data }) => !data.draft);

  const orders = new Map<number, string>();
  for (const service of services) {
    const existing = orders.get(service.data.order);
    if (existing) {
      throw new Error(
        `Orden de servicio duplicado (${service.data.order}): "${existing}" y "${service.id}". Cada servicio necesita un valor único en "order".`,
      );
    }
    orders.set(service.data.order, service.id);
  }

  return services.sort((a, b) => a.data.order - b.data.order);
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  const sameCategory = posts.filter(
    (item) => item.id !== post.id && item.data.category === post.data.category,
  );
  const others = posts.filter(
    (item) => item.id !== post.id && item.data.category !== post.data.category,
  );
  return [...sameCategory, ...others].slice(0, limit);
}
