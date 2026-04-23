import { useContentfulLiveUpdates, useContentfulInspectorMode } from "@contentful/live-preview/react";
import ContentfulImage from "@/components/ui/ContentfulImage";
import Cta from "@/components/ui/Cta";
import { isResolvedEntry } from "@/lib/helpers";
import type {
  CardRowEntry,
  FeatureCardEntry,
  CtaEntry,
  ImageWrapperEntry,
} from "@/lib/types";

interface Props {
  entry: CardRowEntry;
}

function FeatureCard({ entry: initial }: { entry: FeatureCardEntry }) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  if (!isResolvedEntry(entry)) return null;

  const fields = entry.fields as {
    eyebrow?: string;
    headline?: string;
    description?: string;
    image?: ImageWrapperEntry;
    callToAction?: CtaEntry;
    style?: string;
  };

  const isDark = fields.style === "dark" || fields.style === "highlight";

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-xl ring-1 ring-white/10 transition-shadow hover:shadow-xl hover:shadow-black/40 ${
        fields.style === "highlight"
          ? "bg-blue-600 text-white"
          : "bg-zinc-900 text-white"
      }`}
    >
      {fields.image && isResolvedEntry(fields.image) && (
        <div className="relative aspect-video overflow-hidden" {...inspectorProps({ fieldId: "image" })}>
          <ContentfulImage
            entry={fields.image}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        {fields.eyebrow && (
          <span
            className={`mb-2 text-xs font-semibold uppercase tracking-wider ${
              isDark ? "text-blue-400" : "text-blue-400"
            }`}
            {...inspectorProps({ fieldId: "eyebrow" })}
          >
            {fields.eyebrow}
          </span>
        )}
        <h3 className="text-lg font-bold text-white" {...inspectorProps({ fieldId: "headline" })}>
          {fields.headline}
        </h3>
        {fields.description && (
          <p
            className="mt-2 flex-1 text-sm leading-relaxed text-gray-400"
            {...inspectorProps({ fieldId: "description" })}
          >
            {fields.description}
          </p>
        )}
        {fields.callToAction && isResolvedEntry(fields.callToAction) && (
          <div className="mt-4">
            <Cta entry={fields.callToAction} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CardRow({ entry: initial }: Props) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  const fields = entry.fields as {
    headline?: string;
    description?: string;
    cards?: FeatureCardEntry[];
    style?: string;
  };

  const cards = (fields.cards ?? []).filter(isResolvedEntry);
  if (cards.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(fields.headline || fields.description) && (
          <div className="mb-12 text-center">
            {fields.headline && (
              <h2
                className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
                {...inspectorProps({ fieldId: "headline" })}
              >
                {fields.headline}
              </h2>
            )}
            {fields.description && (
              <p
                className="mx-auto mt-4 max-w-2xl text-lg text-gray-400"
                {...inspectorProps({ fieldId: "description" })}
              >
                {fields.description}
              </p>
            )}
          </div>
        )}
        <div
          className={`grid gap-8 ${
            cards.length === 1
              ? "grid-cols-1 max-w-lg mx-auto"
              : cards.length === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
          {...inspectorProps({ fieldId: "cards" })}
        >
          {cards.map((card) => (
            <FeatureCard key={card.sys.id} entry={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
