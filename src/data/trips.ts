export type TripCategory = "letovanje" | "izlet" | "vikend" | "evropa";

export type Trip = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  country: string;
  category: TripCategory;
  departureDate: string;
  returnDate: string;
  durationLabel: string;
  departurePlace: string;
  priceFrom: number | null;
  currency: "EUR";
  image: string;
  gallery: string[];
  summary: string;
  program: string[];
  included: string[];
  excluded: string[];
  demo: boolean;
};

export const tripCategories: { id: TripCategory | "sve"; label: string }[] = [
  { id: "sve", label: "Sve" },
  { id: "letovanje", label: "Letovanja" },
  { id: "izlet", label: "Izleti" },
  { id: "vikend", label: "Vikend putovanja" },
  { id: "evropa", label: "Evropski gradovi" },
];

export const trips: Trip[] = [
  {
    id: "nea-kallikratia-demo",
    slug: "nea-kallikratia",
    title: "Nea Kallikratia",
    destination: "Nea Kallikratia",
    country: "Grčka",
    category: "letovanje",
    departureDate: "2026-08-21",
    returnDate: "2026-08-31",
    durationLabel: "10 noći",
    departurePlace: "Niš",
    priceFrom: 159,
    currency: "EUR",
    image: "/images/dest-nea-kallikratia.jpg",
    gallery: [
      "/images/dest-nea-kallikratia.jpg",
      "/images/dest-olympic-beach.jpg",
      "/images/dest-leptokaria.jpg",
    ],
    summary:
      "Letovanje na Halkidikiju uz organizovan smeštaj i prevoz. DEMO ponuda zasnovana na javno prikazanim terminima i cenama sa društvenih mreža — potvrdite aktuelnost pre rezervacije.",
    program: [
      "Polazak iz Niša u dogovoreno vreme",
      "Dolazak i smeštaj u Nea Kallikratiji",
      "Slobodno vreme za plažu i obilaske",
      "Organizovan povratak",
    ],
    included: ["Prevoz", "Smeštaj (prema izabranoj opciji)"],
    excluded: ["Lični troškovi", "Opcioni izleti", "Putno osiguranje"],
    demo: true,
  },
  {
    id: "leptokaria-demo",
    slug: "leptokaria",
    title: "Leptokaria",
    destination: "Leptokaria",
    country: "Grčka",
    category: "letovanje",
    departureDate: "2026-08-29",
    returnDate: "2026-09-08",
    durationLabel: "10 noći",
    departurePlace: "Niš",
    priceFrom: 179,
    currency: "EUR",
    image: "/images/dest-leptokaria.jpg",
    gallery: [
      "/images/dest-leptokaria.jpg",
      "/images/dest-nea-kallikratia.jpg",
      "/images/dest-olympic-beach.jpg",
    ],
    summary:
      "Popularna destinacija u podnožju Olimpa — plaža, šetalište i miran ritam. DEMO podaci; tačan smeštaj i uslovi potvrđuju se upitom.",
    program: [
      "Polazak kombijem / autobusom iz Niša",
      "Smeštaj u Leptokariji",
      "Slobodni dani uz more",
      "Povratak dogovorenim terminom",
    ],
    included: ["Prevoz", "Smeštaj"],
    excluded: ["Obroci (osim ako nije drugačije dogovoreno)", "Ulaznice i izleti"],
    demo: true,
  },
  {
    id: "olympic-beach-demo",
    slug: "olympic-beach",
    title: "Olympic Beach",
    destination: "Olympic Beach",
    country: "Grčka",
    category: "letovanje",
    departureDate: "2026-08-31",
    returnDate: "2026-09-10",
    durationLabel: "10 noći",
    departurePlace: "Niš",
    priceFrom: 179,
    currency: "EUR",
    image: "/images/dest-olympic-beach.jpg",
    gallery: [
      "/images/dest-olympic-beach.jpg",
      "/images/dest-leptokaria.jpg",
      "/images/dest-nea-kallikratia.jpg",
    ],
    summary:
      "Duga peščana plaža i turistička infrastruktura. DEMO ponuda — cene su orijentacione („već od”).",
    program: [
      "Polazak iz Niša",
      "Dolazak i check-in",
      "Odmor i aktivnosti po izboru",
      "Organizovan povratak",
    ],
    included: ["Prevoz", "Smeštaj"],
    excluded: ["Lični troškovi", "Putno osiguranje"],
    demo: true,
  },
  {
    id: "canj-demo",
    slug: "canj",
    title: "Čanj",
    destination: "Čanj",
    country: "Crna Gora",
    category: "vikend",
    departureDate: "2026-08-31",
    returnDate: "2026-09-10",
    durationLabel: "10 noći",
    departurePlace: "Niš",
    priceFrom: 199,
    currency: "EUR",
    image: "/images/dest-canj.jpg",
    gallery: [
      "/images/dest-canj.jpg",
      "/images/dest-olympic-beach.jpg",
      "/images/dest-nea-kallikratia.jpg",
    ],
    summary:
      "Jadranska obala Crne Gore — blizina Budve i mirniji ritam Čanja. DEMO podaci sa javnih objava; proverite aktuelnu cenu i smeštaj.",
    program: [
      "Polazak iz Niša",
      "Smeštaj u Čanju",
      "Slobodno vreme / opcione ture",
      "Povratak",
    ],
    included: ["Prevoz", "Smeštaj"],
    excluded: ["Boravišna taksa (ako se naplaćuje posebno)", "Obroci"],
    demo: true,
  },
  {
    id: "beograd-izlet-demo",
    slug: "beograd-izlet",
    title: "Beograd — jednodnevni izlet",
    destination: "Beograd",
    country: "Srbija",
    category: "izlet",
    departureDate: "2026-05-16",
    returnDate: "2026-05-16",
    durationLabel: "1 dan",
    departurePlace: "Niš",
    priceFrom: null,
    currency: "EUR",
    image: "/images/dest-leptokaria.jpg",
    gallery: ["/images/dest-leptokaria.jpg"],
    summary:
      "DEMO izlet: organizovan prevoz do Beograda i povratak istog dana. Cena i program se potvrđuju upitom.",
    program: [
      "Jutarnji polazak iz Niša",
      "Slobodno vreme u Beogradu",
      "Povratak uveče",
    ],
    included: ["Prevoz"],
    excluded: ["Obroci", "Ulaznice", "Lični troškovi"],
    demo: true,
  },
  {
    id: "bec-vikend-demo",
    slug: "bec-vikend",
    title: "Beč — vikend",
    destination: "Beč",
    country: "Austrija",
    category: "evropa",
    departureDate: "2026-06-12",
    returnDate: "2026-06-15",
    durationLabel: "3 noći",
    departurePlace: "Niš",
    priceFrom: null,
    currency: "EUR",
    image: "/images/dest-canj.jpg",
    gallery: ["/images/dest-canj.jpg", "/images/dest-olympic-beach.jpg"],
    summary:
      "DEMO evropsko vikend putovanje. Termin, smeštaj i cena biće usklađeni sa stvarnom ponudom firme.",
    program: [
      "Polazak iz Niša",
      "Dolazak i smeštaj",
      "Slobodan program / opcione ture",
      "Povratak",
    ],
    included: ["Prevoz"],
    excluded: ["Smeštaj (ukoliko nije uključen u finalnu ponudu)", "Ulaznice"],
    demo: true,
  },
];

export function getTripBySlug(slug: string) {
  return trips.find((t) => t.slug === slug);
}

export function formatTripDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("sr-Latn-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatPrice(trip: Trip) {
  if (trip.priceFrom == null) return "Cena na upit";
  return `već od ${trip.priceFrom}€`;
}
