"use client";

import Image from "next/image";
import Link from "next/link";
import { Trip, formatPrice, formatTripDate } from "@/data/trips";

export function TripCard({ trip }: { trip: Trip }) {
  return (
    <article className="group trip-card overflow-hidden rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition duration-500 hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={trip.image}
          alt={`${trip.title}, ${trip.country}`}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink backdrop-blur">
          {trip.country}
        </div>
        {trip.demo && (
          <div className="absolute right-4 top-4 rounded-full bg-brand/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Demo
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          {trip.title}
        </h3>
        <dl className="grid grid-cols-2 gap-2 text-sm text-ink/70">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/45">Polazak</dt>
            <dd>{formatTripDate(trip.departureDate)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/45">Trajanje</dt>
            <dd>{trip.durationLabel}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/45">Polazište</dt>
            <dd>{trip.departurePlace}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/45">Cena</dt>
            <dd className="font-semibold text-brand">{formatPrice(trip)}</dd>
          </div>
        </dl>
        <Link href={`/putovanja/${trip.slug}`} className="btn-secondary mt-2 inline-flex">
          Pogledaj detalje
        </Link>
      </div>
    </article>
  );
}
