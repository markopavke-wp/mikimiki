"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function AboutSection() {
  return (
    <section id="o-nama" className="section-pad overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/dest-nea-kallikratia.jpg"
              alt="Mediteranska destinacija — atmosfera putovanja"
              fill
              className="object-cover parallax-img"
              sizes="(max-width:1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <BrandLogo size={72} className="brand-logo mb-3" />
              <p className="font-[family-name:var(--font-display)] text-2xl text-white">
                Miki &amp; Miki TRAVEL
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="eyebrow">O nama</p>
          <h2 className="section-title">Agencija i prevoznik u jednom ritmu</h2>
          <div className="mt-6 space-y-4 text-ink/75 leading-relaxed">
            <p>
              Miki &amp; Miki TRAVEL organizuje putovanja i izlete, uz prevoz putnika i
              privatne transfere. Cilj je jasan: pouzdan polazak, uređen dogovor i
              mirniji put do destinacije.
            </p>
            <p>
              Radimo iz Niša i povezujemo putnike sa letovanjima, vikend aranžmanima i
              transferima — od grupnih polazaka do individualnih dogovora.
            </p>
            <p className="rounded-2xl bg-white/70 p-4 text-sm text-ink/60 ring-1 ring-black/5">
              Napomena: ne navodimo broj putnika, godine poslovanja, licence ni ocene jer
              ti podaci nisu dostavljeni. Dopunite ih kada budu zvanično potvrđeni.
            </p>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              ["Jasan dogovor", "Termin, ruta i cena pre polaska"],
              ["Brendirani prevoz", "Prepoznatljiv beli kombi"],
              ["Putovanja + transferi", "Jedna tačka kontakta"],
              ["Pažljiva organizacija", "Od upita do destinacije"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                <p className="font-semibold text-ink">{t}</p>
                <p className="mt-1 text-sm text-ink/60">{d}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
