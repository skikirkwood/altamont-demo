import Link from "next/link";
import { isResolvedEntry } from "@/lib/helpers";
import type { CtaEntry } from "@/lib/types";

interface Props {
  entry: CtaEntry | undefined | null;
  className?: string;
}

const styleMap: Record<string, string> = {
  primary:
    "inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors",
  secondary:
    "inline-flex items-center justify-center rounded-full border-2 border-blue-500 bg-transparent px-6 py-3 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 transition-colors",
  link: "inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors group",
};

export default function Cta({ entry, className }: Props) {
  if (!entry || !isResolvedEntry(entry)) return null;

  const fields = entry.fields as {
    label?: string;
    url?: string;
    openInNewTab?: boolean;
    style?: string;
  };

  const label = fields.label;
  const url = fields.url;
  if (!label || !url) return null;

  const style = fields.style ?? "primary";
  const classes = `${styleMap[style] ?? styleMap.primary} ${className ?? ""}`;
  const external = fields.openInNewTab;

  if (external || url.startsWith("http")) {
    return (
      <a
        href={url}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={classes}
      >
        {label}
        {style === "link" && (
          <span className="ml-1 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        )}
      </a>
    );
  }

  return (
    <Link href={url} className={classes}>
      {label}
      {style === "link" && (
        <span className="ml-1 transition-transform group-hover:translate-x-0.5">
          →
        </span>
      )}
    </Link>
  );
}
