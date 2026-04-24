import Head from "next/head";
import Navigation from "./Navigation";
import Footer from "./Footer";
import type { NavigationMenuEntry, SeoMetadataEntry } from "@/lib/types";
import { isResolvedEntry } from "@/lib/helpers";

interface Props {
  children: React.ReactNode;
  navigation: NavigationMenuEntry | null;
  seo?: SeoMetadataEntry | null;
  title?: string;
}

export default function Layout({ children, navigation, seo, title }: Props) {
  const seoFields =
    seo && isResolvedEntry(seo)
      ? (seo.fields as {
          metaTitle?: string;
          metaDescription?: string;
          noIndex?: boolean;
        })
      : null;

  const pageTitle = seoFields?.metaTitle ?? title ?? "Altamont";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        {seoFields?.metaDescription && (
          <meta name="description" content={seoFields.metaDescription} />
        )}
        {seoFields?.noIndex && <meta name="robots" content="noindex" />}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="flex min-h-screen flex-col bg-black">
        <Navigation menu={navigation} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
