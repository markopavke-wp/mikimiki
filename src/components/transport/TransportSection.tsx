"use client";

import Link from "next/link";
import { transportServices } from "@/data/transport";
import { Reveal } from "@/components/ui/Reveal";

export function TransportSection() {
  return (
    <section id="prevoz" className="section-pad bg-ink text-white">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow text-white/55">Prevoz i transferi</p>
          <h2 className="section-title text-white">Od vrata do destinacije</h2>
          <p className="section-lead text-white/70">
            Formulisano fleksibilno — prilagodite uslugu stvarnoj ponudi firme bez izmene
            strukture sajta.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {transportServices.map((s, i) => (
            <Reveal key={s.id} delay={i * 0.05}>
              <article className="glass-dark h-full rounded-3xl p-6 transition hover:-translate-y-1">
                <h3 className="font-[family-name:var(--font-display)] text-2xl">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{s.description}</p>
                <ul className="mt-5 space-y-2 text-sm text-white/85">
                  {s.highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      {h}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/kontakt?tip=prevoz#upit" className="btn-primary">
            Zatraži ponudu za prevoz
          </Link>
        </div>
      </div>
    </section>
  );
}
