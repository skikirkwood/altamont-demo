import { useState } from "react";
import { useContentfulLiveUpdates, useContentfulInspectorMode } from "@contentful/live-preview/react";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { isResolvedEntry } from "@/lib/helpers";
import type { FaqSectionEntry, FaqItemEntry } from "@/lib/types";
import type { Document } from "@contentful/rich-text-types";

interface Props {
  entry: FaqSectionEntry;
}

function FaqItem({ item: initial }: { item: FaqItemEntry }) {
  const [open, setOpen] = useState(false);
  const item = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: item.sys.id });

  if (!isResolvedEntry(item)) return null;

  const fields = item.fields as {
    question?: string;
    answer?: Document;
  };

  return (
    <div className="border-b border-white/10">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span
          className="text-base font-medium text-white"
          {...inspectorProps({ fieldId: "question" })}
        >
          {fields.question}
        </span>
        <svg
          className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && fields.answer && (
        <div
          className="pb-5 text-sm leading-relaxed text-gray-400 prose prose-sm max-w-none"
          {...inspectorProps({ fieldId: "answer" })}
        >
          {documentToReactComponents(fields.answer)}
        </div>
      )}
    </div>
  );
}

export default function FaqSection({ entry: initial }: Props) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  const fields = entry.fields as {
    headline?: string;
    items?: FaqItemEntry[];
  };

  const items = (fields.items ?? []).filter(isResolvedEntry);
  if (items.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {fields.headline && (
          <h2
            className="mb-8 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl"
            {...inspectorProps({ fieldId: "headline" })}
          >
            {fields.headline}
          </h2>
        )}
        <div className="divide-y divide-white/10 border-t border-white/10" {...inspectorProps({ fieldId: "items" })}>
          {items.map((item) => (
            <FaqItem key={item.sys.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
