import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    year: z.number(),
    publisher: z.string(),
    role: z.string(),
    description: z.string(),
    isbn: z.string().optional(),
    pages: z.number().optional(),
    cover: z.string().optional(),
    coverTone: z.enum(['moss', 'ochre', 'terracotta', 'blue', 'paper']),
    collaborators: z.array(z.string()).optional(),
    recognition: z.string().optional(),
    featured: z.boolean().default(false),
    externalUrl: z.url().optional(),
    order: z.number(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    displayDate: z.string().optional(),
    source: z.string().optional(),
    available: z.boolean().default(true),
    order: z.number(),
    project: z.boolean().default(false),
    projectOrder: z.number().optional(),
    projectLabel: z.string().optional(),
    projectSummary: z.string().optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
  }),
});

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: z.object({
    year: z.string(),
    title: z.string(),
    anchor: z.string().optional(),
    order: z.number(),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    lead: z.string().optional(),
    quote: z.string().optional(),
    quoteSource: z.string().optional(),
    recognition: z.string().optional(),
    recognitionLabel: z.string().optional(),
    recognitionDescription: z.string().optional(),
    episodesTitle: z.string().optional(),
    episodesDescription: z.string().optional(),
    archiveUrl: z.url().optional(),
  }),
});

export const collections = { books, articles, timeline, pages };
