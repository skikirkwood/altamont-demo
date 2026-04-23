import type { GetStaticProps, InferGetStaticPropsType } from "next";
import Link from "next/link";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { getAllBlogPosts, getNavigationMenu } from "@/lib/contentful";
import Layout from "@/components/Layout";
import ContentfulImage from "@/components/ui/ContentfulImage";
import type {
  BlogPostEntry,
  BlogPostFields,
  NavigationMenuEntry,
} from "@/lib/types";
import { isResolvedEntry, serializeSafe } from "@/lib/helpers";
import type { Document } from "@contentful/rich-text-types";

function plainTextFromRichText(doc: Document | undefined): string {
  if (!doc?.content) return "";
  function walk(nodes: readonly unknown[]): string {
    return nodes
      .map((node) => {
        const n = node as { nodeType?: string; value?: string; content?: unknown[] };
        if (n.nodeType === "text" && typeof n.value === "string") return n.value;
        if (Array.isArray(n.content)) return walk(n.content);
        return "";
      })
      .join("");
  }
  return walk(doc.content as unknown[]).replace(/\s+/g, " ").trim();
}

interface Props {
  posts: BlogPostEntry[];
  navigation: NavigationMenuEntry | null;
  ninetailed?: {
    preview: {
      allExperiences: unknown[];
      allAudiences: unknown[];
      audienceEntryIdMap: Record<string, string>;
    };
  };
}

export const getStaticProps: GetStaticProps<Props> = async ({ preview = false, locale }) => {
  const { getAllExperiences, getAllAudiences } = await import("@/lib/ninetailed");
  const [rawPosts, navigation, allExperiences, audienceData] = await Promise.all([
    getAllBlogPosts(preview, locale),
    getNavigationMenu("Main Navigation", preview, locale),
    getAllExperiences(preview),
    getAllAudiences(preview),
  ]);

  return {
    props: {
      posts: serializeSafe(rawPosts as unknown as BlogPostEntry[]),
      navigation: (navigation as unknown as NavigationMenuEntry) ?? null,
      ninetailed: {
        preview: {
          allExperiences,
          allAudiences: audienceData.mappedAudiences,
          audienceEntryIdMap: audienceData.audienceEntryIdMap,
        },
      },
    },
    revalidate: 5,
  };
};

function excerpt(body: Document | undefined, max = 160): string {
  const plain = plainTextFromRichText(body);
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max).trim()}…`;
}

export default function BlogIndex({
  posts: initialPosts,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const posts = useContentfulLiveUpdates(initialPosts);

  return (
    <Layout navigation={navigation} title="Blog">
      <section className="border-b border-white/10 bg-zinc-950 py-14 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">Blog</h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-400">
            Stories from Lucid — news, technology, and the road ahead.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {(posts ?? []).filter(isResolvedEntry).map((post) => {
            const fields = post.fields as BlogPostFields;
            const slug = fields.slug ?? "";
            const author =
              fields.author && isResolvedEntry(fields.author)
                ? (fields.author.fields as { name?: string }).name
                : undefined;

            return (
              <li key={post.sys.id}>
                <article className="flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-zinc-900 transition hover:border-white/20">
                  <Link href={`/blog/${slug}`} className="relative block aspect-[16/10] overflow-hidden bg-zinc-800">
                    {fields.featuredImage && isResolvedEntry(fields.featuredImage) && (
                      <ContentfulImage
                        entry={fields.featuredImage}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-xl font-semibold text-white">
                      <Link href={`/blog/${slug}`} className="hover:text-gray-300 transition-colors">
                        {fields.title}
                      </Link>
                    </h2>
                    {author && (
                      <p className="mt-2 text-sm font-medium text-gray-500">{author}</p>
                    )}
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">
                      {excerpt(fields.body)}
                    </p>
                    <Link
                      href={`/blog/${slug}`}
                      className="mt-4 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Read more
                    </Link>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>

        {(posts ?? []).filter(isResolvedEntry).length === 0 && (
          <p className="text-center text-gray-500">No posts yet. Add a Blog Post entry in Contentful.</p>
        )}
      </section>
    </Layout>
  );
}
