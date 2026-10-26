"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { contact } from "@/data/contact";
import { trips } from "@/data/trips";

type Errors = Partial<Record<string, string>>;

export function ContactForm({ tripSlug }: { tripSlug?: string }) {
  const params = useSearchParams();
  const trip = trips.find((t) => t.slug === tripSlug);

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    type: "opste",
    from: "",
    to: "",
    date: "",
    passengers: "",
    message: "",
    tripId: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "demo">("idle");

  useEffect(() => {
    setValues((v) => ({
      ...v,
      type: params.get("tip") || (trip ? "putovanje" : v.type || "opste"),
      from: params.get("polazak") || v.from,
      to: params.get("odrediste") || v.to,
      date: params.get("datum") || v.date,
      passengers: params.get("putnici") || v.passengers,
      message: trip
        ? `Upit za putovanje: ${trip.title} (${trip.departureDate}).`
        : v.message,
      tripId: trip?.id || v.tripId,
    }));
  }, [params, trip]);

  const validate = () => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = "Unesite ime i prezime.";
    if (!values.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      next.email = "Unesite ispravan email.";
    }
    if (!values.phone.trim()) next.phone = "Unesite telefon.";
    if (!values.message.trim() || values.message.trim().length < 10) {
      next.message = "Poruka treba da ima najmanje 10 karaktera.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Nema povezanog backend-a — demo stanje, bez lažnog "uspeha"
    setStatus("demo");
  };

  const set = (key: string, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  return (
    <form id="upit" onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="field">
          <span>Ime i prezime</span>
          <input
            className="input"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            autoComplete="name"
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="field-error">{errors.name}</span>}
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            className="input"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            autoComplete="email"
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </label>
        <label className="field">
          <span>Telefon</span>
          <input
            className="input"
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            autoComplete="tel"
            aria-invalid={!!errors.phone}
          />
          {errors.phone && <span className="field-error">{errors.phone}</span>}
        </label>
        <label className="field">
          <span>Tip upita</span>
          <select
            className="input"
            value={values.type}
            onChange={(e) => set("type", e.target.value)}
          >
            <option value="opste">Opšti upit</option>
            <option value="putovanje">Putovanje</option>
            <option value="prevoz">Prevoz / transfer</option>
            <option value="vozni-park">Vozni park</option>
          </select>
        </label>
      </div>

      {(values.type === "prevoz" || values.from || values.to) && (
        <div className="grid gap-4 md:grid-cols-3">
          <label className="field">
            <span>Polazak</span>
            <input className="input" value={values.from} onChange={(e) => set("from", e.target.value)} />
          </label>
          <label className="field">
            <span>Odredište</span>
            <input className="input" value={values.to} onChange={(e) => set("to", e.target.value)} />
          </label>
          <label className="field">
            <span>Datum / putnici</span>
            <input
              className="input"
              value={[values.date, values.passengers && `${values.passengers} putnika`]
                .filter(Boolean)
                .join(" · ")}
              onChange={(e) => set("date", e.target.value)}
            />
          </label>
        </div>
      )}

      {trip && (
        <p className="rounded-2xl bg-brand/10 px-4 py-3 text-sm text-ink">
          Upit vezan za: <strong>{trip.title}</strong>
        </p>
      )}

      <label className="field">
        <span>Poruka</span>
        <textarea
          className="input min-h-32"
          value={values.message}
          onChange={(e) => set("message", e.target.value)}
          aria-invalid={!!errors.message}
        />
        {errors.message && <span className="field-error">{errors.message}</span>}
      </label>

      <button type="submit" className="btn-primary">
        Pošalji upit
      </button>

      {status === "demo" && (
        <div
          role="status"
          className="rounded-2xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <strong>Demo stanje:</strong> forma je validirana, ali backend za slanje nije
          povezan. Upit nije poslat. Kontaktirajte nas direktno na{" "}
          <a className="link-underline" href={contact.emailHref}>
            {contact.email}
          </a>{" "}
          ili{" "}
          <a className="link-underline" href={contact.phoneHref}>
            {contact.phone}
          </a>
          .
        </div>
      )}
    </form>
  );
}
