import { useContentfulLiveUpdates, useContentfulInspectorMode } from "@contentful/live-preview/react";
import Cta from "@/components/ui/Cta";
import ContentfulImage from "@/components/ui/ContentfulImage";
import { isResolvedEntry } from "@/lib/helpers";
import type {
  PlanComparisonEntry,
  ServicePlanEntry,
  CtaEntry,
  ImageWrapperEntry,
} from "@/lib/types";

interface Props {
  entry: PlanComparisonEntry;
}

function PlanCard({
  entry: initial,
  featured,
}: {
  entry: ServicePlanEntry;
  featured: boolean;
}) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  if (!isResolvedEntry(entry)) return null;

  const fields = entry.fields as {
    name?: string;
    monthlyPrice?: string;
    annualPrice?: string;
    description?: string;
    features?: string[];
    icon?: ImageWrapperEntry;
    badge?: string;
    callToAction?: CtaEntry;
    legalDisclaimer?: string;
  };

  return (
    <div
      className={`relative flex flex-col rounded-2xl p-8 ${
        featured
          ? "border-2 border-blue-500 bg-zinc-900 shadow-xl shadow-blue-500/10"
          : "border border-white/10 bg-zinc-900"
      }`}
    >
      {fields.badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
          {fields.badge}
        </span>
      )}
      <div className="mb-6">
        {fields.icon && isResolvedEntry(fields.icon) && (
          <div className="mb-4">
            <ContentfulImage entry={fields.icon} width={48} height={48} />
          </div>
        )}
        <h3 className="text-xl font-bold text-white" {...inspectorProps({ fieldId: "name" })}>
          {fields.name}
        </h3>
        {fields.description && (
          <p className="mt-2 text-sm text-gray-400" {...inspectorProps({ fieldId: "description" })}>
            {fields.description}
          </p>
        )}
      </div>

      {fields.monthlyPrice && (
        <div className="mb-6" {...inspectorProps({ fieldId: "monthlyPrice" })}>
          <span className="text-4xl font-bold text-white">
            {fields.monthlyPrice}
          </span>
          <span className="text-sm text-gray-500">/mo</span>
          {fields.annualPrice && (
            <p className="mt-1 text-xs text-gray-500">
              or {fields.annualPrice}/yr
            </p>
          )}
        </div>
      )}

      {fields.features && fields.features.length > 0 && (
        <ul className="mb-8 flex-1 space-y-3" {...inspectorProps({ fieldId: "features" })}>
          {fields.features.map((feature, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <svg
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      )}

      {fields.callToAction && isResolvedEntry(fields.callToAction) && (
        <Cta entry={fields.callToAction} className="w-full justify-center" />
      )}

      {fields.legalDisclaimer && (
        <p className="mt-4 text-xs text-gray-500">{fields.legalDisclaimer}</p>
      )}
    </div>
  );
}

export default function PlanComparison({ entry: initial }: Props) {
  const entry = useContentfulLiveUpdates(initial);
  const inspectorProps = useContentfulInspectorMode({ entryId: entry.sys.id });

  const fields = entry.fields as {
    headline?: string;
    description?: string;
    plans?: ServicePlanEntry[];
    featuredPlan?: ServicePlanEntry;
    callToAction?: CtaEntry;
  };

  const plans = (fields.plans ?? []).filter(isResolvedEntry);
  if (plans.length === 0) return null;

  const featuredId =
    fields.featuredPlan && isResolvedEntry(fields.featuredPlan)
      ? fields.featuredPlan.sys.id
      : null;

  return (
    <section className="bg-zinc-950 py-16 lg:py-24">
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
            plans.length <= 2
              ? "grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
              : plans.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          }`}
          {...inspectorProps({ fieldId: "plans" })}
        >
          {plans.map((plan) => (
            <PlanCard
              key={plan.sys.id}
              entry={plan}
              featured={plan.sys.id === featuredId}
            />
          ))}
        </div>

        {fields.callToAction && isResolvedEntry(fields.callToAction) && (
          <div className="mt-12 text-center">
            <Cta entry={fields.callToAction} />
          </div>
        )}
      </div>
    </section>
  );
}
