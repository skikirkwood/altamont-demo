import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isResolvedEntry } from "@/lib/helpers";
import type { NavigationMenuEntry, NavigationItemEntry } from "@/lib/types";

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
        className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
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
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        {label}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg bg-white py-2 shadow-xl ring-1 ring-gray-200">
          {children.map((child) => {
            const cf = child.fields as { label?: string; url?: string };
            return (
              <Link
                key={child.sys.id}
                href={cf.url ?? "#"}
                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/lucid-motors-logo.png"
              alt="Lucid Motors"
              width={960}
              height={61}
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
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/lucid-motors-logo.png"
            alt="Lucid Motors"
            width={960}
            height={61}
            className="h-7 w-auto max-w-[min(100%,220px)] object-contain object-left sm:h-8 sm:max-w-[280px]"
            priority
          />
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex md:items-center md:gap-1">
          {items.map((item) => (
            <NavItem key={item.sys.id} item={item} />
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-gray-700"
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
        <nav className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {items.map((item) => {
            const f = item.fields as { label?: string; url?: string };
            return (
              <Link
                key={item.sys.id}
                href={f.url ?? "#"}
                className="block py-2 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setMobileOpen(false)}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
