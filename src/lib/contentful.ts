import { createClient, type ContentfulClientApi } from "contentful";

function getClient(preview = false): ContentfulClientApi<undefined> {
  return createClient({
    space: process.env.CONTENTFUL_SPACE_ID!,
    accessToken: preview
      ? process.env.CONTENTFUL_PREVIEW_TOKEN!
      : process.env.CONTENTFUL_ACCESS_TOKEN!,
    host: preview ? "preview.contentful.com" : "cdn.contentful.com",
    environment: process.env.CONTENTFUL_ENVIRONMENT ?? "master",
  });
}

export const client = getClient(false);
export const previewClient = getClient(true);

const DEFAULT_LOCALE = process.env.CONTENTFUL_LOCALE ?? "en-US";

export async function getPageBySlug(slug: string, preview = false, locale = DEFAULT_LOCALE) {
  const api = preview ? previewClient : client;
  const entries = await api.getEntries({
    content_type: "page",
    "fields.slug": slug,
    include: 10,
    limit: 1,
    locale,
  });
  return entries.items[0] ?? null;
}

export async function getAllPageSlugs() {
  const entries = await client.getEntries({
    content_type: "page",
    select: ["fields.slug"],
    locale: DEFAULT_LOCALE,
    limit: 200,
  });
  return entries.items.map((item) => (item.fields as { slug: string }).slug);
}

export async function getNavigationMenu(name: string, preview = false, locale = DEFAULT_LOCALE) {
  const api = preview ? previewClient : client;
  const entries = await api.getEntries({
    content_type: "navigationMenu",
    "fields.name": name,
    include: 3,
    limit: 1,
    locale,
  });
  return entries.items[0] ?? null;
}

export async function getAllBlogPosts(preview = false, locale = DEFAULT_LOCALE) {
  const api = preview ? previewClient : client;
  const entries = await api.getEntries({
    content_type: "blogPost",
    include: 4,
    order: ["-sys.updatedAt"],
    locale,
    limit: 100,
  });
  return entries.items;
}

export async function getBlogPostBySlug(slug: string, preview = false, locale = DEFAULT_LOCALE) {
  const api = preview ? previewClient : client;
  const entries = await api.getEntries({
    content_type: "blogPost",
    "fields.slug": slug,
    include: 4,
    limit: 1,
    locale,
  });
  return entries.items[0] ?? null;
}

export async function getAllBlogPostSlugs() {
  const entries = await client.getEntries({
    content_type: "blogPost",
    select: ["fields.slug"],
    locale: DEFAULT_LOCALE,
    limit: 100,
  });
  return entries.items.map((item) => (item.fields as { slug: string }).slug);
}
