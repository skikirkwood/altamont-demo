import type { Asset, Entry } from "contentful";

export function isResolvedEntry(ref: unknown): ref is Entry {
  return (
    typeof ref === "object" &&
    ref !== null &&
    "sys" in ref &&
    (ref as Entry).sys?.type === "Entry" &&
    "fields" in ref
  );
}

export function isResolvedAsset(ref: unknown): ref is Asset {
  return (
    typeof ref === "object" &&
    ref !== null &&
    "sys" in ref &&
    (ref as Asset).sys?.type === "Asset" &&
    "fields" in ref
  );
}

export function getContentTypeId(entry: Entry): string {
  return entry.sys.contentType?.sys?.id ?? "";
}

export function imageUrl(asset: Asset, width?: number): string {
  const url = (asset.fields as { file?: { url?: string } })?.file?.url;
  if (!url) return "";
  const base = url.startsWith("//") ? `https:${url}` : url;
  return width ? `${base}?w=${width}&fm=webp&q=80` : `${base}?fm=webp&q=80`;
}

/**
 * Deep-clones a value while breaking only true circular references
 * (where an object is an ancestor of itself in the current path).
 * Unlike a flat WeakSet approach, shared references — the same object
 * instance appearing at multiple non-overlapping paths — are cloned
 * normally, so Contentful entries/assets referenced in multiple places
 * are preserved in full.
 */
/**
 * Ninetailed's Contentful app sometimes stores nt_config.components as a plain
 * object instead of an array (newer experience creation flow). The core
 * ExperienceMapper uses Zod which requires an array, so isExperienceEntry()
 * returns false and the experience is silently dropped. This normalizes the
 * entry before handing it to the mapper.
 */
export function normalizeNtExperienceEntry(exp: unknown): unknown {
  if (typeof exp !== "object" || exp === null) return exp;
  const entry = exp as Record<string, unknown>;
  const fields = entry.fields as Record<string, unknown> | undefined;
  if (!fields) return exp;
  const config = fields.nt_config as Record<string, unknown> | undefined;
  if (!config) return exp;
  if (!Array.isArray(config.components) && typeof config.components === "object" && config.components !== null) {
    return {
      ...entry,
      fields: {
        ...fields,
        nt_config: {
          ...config,
          components: [config.components],
        },
      },
    };
  }
  return exp;
}

export function serializeSafe<T>(value: T): T {
  const ancestorSet = new WeakSet<object>();

  function clone(v: unknown): unknown {
    if (typeof v !== "object" || v === null) return v;
    if (ancestorSet.has(v)) return undefined;

    ancestorSet.add(v);

    let result: unknown;
    if (Array.isArray(v)) {
      result = v.map((item) => clone(item));
    } else {
      result = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        const cloned = clone(val);
        if (cloned !== undefined)
          (result as Record<string, unknown>)[k] = cloned;
      }
    }

    ancestorSet.delete(v);
    return result;
  }

  return clone(value) as T;
}
