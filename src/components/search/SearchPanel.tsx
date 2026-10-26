"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { trips } from "@/data/trips";
import { cn } from "@/lib/cn";

type Tab = "putovanja" | "prevoz";

export function SearchPanel() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("putovanja");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("2");
  const [from, setFrom] = useState("Niš");
  const [to, setTo] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const destinations = useMemo(
    () => Array.from(new Set(trips.map((t) => t.destination))),
    []
  );

  const onTripSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destinacija", destination);
    if (date) params.set("datum", date);
    if (passengers) params.set("putnici", passengers);
    params.set("rezultat", "1");
    setMessage(null);
    router.push(`/putovanja?${params.toString()}#rezultati`);
  };

  const onTransportSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({
      tip: "prevoz",
      polazak: from,
      odrediste: to,
      datum: date,
      putnici: passengers,
    });
    router.push(`/kontakt?${params.toString()}#upit`);
  };

  return (
    <section className="relative z-20 -mt-10 px-4 md:-mt-14 md:px-8">
      <div className="glass-panel mx-auto max-w-5xl rounded-3xl p-5 md:p-7">
        <div className="mb-5 flex gap-2" role="tablist" aria-label="Tip pretrage">
          {(
            [
              ["putovanja", "Putovanja"],
              ["prevoz", "Prevoz i transferi"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={cn(
                "focus-ring rounded-full px-4 py-2 text-sm font-medium transition",
                tab === id
                  ? "bg-ink text-white"
                  : "bg-white/50 text-ink/70 hover:bg-white/80"
              )}
              onClick={() => {
                setTab(id);
                setMessage(null);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "putovanja" ? (
          <form onSubmit={onTripSearch} className="grid gap-3 md:grid-cols-4">
            <label className="field">
              <span>Destinacija</span>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="input"
              >
                <option value="">Sve destinacije</option>
                {destinations.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Datum polaska</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
              />
            </label>
            <label className="field">
              <span>Broj putnika</span>
              <input
                type="number"
                min={1}
                max={50}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="input"
                required
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full justify-center">
                Pronađi putovanje
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={onTransportSearch} className="grid gap-3 md:grid-cols-5">
            <label className="field">
              <span>Mesto polaska</span>
              <input
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="input"
                required
              />
            </label>
            <label className="field">
              <span>Odredište</span>
              <input
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="input"
                required
                placeholder="npr. Aerodrom Beograd"
              />
            </label>
            <label className="field">
              <span>Datum</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input"
                required
              />
            </label>
            <label className="field">
              <span>Broj putnika</span>
              <input
                type="number"
                min={1}
                max={50}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
                className="input"
                required
              />
            </label>
            <div className="flex items-end">
              <button type="submit" className="btn-primary w-full justify-center">
                Zatraži ponudu
              </button>
            </div>
          </form>
        )}

        {message && (
          <p className="mt-4 text-sm text-ink/70" role="status">
            {message}
          </p>
        )}
        <p className="mt-4 text-xs text-ink/50">
          Pretraga radi nad demo podacima. Stvarna dostupnost potvrđuje se upitom.
        </p>
      </div>
    </section>
  );
}
