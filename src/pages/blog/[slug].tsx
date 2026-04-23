import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { Experience } from "@ninetailed/experience.js-next";
import { ExperienceMapper } from "@ninetailed/experience.js-utils-contentful";
import {
  getAllBlogPosts,
  getAllBlogPostSlugs,
  getBlogPostBySlug,
  getNavigationMenu,
} from "@/lib/contentful";
import Layout from "@/components/Layout";
import ContentfulImage from "@/components/ui/ContentfulImage";
import type {
  AuthorEntry,
  AuthorFields,
  BlogPostEntry,
  BlogPostFields,
  NavigationMenuEntry,
  SeoMetadataEntry,
} from "@/lib/types";
import { isResolvedEntry, serializeSafe, normalizeNtExperienceEntry } from "@/lib/helpers";

function parseExperiences(post: BlogPostEntry) {
  const experiences = (post.fields as any).nt_experiences;
  if (!Array.isArray(experiences) || experiences.length === 0) return [];
  return experiences
    .map(normalizeNtExperienceEntry)
    .filter((exp: any) => ExperienceMapper.isExperienceEntry(exp))
    .map((exp: any) => ExperienceMapper.mapExperience(exp));
}

function BlogPostContent(entry: BlogPostEntry) {
  const fields = entry.fields as BlogPostFields;
  const inspector = useContentfulInspectorMode({ entryId: entry.sys.id });
  const author = fields.author as AuthorEntry | undefined;

  return (
    <article>
      <header className="border-b border-white/10 bg-zinc-950 py-12 lg:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
            {...inspector({ fieldId: "title" })}
          >
            {fields.title}
          </h1>
          {author && isResolvedEntry(author) && (
            <p className="mt-4 text-sm font-medium text-gray-400">
              {(author.fields as { name?: string }).name}
            </p>
          )}
        </div>
      </header>

      {fields.featuredImage && isResolvedEntry(fields.featuredImage) && (
        <div
          className="relative mx-auto aspect-[21/9] max-w-7xl bg-zinc-900"
          {...inspector({ fieldId: "featuredImage" })}
        >
          <ContentfulImage
            entry={fields.featuredImage}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div
          className="prose prose-lg max-w-none text-gray-300"
          {...inspector({ fieldId: "body" })}
        >
          {fields.body && documentToReactComponents(fields.body)}
        </div>

        {author && isResolvedEntry(author) && (
          <aside className="mt-14 rounded-xl border border-white/10 bg-zinc-900 p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              {(() => {
                const img = (author.fields as AuthorFields).image;
                if (img && isResolvedEntry(img)) {
                  return (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-zinc-800 ring-1 ring-white/10">
                      <ContentfulImage entry={img} fill className="object-cover" sizes="80px" />
                    </div>
                  );
                }
                return null;
              })()}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                  About the author
                </p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {(author.fields as AuthorFields).name}
                </p>
                <div className="prose prose-sm mt-3 max-w-none text-gray-400">
                  {documentToReactComponents((author.fields as AuthorFields).body)}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </article>
  );
}

interface Props {
  post: BlogPostEntry | null;
  navigation: NavigationMenuEntry | null;
  ninetailed?: {
    preview: {
      allExperiences: unknown[];
      allAudiences: unknown[];
      audienceEntryIdMap: Record<string, string>;
    };
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllBlogPostSlugs();
  return {
    paths: slugs.map((slug) => ({ params: { slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props, { slug: string }> = async ({
  params,
  preview = false,
  locale,
}) => {
  const slug = params?.slug;
  if (!slug) return { notFound: true };

  const { getAllExperiences, getAllAudiences } = await import("@/lib/ninetailed");
  const [post, navigation, allExperiences, audienceData] = await Promise.all([
    getBlogPostBySlug(slug, preview, locale),
    getNavigationMenu("Main Navigation", preview, locale),
    getAllExperiences(preview),
    getAllAudiences(preview),
  ]);

  if (!post) return { notFound: true };

  // If this post has no nt_experiences it may be a Ninetailed variant entry.
  // Find the baseline post whose experience's nt_variants references it and
  // redirect there, so the <Experience> component (which only lives on the
  // baseline URL) can evaluate audience membership.
  const postExperiences = (post.fields as any).nt_experiences;
  if (!postExperiences || (Array.isArray(postExperiences) && postExperiences.length === 0)) {
    const allPosts = await getAllBlogPosts(preview, locale, false);
    let baselineSlug: string | null = null;
    outer: for (const candidate of allPosts) {
      if (candidate.sys.id === post.sys.id) continue;
      const exps = (candidate.fields as any).nt_experiences;
      if (!Array.isArray(exps) || exps.length === 0) continue;
      for (const exp of exps) {
        const variants: any[] = (exp as any)?.fields?.nt_variants;
        if (!Array.isArray(variants)) continue;
        if (variants.some((v) => v?.sys?.id === post.sys.id)) {
          baselineSlug = (candidate.fields as any).slug ?? null;
          break outer;
        }
      }
    }
    if (baselineSlug) {
      return { redirect: { destination: `/blog/${baselineSlug}`, permanent: false } };
    }
  }

  return {
    props: {
      post: serializeSafe(post as unknown as BlogPostEntry),
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

export default function BlogPostPage({
  post: initialPost,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const post = useContentfulLiveUpdates(initialPost);

  if (!post || !isResolvedEntry(post)) {
    return (
      <Layout navigation={navigation} title="Not Found">
        <section className="flex min-h-[40vh] items-center justify-center px-4">
          <p className="text-gray-400">This post could not be found.</p>
        </section>
      </Layout>
    );
  }

  const fields = post.fields as BlogPostFields;
  const seo: SeoMetadataEntry | undefined =
    fields.seoMetadata && isResolvedEntry(fields.seoMetadata)
      ? fields.seoMetadata
      : undefined;

  return (
    <Layout navigation={navigation} seo={seo} title={fields.title}>
      <Experience
        {...(post as any)}
        id={post.sys.id}
        component={BlogPostContent}
        experiences={parseExperiences(post)}
      />
    </Layout>
  );
}
