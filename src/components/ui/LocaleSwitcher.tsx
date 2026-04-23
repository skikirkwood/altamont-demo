import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

const LOCALES: Record<string, { label: string; shortLabel: string; flag: string }> = {
  "en-US": { label: "English (US)", shortLabel: "EN-US", flag: "🇺🇸" },
  "en-CA": { label: "English (CA)", shortLabel: "EN-CA", flag: "🇨🇦" },
  "fr-CA": { label: "Français (CA)", shortLabel: "FR-CA", flag: "🇨🇦" },
};

export default function LocaleSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = router.locale ?? "en-US";
  const currentConfig = LOCALES[current] ?? LOCALES["en-US"];

  function handleSelect(locale: string) {
    setOpen(false);
    router.push(router.asPath, router.asPath, { locale, scroll: false });
  }

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span aria-hidden="true">{currentConfig.flag}</span>
        <span>{currentConfig.shortLabel}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg bg-zinc-900 py-1 shadow-xl ring-1 ring-white/10"
        >
          {Object.entries(LOCALES).map(([code, { label, flag }]) => (
            <li key={code} role="option" aria-selected={code === current}>
              <button
                onClick={() => handleSelect(code)}
                className={`flex w-full items-center gap-2.5 px-4 py-2 text-left text-sm transition-colors
                  ${code === current
                    ? "bg-white/10 font-semibold text-white"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <span aria-hidden="true">{flag}</span>
                {label}
                {code === current && (
                  <svg className="ml-auto h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
