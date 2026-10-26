"use client";

import Image from "next/image";
import Link from "next/link";
import { fleet } from "@/data/fleet";
import { Reveal } from "@/components/ui/Reveal";

export function FleetSection() {
  const vehicle = fleet[0];

  return (
    <section id="vozni-park" className="section-pad">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">Vozni park</p>
          <h2 className="section-title">Beli kombi koji nosi brend</h2>
          <p className="section-lead">
            Brendirani beli kombi Miki &amp; Miki TRAVEL. Specifikacije kapaciteta
            biće dopunjene zvaničnim podacima.
          </p>
        </Reveal>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <div className="grid grid-cols-2 gap-3">
              {vehicle.images.map((src, i) => (
                <div
                  key={src}
                  className={`relative overflow-hidden rounded-3xl ${i === 0 ? "col-span-2 aspect-[16/10]" : "aspect-square"}`}
                >
                  <Image
                    src={src}
                    alt={`${vehicle.name} — kadar ${i + 1}`}
                    fill
                    className="object-cover transition duration-700 hover:scale-105"
                    sizes="(max-width:1024px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass-panel rounded-3xl p-7 md:p-9">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {vehicle.type}
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
                {vehicle.name}
              </h3>
              <ul className="mt-6 space-y-3 text-ink/75">
                {vehicle.features.map((f) => (
                  <li key={f} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    {f}
                  </li>
                ))}
              </ul>
              <dl className="mt-6 grid gap-3 text-sm">
                <div className="rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-black/5">
                  <dt className="text-ink/45">Kapacitet</dt>
                  <dd className="font-medium text-ink">
                    {vehicle.capacity ?? "Biće dopunjeno zvaničnim podacima"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-white/60 px-4 py-3 ring-1 ring-black/5">
                  <dt className="text-ink/45">Prostor za prtljag</dt>
                  <dd className="font-medium text-ink">
                    {vehicle.luggage ?? "Biće dopunjeno zvaničnim podacima"}
                  </dd>
                </div>
              </dl>
              <p className="mt-5 text-sm text-ink/55">{vehicle.note}</p>
              <Link href="/kontakt?tip=vozni-park#upit" className="btn-primary mt-7 inline-flex">
                Pošalji upit za vozilo
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
