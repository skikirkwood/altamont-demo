import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { useContentfulLiveUpdates } from "@contentful/live-preview/react";
import { getPageBySlug, getNavigationMenu } from "@/lib/contentful";
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

export const getStaticProps: GetStaticProps<Props> = async ({ preview = false, locale }) => {
  const { getAllExperiences, getAllAudiences } = await import("@/lib/ninetailed");
  const [page, navigation, allExperiences, audienceData] = await Promise.all([
    getPageBySlug("home", preview, locale),
    getNavigationMenu("Main Navigation", preview, locale),
    getAllExperiences(preview),
    getAllAudiences(preview),
  ]);

  return {
    props: {
      page: serializeSafe((page as unknown as PageEntry) ?? null),
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

export default function HomePage({
  page: initialPage,
  navigation,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const page = useContentfulLiveUpdates(initialPage);

  if (!page || !isResolvedEntry(page)) {
    return (
      <Layout navigation={navigation} title="Lucid Motors">
        <section className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">Welcome to Lucid Motors</h1>
            <p className="mt-4 text-lg text-gray-600">
              Content is loading. Create a page with slug &quot;home&quot; in Contentful to get started.
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
