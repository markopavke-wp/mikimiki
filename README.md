# Miki & Miki TRAVEL — web platforma

Premium landing i katalog za turističku agenciju i prevoznika (Niš).  
Stack: **Next.js 15**, **TypeScript**, **Tailwind CSS**, **GSAP + ScrollTrigger**, **Lenis**, canvas WebP sekvenca.

## Pokretanje

```bash
npm install
npm run dev
```

Otvorite [http://localhost:3000](http://localhost:3000).

Produkcijski build:

```bash
npm run build
npm start
```

## Hero animacija (100 WebP frejmova)

Frejmovi su u `public/frames/frame-000.webp` … `frame-099.webp`.

### Ponovno generisanje (preporučeno — tvoje reference)

Hero sekvenca je složenа od početne / mapne / krajnje reference + međukadrova:

```bash
npm run frames:refs
```

- Reference: `public/images/hero-refs/{start,map,end}.png`
- Keyframe-ovi: `scripts/frame-generator/keyframes/`
- Skripta: `scripts/frame-generator/build-from-refs.py`

Tok: parking (vrata se zatvaraju) → vožnja → mapa (Niš–Skoplje–Solun) → parking pored mora.

Alternativa (stari low-poly Three.js render):

```bash
npm run frames:render
```

### Blender putanja (opciono, viši kvalitet)

```bash
blender -b -P scripts/blender/render_journey.py
npm run frames:webp
```

Zamenite proxy model kombija detaljnim assetom i zadržite logo kao decal.

### Veličina sekvence

Poslednji `frames:refs` build: **~15.7 MB** za 100 WebP frejmova (1280×720).

## Zamena sadržaja

| Šta | Gde |
|-----|-----|
| Logo | `public/images/logo.png`, `logo-transparent.png` |
| Putovanja | `src/data/trips.ts` |
| Prevoz | `src/data/transport.ts` |
| Vozni park | `src/data/fleet.ts` |
| Kontakt | `src/data/contact.ts` |
| FAQ | `src/data/faq.ts` |
| Destinacije (foto) | `public/images/dest-*.jpg` |
| Privatnost / uslovi | `src/app/privatnost`, `src/app/uslovi` |

## Šta je gotovo

- Floating glass navigacija + mobilni meni (GSAP)
- Hero canvas scroll-sekvenca (pin + scrub), progressive load, reduced-motion fallback
- Glass panel pretrage (filter putovanja / popuna forme za prevoz)
- Kartice putovanja, filteri, detaljne stranice
- Prevoz, vozni park, o nama, FAQ accordion, kontakt forma (demo stanje bez lažnog uspeha)
- SEO meta, semantički HTML, focus stanja, validacija formi

## Šta još treba od stvarnih podataka / servisa

- Telefon, email, PIB, adresa (sada demo u `contact.ts`)
- Fotografije i specifikacije vozila (kapacitet, prtljag, oprema)
- Zvanične cene, termini, programi (trenutno označeno kao DEMO)
- Backend za slanje upita (forma je svesno u demo režimu)
- Politika privatnosti i uslovi putovanja
- WhatsApp / Viber (nisu prikazani — kontakti nisu dostavljeni)
- Referentni sajt nije bio priložen uz prompt — raspored je originalan, inspirisan premium travel/product reveal ritmom

## Napomena o stilu animacije

Hero frejmovi su stilizovana kontinuirana 3D scena (low-poly / premium toy-map estetika), ne fotorealistični CGI. Za „award” fotorealizam koristite Blender skriptu + detaljan model kombija.
