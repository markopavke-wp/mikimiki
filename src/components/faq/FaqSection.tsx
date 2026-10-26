"use client";

import { useState } from "react";
import gsap from "gsap";
import { faqs } from "@/data/faq";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);

  const toggle = (id: string, panel: HTMLDivElement | null) => {
    const next = openId === id ? null : id;
    setOpenId(next);
    if (!panel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (next === id) {
      gsap.fromTo(
        panel,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" }
      );
    }
  };

  return (
    <section id="faq" className="section-pad bg-white/40">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">Česta pitanja</p>
          <h2 className="section-title">Odgovori pre polaska</h2>
        </Reveal>

        <div className="mt-10 divide-y divide-ink/10 rounded-3xl bg-white/80 ring-1 ring-black/5">
          {faqs.map((item) => {
            const open = openId === item.id;
            return (
              <div key={item.id} className="px-5 md:px-6">
                <h3>
                  <button
                    type="button"
                    className="focus-ring flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={open}
                    onClick={(e) => {
                      const panel = e.currentTarget.parentElement
                        ?.nextElementSibling as HTMLDivElement | null;
                      toggle(item.id, panel);
                    }}
                  >
                    <span className="font-[family-name:var(--font-display)] text-lg text-ink md:text-xl">
                      {item.question}
                    </span>
                    <span
                      className={cn(
                        "grid h-8 w-8 place-items-center rounded-full bg-ink/5 text-ink transition",
                        open && "rotate-45 bg-brand text-white"
                      )}
                      aria-hidden
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  className={cn("overflow-hidden pb-5", !open && "hidden")}
                  hidden={!open}
                >
                  <p className="text-ink/70 leading-relaxed">{item.answer}</p>
                  {item.needsCompanyRules && (
                    <p className="mt-3 text-xs font-medium uppercase tracking-wide text-brand">
                      Za dopunu pravilima firme
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
