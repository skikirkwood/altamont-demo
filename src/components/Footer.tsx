import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/">
            <Image
              src="/lucid-motors-logo.png"
              alt="Lucid Motors"
              width={960}
              height={61}
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
              <li>
                <Link href="/lucid-air" className="hover:text-white transition-colors">
                  Lucid Air
                </Link>
              </li>
              <li>
                <Link href="/lucid-gravity" className="hover:text-white transition-colors">
                  Lucid Gravity
                </Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-white transition-colors">
                  Compare models
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Experience
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dreamdrive" className="hover:text-white transition-colors">
                  DreamDrive
                </Link>
              </li>
              <li>
                <Link href="/charging" className="hover:text-white transition-colors">
                  Charging &amp; range
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-white transition-colors">
                  Lucid app
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Ownership
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/service" className="hover:text-white transition-colors">
                  Service &amp; support
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-white transition-colors">
                  Help center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Lucid Motors
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-gray-800 pt-6 text-center text-xs">
          <p>© {new Date().getFullYear()} Lucid Motors. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
