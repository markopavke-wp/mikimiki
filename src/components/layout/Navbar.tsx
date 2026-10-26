"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const LINKS = [
  { href: "#putovanja", label: "Putovanja" },
  { href: "#prevoz", label: "Prevoz" },
  { href: "#vozni-park", label: "Vozni park" },
  { href: "#o-nama", label: "O nama" },
  { href: "#faq", label: "FAQ" },
  { href: "#kontakt", label: "Kontakt" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav ${scrolled ? "is-scrolled" : ""}`}>
      <div className="site-nav-inner">
        <Link href="#pocetna" className="site-nav-brand" aria-label="Miki & Miki TRAVEL">
          <BrandLogo size={44} />
          <span>
            Miki &amp; Miki <em>TRAVEL</em>
          </span>
        </Link>

        <nav className="site-nav-links" aria-label="Glavna navigacija">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <Link href="#kontakt" className="btn-primary site-nav-cta">
          Upit
        </Link>

        <button
          type="button"
          className="site-nav-menu"
          aria-expanded={open}
          aria-label="Meni"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="site-nav-drawer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
