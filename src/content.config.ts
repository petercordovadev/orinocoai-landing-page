import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryNames } from './data/categories';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(10).max(90),
      description: z.string().min(70).max(180),
      date: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(categoryNames),
      image: image(),
      imageAlt: z.string().optional(),
      keyword: z.string().min(3),
      draft: z.boolean().default(false),
    }),
});

const servicios = defineCollection({
  loader: glob({ base: './src/content/servicios', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(10).max(90),
      shortTitle: z.string().min(5).max(40),
      description: z.string().min(70).max(180),
      summary: z.string().min(60).max(280),
      keyword: z.string().min(3),
      order: z.number().int().positive(),
      image: image(),
      imageAlt: z.string().min(10),
      deliverables: z.array(z.string().min(10)).min(3),
      tools: z.array(z.string().min(2)).min(3),
      faq: z
        .array(
          z.object({
            question: z.string().min(10),
            answer: z.string().min(30),
          }),
        )
        .min(3),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, servicios };
