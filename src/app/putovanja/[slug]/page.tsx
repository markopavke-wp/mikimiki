import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatPrice,
  formatTripDate,
  getTripBySlug,
  trips,
} from "@/data/trips";
import { ContactSection } from "@/components/contact/ContactSection";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: "Putovanje" };
  return {
    title: trip.title,
    description: trip.summary,
    openGraph: { images: [trip.image] },
  };
}

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  return (
    <div className="pt-24">
      <section className="relative h-[52vh] min-h-[320px] overflow-hidden">
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 md:px-8">
          <Link href="/putovanja" className="text-sm text-white/70 link-underline-light">
            ← Nazad na putovanja
          </Link>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white md:text-6xl">
            {trip.title}
          </h1>
          <p className="mt-2 text-white/75">
            {trip.country} · {formatTripDate(trip.departureDate)} –{" "}
            {formatTripDate(trip.returnDate)} · {formatPrice(trip)}
          </p>
          {trip.demo && (
            <span className="mt-4 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Demo ponuda
            </span>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_0.8fr] md:px-8">
        <div className="space-y-8">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">Opis</h2>
            <p className="mt-3 text-ink/75 leading-relaxed">{trip.summary}</p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              Program putovanja
            </h2>
            <ol className="mt-4 space-y-3">
              {trip.program.map((step, i) => (
                <li key={step} className="flex gap-3 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-ink/80">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {trip.gallery.map((src) => (
              <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                <Image src={src} alt={`Galerija — ${trip.title}`} fill className="object-cover" sizes="40vw" />
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="glass-panel sticky top-28 rounded-3xl p-6">
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-ink/45">Polazište</dt>
                <dd className="text-lg font-semibold">{trip.departurePlace}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Trajanje</dt>
                <dd className="text-lg font-semibold">{trip.durationLabel}</dd>
              </div>
              <div>
                <dt className="text-ink/45">Termin</dt>
                <dd className="text-lg font-semibold">
                  {formatTripDate(trip.departureDate)} – {formatTripDate(trip.returnDate)}
                </dd>
              </div>
              <div>
                <dt className="text-ink/45">Cena</dt>
                <dd className="text-2xl font-bold text-brand">{formatPrice(trip)}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Uključeno
                </p>
                <ul className="space-y-1 text-sm text-ink/75">
                  {trip.included.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/45">
                  Nije uključeno
                </p>
                <ul className="space-y-1 text-sm text-ink/75">
                  {trip.excluded.map((x) => (
                    <li key={x}>• {x}</li>
                  ))}
                </ul>
              </div>
            </div>

            <a href="#upit" className="btn-primary mt-7 w-full justify-center">
              Pošalji upit za ovo putovanje
            </a>
          </div>
        </aside>
      </section>

      <ContactSection tripSlug={trip.slug} />
    </div>
  );
}
