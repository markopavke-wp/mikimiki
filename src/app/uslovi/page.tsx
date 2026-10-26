import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uslovi putovanja",
};

export default function UsloviPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pb-20 pt-32 md:px-8">
      <p className="eyebrow">Pravno</p>
      <h1 className="section-title">Uslovi putovanja</h1>
      <div className="mt-8 space-y-4 text-ink/75 leading-relaxed">
        <p>
          <strong>Status:</strong> sadržaj za naknadnu dopunu. Zvanični uslovi putovanja,
          otkazivanja i odgovornosti biće objavljeni ovde.
        </p>
        <p>
          Do tada, svaka rezervacija se potvrđuje individualnim dogovorom (ponuda +
          prihvatanje) i važećim propisima Republike Srbije.
        </p>
        <p>
          [ZA DOPUNU: uslovi uplate, avans, otkazivanje, izmene termina, prtljag, pravila
          ponašanja u vozilu, odricanja odgovornosti.]
        </p>
      </div>
    </article>
  );
}
