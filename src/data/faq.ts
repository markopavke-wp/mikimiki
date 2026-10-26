export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  needsCompanyRules?: boolean;
};

export const faqs: FaqItem[] = [
  {
    id: "rezervacija",
    question: "Kako rezervišem putovanje ili prevoz?",
    answer:
      "Pošaljite upit putem forme na sajtu ili nas kontaktirajte telefon/emailom. Potvrdićemo dostupnost, cenu i uslove, a zatim dogovoriti rezervaciju.",
  },
  {
    id: "uplata",
    question: "Kada i kako se plaća?",
    answer:
      "Način i rokovi uplate zavise od tipa usluge i termina. [ZA DOPUNU: precizna pravila uplate, avans i otkazivanje prema politici firme.]",
    needsCompanyRules: true,
  },
  {
    id: "prtljag",
    question: "Koliko prtljaga mogu da ponesem?",
    answer:
      "Standardno se računa na razuman ručni i jedan veći kofer po putniku, ali tačan limit zavisi od broja putnika i tipa vozila. [ZA DOPUNU: zvanična pravila prtljaga.]",
    needsCompanyRules: true,
  },
  {
    id: "polazak",
    question: "Gde su mesta polaska?",
    answer:
      "Za demo ponude naveden je Niš kao polazište. Tačna stajališta i vreme potvrđuju se pri rezervaciji.",
  },
  {
    id: "privatni-prevoz",
    question: "Da li radite privatne transfere?",
    answer:
      "Da — privatni i grupni transferi, aerodromski transferi i prevoz po dogovoru. Pošaljite polazište, odredište i datum za ponudu.",
  },
  {
    id: "deca",
    question: "Da li su dostupna sedišta za decu?",
    answer:
      "[ZA DOPUNU: politika sedišta za decu / buster / autosedište prema pravilima firme.]",
    needsCompanyRules: true,
  },
];
