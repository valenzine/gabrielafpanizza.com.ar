import type { CollectionEntry } from 'astro:content';

export type Book = CollectionEntry<'books'>['data'] & { slug: string };

export function toBook(entry: CollectionEntry<'books'>): Book {
  return { ...entry.data, slug: entry.id };
}
