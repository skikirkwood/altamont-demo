import "@/styles/globals.css";
import type { AppProps as NextAppProps } from "next/app";
import { useRouter } from "next/router";
import { Inter } from "next/font/google";
import {
  NinetailedProvider,
  type ExperienceConfiguration,
} from "@ninetailed/experience.js-next";
import { NinetailedPreviewPlugin } from "@ninetailed/experience.js-plugin-preview";
import { NinetailedInsightsPlugin } from "@ninetailed/experience.js-plugin-insights";
import { ContentfulLivePreviewProvider } from "@contentful/live-preview/react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

type Audience = {
  name: string;
  description?: string;
  id: string;
};

interface CustomPageProps {
  ninetailed?: {
    preview: {
      allExperiences: ExperienceConfiguration[];
      allAudiences: Audience[];
      audienceEntryIdMap: Record<string, string>;
    };
  };
  [key: string]: any;
}

type AppProps<P = unknown> = {
  pageProps: P;
} & Omit<NextAppProps<P>, "pageProps">;

export default function App({ Component, pageProps }: AppProps<CustomPageProps>) {
  const router = useRouter();
  const locale = router.locale ?? "en-US";
  const audienceEntryIdMap =
    pageProps.ninetailed?.preview?.audienceEntryIdMap || {};

  return (
    <NinetailedProvider
      plugins={[
        new NinetailedInsightsPlugin(),
        ...(pageProps.ninetailed?.preview
          ? [
              new NinetailedPreviewPlugin({
                experiences:
                  pageProps.ninetailed?.preview.allExperiences || [],
                audiences: pageProps.ninetailed?.preview.allAudiences || [],
                onOpenExperienceEditor: (experience) => {
                  if (process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID) {
                    window.open(
                      `https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"}/entries/${experience.id}`,
                      "_blank"
                    );
                  }
                },
                onOpenAudienceEditor: (audience) => {
                  if (process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID) {
                    const entryId =
                      audienceEntryIdMap[audience.id] || audience.id;
                    window.open(
                      `https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/environments/${process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || "master"}/entries/${entryId}`,
                      "_blank"
                    );
                  }
                },
              }),
            ]
          : []),
      ]}
      clientId={process.env.NEXT_PUBLIC_NINETAILED_API_KEY ?? ""}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT ?? "main"}
      componentViewTrackingThreshold={0}
    >
      <ContentfulLivePreviewProvider locale={locale}>
        <div className={inter.variable}>
          <Component {...pageProps} />
        </div>
      </ContentfulLivePreviewProvider>
    </NinetailedProvider>
  );
}
