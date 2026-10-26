import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section id="pocetna" className="hero" aria-labelledby="hero-title">
      <div className="hero-media" aria-hidden>
        <Image
          src="/images/hero-refs/start.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hero-img"
        />
        <div className="hero-shade" />
      </div>

      <div className="hero-content">
        <p className="hero-brand">Miki &amp; Miki TRAVEL</p>
        <h1 id="hero-title" className="hero-title">
          Putovanja i prevoz — od Niša do destinacije
        </h1>
        <p className="hero-lead">
          Organizujemo izlete, transfere i grupni prevoz. Kombi je spreman, ti biraj
          pravac.
        </p>
        <div className="hero-actions">
          <Link href="#putovanja" className="btn-primary">
            Pogledaj putovanja
          </Link>
          <Link href="#kontakt" className="btn-ghost">
            Pošalji upit
          </Link>
        </div>
      </div>
    </section>
  );
}
