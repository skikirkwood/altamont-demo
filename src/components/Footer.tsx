import Link from "next/link";
import Image from "next/image";

const LINKS = {
  vehicles: [
    { label: "Altamont Air", href: "#" },
    { label: "Altamont Gravity", href: "#" },
    { label: "Compare models", href: "#" },
  ],
  experience: [
    { label: "DreamDrive", href: "#" },
    { label: "Charging & range", href: "/charging" },
    { label: "Altamont app", href: "#" },
  ],
  ownership: [
    { label: "Service & support", href: "#" },
    { label: "Help center", href: "#" },
    { label: "Contact us", href: "#" },
  ],
  company: [
    { label: "About Altamont", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("http");
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-white transition-colors"
      >
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className="hover:text-white transition-colors">
      {label}
    </Link>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/altamont-logo.png"
              alt="Altamont"
              width={960}
              height={100}
              className="h-8 w-auto max-w-[min(100%,320px)] object-contain object-left sm:h-9 sm:max-w-[400px]"
            />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Vehicles
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS.vehicles.map((l) => (
                <li key={l.href}><FooterLink {...l} /></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Experience
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS.experience.map((l) => (
                <li key={l.href}><FooterLink {...l} /></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Ownership
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS.ownership.map((l) => (
                <li key={l.href}><FooterLink {...l} /></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              {LINKS.company.map((l) => (
                <li key={l.href}><FooterLink {...l} /></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} Altamont. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
