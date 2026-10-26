"use client";

import { Suspense } from "react";
import { contact } from "@/data/contact";
import { ContactForm } from "./ContactForm";
import { Reveal } from "@/components/ui/Reveal";

export function ContactSection({ tripSlug }: { tripSlug?: string }) {
  return (
    <section id="kontakt" className="section-pad">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <p className="eyebrow">Kontakt</p>
          <h2 className="section-title">Pošaljite upit</h2>
          <p className="section-lead">
            Javite se za putovanje, transfer ili informalnu procenu. Kontakt podaci su
            označeni kao demo dok ne budu zamenjeni zvaničnim.
          </p>

          <ul className="mt-8 space-y-4 text-ink/80">
            <li>
              <p className="text-xs uppercase tracking-wide text-ink/45">Telefon</p>
              <a className="link-underline text-lg" href={contact.phoneHref}>
                {contact.phone}
              </a>
              {contact.demoNote && (
                <p className="text-xs text-brand">Demo — zameniti stvarnim brojem</p>
              )}
            </li>
            <li>
              <p className="text-xs uppercase tracking-wide text-ink/45">Email</p>
              <a className="link-underline text-lg" href={contact.emailHref}>
                {contact.email}
              </a>
            </li>
            <li>
              <p className="text-xs uppercase tracking-wide text-ink/45">Lokacija</p>
              <p className="text-lg">{contact.address}</p>
            </li>
            <li>
              <p className="text-xs uppercase tracking-wide text-ink/45">Instagram</p>
              <a
                className="link-underline text-lg"
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                {contact.instagramHandle}
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="glass-panel rounded-3xl p-6 md:p-8">
            <Suspense fallback={<p className="text-ink/60">Učitavanje forme…</p>}>
              <ContactForm tripSlug={tripSlug} />
            </Suspense>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
