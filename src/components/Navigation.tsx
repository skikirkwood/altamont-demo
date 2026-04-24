import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isResolvedEntry } from "@/lib/helpers";
import type { NavigationMenuEntry, NavigationItemEntry } from "@/lib/types";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

interface Props {
  menu: NavigationMenuEntry | null;
}

function NavItem({ item }: { item: NavigationItemEntry }) {
  const [open, setOpen] = useState(false);
  if (!isResolvedEntry(item)) return null;

  const fields = item.fields as {
    label?: string;
    url?: string;
    page?: { fields?: { slug?: string } };
    children?: NavigationItemEntry[];
  };

  const label = fields.label ?? "";
  const href =
    fields.url ??
    (isResolvedEntry(fields.page) ? `/${fields.page.fields?.slug}` : "#");
  const children = (fields.children ?? []).filter(isResolvedEntry);

  if (children.length === 0) {
    return (
      <Link
        href={href}
        className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        {label}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
      >
        {label}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg bg-zinc-900 py-2 shadow-xl ring-1 ring-white/10">
          {children.map((child) => {
            const cf = child.fields as { label?: string; url?: string };
            return (
              <Link
                key={child.sys.id}
                href={cf.url ?? "#"}
                className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
              >
                {cf.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Navigation({ menu }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!menu || !isResolvedEntry(menu)) {
    return (
      <header className="sticky top-0 z-40 bg-black border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/altamont-logo.png"
              alt="Altamont"
              width={960}
              height={100}
              className="h-7 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-8 sm:max-w-[280px]"
              priority
            />
          </Link>
        </div>
      </header>
    );
  }

  const items = (
    (menu.fields as { items?: NavigationItemEntry[] }).items ?? []
  ).filter(isResolvedEntry);

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/altamont-logo.png"
            alt="Altamont"
            width={960}
            height={100}
            className="h-7 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-8 sm:max-w-[280px]"
            priority
          />
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {items.map((item) => (
            <NavItem key={item.sys.id} item={item} />
          ))}
          <div className="ml-2 border-l border-white/10 pl-3">
            <LocaleSwitcher />
          </div>
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="border-t border-white/10 bg-black px-4 py-4 md:hidden">
          {items.map((item) => {
            const f = item.fields as { label?: string; url?: string };
            return (
              <Link
                key={item.sys.id}
                href={f.url ?? "#"}
                className="block py-2 text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {f.label}
              </Link>
            );
          })}
          <div className="mt-3 border-t border-white/10 pt-3">
            <LocaleSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
