import type { Metadata } from "next";
import { TripsSection } from "@/components/trips/TripsSection";
import { TripCategory } from "@/data/trips";

export const metadata: Metadata = {
  title: "Putovanja",
  description: "Izdvojena putovanja i izleti — Miki & Miki TRAVEL (demo podaci).",
};

type Props = {
  searchParams: Promise<{
    destinacija?: string;
    kategorija?: string;
    datum?: string;
    putnici?: string;
  }>;
};

export default async function PutovanjaPage({ searchParams }: Props) {
  const sp = await searchParams;
  const cat = (sp.kategorija as TripCategory | "sve" | undefined) || "sve";

  return (
    <div className="pt-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow">Katalog</p>
        <h1 className="section-title">Sva putovanja</h1>
        {(sp.destinacija || sp.datum || sp.putnici) && (
          <p className="mt-4 rounded-2xl bg-white/70 px-4 py-3 text-sm text-ink/70 ring-1 ring-black/5">
            Filter pretrage:
            {sp.destinacija ? ` destinacija „${sp.destinacija}”` : ""}
            {sp.datum ? ` · datum ${sp.datum}` : ""}
            {sp.putnici ? ` · ${sp.putnici} putnika` : ""}
            . Rezultati su demo.
          </p>
        )}
      </div>
      <TripsSection
        initialCategory={cat}
        initialDestination={sp.destinacija || ""}
      />
    </div>
  );
}
