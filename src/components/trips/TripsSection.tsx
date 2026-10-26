"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TripCategory, tripCategories, trips } from "@/data/trips";
import { TripCard } from "./TripCard";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

export function TripsSection({
  initialCategory = "sve",
  initialDestination = "",
  showFilters = true,
  limit,
}: {
  initialCategory?: TripCategory | "sve";
  initialDestination?: string;
  showFilters?: boolean;
  limit?: number;
}) {
  const [category, setCategory] = useState<TripCategory | "sve">(initialCategory);
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    let list = trips;
    if (category !== "sve") list = list.filter((t) => t.category === category);
    if (initialDestination) {
      list = list.filter(
        (t) => t.destination.toLowerCase() === initialDestination.toLowerCase()
      );
    }
    if (limit) list = list.slice(0, limit);
    return list;
  }, [category, initialDestination, limit]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = grid.querySelectorAll(".trip-card");
    const anim = gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: grid, start: "top 85%" },
      }
    );
    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, [filtered]);

  return (
    <section id="putovanja" className="section-pad">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal>
          <p className="eyebrow">Izdvojena putovanja</p>
          <h2 className="section-title">Destinacije koje vode ka letu</h2>
          <p className="section-lead">
            Demo ponude inspirisane aktuelnim objavama — filtrirajte i pošaljite upit za
            potvrdu termina i cene.
          </p>
        </Reveal>

        {showFilters && (
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filteri putovanja">
            {tripCategories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn(
                  "focus-ring rounded-full px-4 py-2 text-sm transition",
                  category === c.id
                    ? "bg-brand text-white"
                    : "bg-white/70 text-ink/70 ring-1 ring-black/5 hover:bg-white"
                )}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        <div
          ref={gridRef}
          id="rezultati"
          className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.length === 0 ? (
            <p className="col-span-full rounded-2xl bg-white/70 p-8 text-ink/70 ring-1 ring-black/5">
              Nema ponuda za izabrane filtere. Probajte drugi filter ili{" "}
              <a href="#kontakt" className="link-underline text-brand">
                pošaljite upit
              </a>
              .
            </p>
          ) : (
            filtered.map((trip) => <TripCard key={trip.id} trip={trip} />)
          )}
        </div>
      </div>
    </section>
  );
}
