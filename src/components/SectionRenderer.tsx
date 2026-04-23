import React from "react";
import { Experience } from "@ninetailed/experience.js-next";
import { ExperienceMapper } from "@ninetailed/experience.js-utils-contentful";
import { getContentTypeId, isResolvedEntry, normalizeNtExperienceEntry } from "@/lib/helpers";
import type { SectionEntry } from "@/lib/types";

import HeroBanner from "./sections/HeroBanner";
import PromoBanner from "./sections/PromoBanner";
import CardRow from "./sections/CardRow";
import PlanComparison from "./sections/PlanComparison";
import FaqSection from "./sections/FaqSection";
import TestimonialSection from "./sections/TestimonialSection";
import RichTextSection from "./sections/RichTextSection";
import VehicleShowcase from "./sections/VehicleShowcase";

const componentMap: Record<string, React.ComponentType<{ entry: any }>> = {
  heroBanner: HeroBanner,
  promoBanner: PromoBanner,
  cardRow: CardRow,
  planComparison: PlanComparison,
  faqSection: FaqSection,
  testimonialSection: TestimonialSection,
  richTextSection: RichTextSection,
  vehicleShowcase: VehicleShowcase,
};

const ComponentRenderer = (props: any) => {
  const contentTypeId = props.sys?.contentType?.sys?.id;
  const Component = componentMap[contentTypeId];
  if (!Component) return null;
  return <Component entry={props} />;
};

function parseExperiences(entry: any) {
  const experiences = entry?.fields?.nt_experiences;
  if (!Array.isArray(experiences) || experiences.length === 0) return [];

  return experiences
    .map(normalizeNtExperienceEntry)
    .filter((exp: any) => ExperienceMapper.isExperienceEntry(exp))
    .map((exp: any) => ExperienceMapper.mapExperience(exp));
}

interface Props {
  sections: SectionEntry[];
}

export default function SectionRenderer({ sections }: Props) {
  return (
    <>
      {sections.map((section) => {
        if (!isResolvedEntry(section)) return null;

        const contentTypeId = getContentTypeId(section);
        if (!componentMap[contentTypeId]) {
          if (process.env.NODE_ENV === "development") {
            return (
              <div
                key={section.sys.id}
                className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-400"
              >
                Unknown section type: <code>{contentTypeId}</code>
              </div>
            );
          }
          return null;
        }

        const parsedExperiences = parseExperiences(section);

        return (
          <Experience
            key={`${contentTypeId}-${section.sys.id}`}
            {...(section as any)}
            id={section.sys.id}
            component={ComponentRenderer}
            experiences={parsedExperiences}
          />
        );
      })}
    </>
  );
}
