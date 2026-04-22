import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { getPageBySlug, getAllPageSlugs, getNavigationMenu } from "@/lib/contentful";
import Layout from "@/components/Layout";
import SectionRenderer from "@/components/SectionRenderer";
import type {
  PageEntry,
  NavigationMenuEntry,
  SectionEntry,
  SeoMetadataEntry,
} from "@/lib/types";
import { isResolvedEntry, serializeSafe } from "@/lib/helpers";

interface Props {
  page: PageEntry | null;
  navigation: NavigationMenuEntry | null;
  ninetailed?: {
    preview: {
      allExperiences: any[];
      allAudiences: any[];
      audienceEntryIdMap: Record<string, string>;
    };
  };
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs = await getAllPageSlugs();
  return {
    paths: slugs
      .filter((s) => s !== "home")
      .map((slug) => ({ params: { slug } })),
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
  const [page, navigation, allExperiences, audienceData] = await Promise.all([
    getPageBySlug(slug, preview, locale),
    getNavigationMenu("Main Navigation", preview, locale),
    getAllExperiences(preview),
    getAllAudiences(preview),
  ]);

  if (!page) return { notFound: true };

  return {
    props: {
      page: serializeSafe(page as unknown as PageEntry),
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

export default function DynamicPage({
  page: initialPage,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const page = useContentfulLiveUpdates(initialPage);

  if (!page || !isResolvedEntry(page)) {
    return (
      <Layout navigation={navigation} title="Page Not Found">
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Page Not Found</h1>
            <p className="mt-4 text-lg text-gray-600">
              This page doesn&apos;t exist yet.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  const fields = page.fields as {
    title?: string;
    seoMetadata?: SeoMetadataEntry;
    sections?: SectionEntry[];
  };

  return (
    <Layout
      navigation={navigation}
      seo={fields.seoMetadata}
      title={fields.title}
    >
      <SectionRenderer sections={fields.sections ?? []} />
    </Layout>
  );
}
