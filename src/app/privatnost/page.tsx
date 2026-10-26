import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti",
};

export default function PrivatnostPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-20 pt-32 md:px-8">
      <p className="eyebrow">Pravno</p>
      <h1 className="section-title">Politika privatnosti</h1>
      <div className="prose-like mt-8 space-y-4 text-ink/75 leading-relaxed">
        <p>
          <strong>Status:</strong> sadržaj za naknadnu dopunu. Ovaj tekst je privremeni
          okvir dok firma ne dostavi zvaničnu politiku privatnosti.
        </p>
        <p>
          Podaci koje unesete u kontakt formu (ime, email, telefon, poruka) koriste se
          isključivo radi odgovora na upit. Neće biti deljeni sa trećim licima van
          neophodnog poslovanja, osim ako zakon to zahteva.
        </p>
        <p>
          [ZA DOPUNU: pravni naziv firme, PIB, adresa, svrha obrade, rokovi čuvanja,
          prava korisnika, kolačići, kontakt za zaštitu podataka.]
        </p>
      </div>
    </article>
  );
}
