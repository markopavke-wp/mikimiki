export type TransportService = {
  id: string;
  title: string;
  description: string;
  highlights: string[];
};

export const transportServices: TransportService[] = [
  {
    id: "prevoz-putnika",
    title: "Prevoz putnika",
    description:
      "Organizovan prevoz za grupe i individualne putnike — od lokalnih ruta do dužih destinacija, uz jasan dogovor o terminu i mestu polaska.",
    highlights: ["Dogovoreni termini", "Komforan kombi", "Praćenje dogovora do odredišta"],
  },
  {
    id: "aerodromski-transferi",
    title: "Aerodromski transferi",
    description:
      "Transfer do i od aerodroma. Idealno za porodice, poslovne putnike i grupe koje žele pouzdan dolazak bez stresa oko parkiranja.",
    highlights: ["Potražnja po letu", "Pomoć sa prtljagom", "Privatni ili deljeni transfer"],
  },
  {
    id: "privatni-transferi",
    title: "Privatni i grupni transferi",
    description:
      "Od vrata do vrata — privatni transfer za manje grupe ili organizovan prevoz za veće družine i događaje.",
    highlights: ["Fleksibilna ruta", "Više putnika po dogovoru", "Jasna ponuda unapred"],
  },
  {
    id: "prevoz-firme",
    title: "Prevoz za firme",
    description:
      "Prevoz zaposlenih, gostiju i partnera. Prilagodljivo poslovnim terminima i lokacijama — detalji se dogovaraju po projektu.",
    highlights: ["B2B dogovor", "Ponavljajući termini", "Jedna tačka kontakta"],
  },
  {
    id: "najam-sa-vozacem",
    title: "Najam vozila sa vozačem",
    description:
      "Kada vam treba vozilo i vozač za događaj, obilazak ili poseban raspored — bez brige o vožnji i navigaciji.",
    highlights: ["Vozač uključen", "Prilagođen raspored", "Brendirano vozilo"],
  },
];
