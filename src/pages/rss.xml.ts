import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { site } from '../data/site';
import { getPublishedPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: `Blog de ${site.name}`,
    description:
      'Artículos sobre automatización de procesos, IA aplicada e integraciones entre herramientas.',
    site: context.site ?? site.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.description,
      link: `/blog/${post.id}/`,
      categories: [post.data.category],
      author: `${site.email} (${site.founder})`,
    })),
    customData: '<language>es</language>',
  });
}
