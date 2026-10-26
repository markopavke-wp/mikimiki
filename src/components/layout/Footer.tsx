import Link from "next/link";
import { contact } from "@/data/contact";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-ink/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div>
          <div className="flex items-center gap-3">
            <BrandLogo size={52} className="brand-logo shrink-0" />
            <div>
              <p className="font-[family-name:var(--font-display)] text-lg">
                {contact.brandName}
              </p>
              <p className="text-sm text-white/55">{contact.tagline}</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm text-white/60">
            Turistička agencija i prevoznik — putovanja, izleti, prevoz putnika i privatni
            transferi.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Navigacija
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            {[
              ["#putovanja", "Putovanja"],
              ["#prevoz", "Prevoz"],
              ["#vozni-park", "Vozni park"],
              ["#kontakt", "Kontakt"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="link-underline-light">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/45">
            Informacije
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/privatnost" className="link-underline-light">
                Politika privatnosti
              </Link>
            </li>
            <li>
              <Link href="/uslovi" className="link-underline-light">
                Uslovi putovanja
              </Link>
            </li>
            <li>
              <a
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline-light"
              >
                Instagram {contact.instagramHandle}
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs text-white/40">
            WhatsApp / Viber linkovi nisu prikazani — odgovarajući kontakti nisu
            dostavljeni.
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-white/40 md:px-8">
        © {new Date().getFullYear()} {contact.brandName}. Sva prava zadržana.
      </div>
    </footer>
  );
}
