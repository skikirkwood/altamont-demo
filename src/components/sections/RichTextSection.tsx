import { useContentfulLiveUpdates, useContentfulInspectorMode } from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import ContentfulImage from "@/components/ui/ContentfulImage";
import Cta from "@/components/ui/Cta";
import { isResolvedEntry } from "@/lib/helpers";
import type {
  RichTextSectionEntry,
  ImageWrapperEntry,
  CtaEntry,
} from "@/lib/types";
import type { Document } from "@contentful/rich-text-types";

interface Props {
  entry: RichTextSectionEntry;
}

export default function RichTextSection({ entry: initial }: Props) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  const fields = entry.fields as {
    headline?: string;
    body?: Document;
    image?: ImageWrapperEntry;
    callToAction?: CtaEntry;
    style?: string;
  };

  const style = fields.style ?? "default";
  const isSplitLeft = style === "split-image-left";
  const isSplitRight = style === "split-image-right";
  const isSplit = isSplitLeft || isSplitRight;

  const imageBlock = fields.image && isResolvedEntry(fields.image) ? (
    <div
      className="relative aspect-video overflow-hidden rounded-xl"
      {...inspectorProps({ fieldId: "image" })}
    >
      <ContentfulImage
        entry={fields.image}
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
    </div>
  ) : null;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={
            isSplit
              ? "grid items-center gap-12 lg:grid-cols-2"
              : style === "centered"
                ? "mx-auto max-w-3xl text-center"
                : "mx-auto max-w-3xl"
          }
        >
          {isSplitLeft && imageBlock}

          <div>
            {fields.headline && (
              <h2
                className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl"
                {...inspectorProps({ fieldId: "headline" })}
              >
                {fields.headline}
              </h2>
            )}
            {fields.body && (
              <div
                className="prose prose-lg max-w-none text-gray-300"
                {...inspectorProps({ fieldId: "body" })}
              >
                {documentToReactComponents(fields.body)}
              </div>
            )}
            {fields.callToAction && isResolvedEntry(fields.callToAction) && (
              <div className="mt-8">
                <Cta entry={fields.callToAction} />
              </div>
            )}
          </div>

          {isSplitRight && imageBlock}
        </div>
      </div>
    </section>
  );
}
