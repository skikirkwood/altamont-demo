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
import {
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
import { isResolvedEntry, serializeSafe } from "@/lib/helpers";

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
          <p className="text-gray-600">This post could not be found.</p>
        </section>
      </Layout>
    );
  }

  const fields = post.fields as BlogPostFields;
  const inspector = useContentfulInspectorMode({ entryId: post.sys.id });
  const author = fields.author as AuthorEntry | undefined;
  const seo: SeoMetadataEntry | undefined =
    fields.seoMetadata && isResolvedEntry(fields.seoMetadata)
      ? fields.seoMetadata
      : undefined;

  return (
    <Layout navigation={navigation} seo={seo} title={fields.title}>
      <article>
        <header className="border-b border-gray-100 bg-gray-50 py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h1
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
              {...inspector({ fieldId: "title" })}
            >
              {fields.title}
            </h1>
            {author && isResolvedEntry(author) && (
              <p className="mt-4 text-sm font-medium text-gray-600">
                {(author.fields as { name?: string }).name}
              </p>
            )}
          </div>
        </header>

        {fields.featuredImage && isResolvedEntry(fields.featuredImage) && (
          <div
            className="relative mx-auto aspect-[21/9] max-w-7xl bg-gray-100"
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
            className="prose prose-lg max-w-none text-gray-700"
            {...inspector({ fieldId: "body" })}
          >
            {fields.body && documentToReactComponents(fields.body)}
          </div>

          {author && isResolvedEntry(author) && (
            <aside className="mt-14 rounded-xl border border-gray-200 bg-gray-50 p-6 lg:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {(() => {
                  const img = (author.fields as AuthorFields).image;
                  if (img && isResolvedEntry(img)) {
                    return (
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200">
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
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {(author.fields as AuthorFields).name}
                  </p>
                  <div className="prose prose-sm mt-3 max-w-none text-gray-600">
                    {documentToReactComponents((author.fields as AuthorFields).body)}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </article>
    </Layout>
  );
}
