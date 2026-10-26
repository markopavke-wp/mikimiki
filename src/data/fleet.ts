export type Vehicle = {
  id: string;
  slug: string;
  name: string;
  type: string;
  capacity: string | null;
  luggage: string | null;
  features: string[];
  images: string[];
  note: string;
  demo: boolean;
};

/**
 * Brendirani beli kombi — bočni / prednji / zadnji kadar.
 * Specifikacije kapaciteta biće dopunjene zvaničnim podacima.
 */
export const fleet: Vehicle[] = [
  {
    id: "beli-kombi",
    slug: "putnicki-kombi",
    name: "Putnički kombi",
    type: "Kombi",
    capacity: null,
    luggage: null,
    features: [
      "Beli brendirani kombi sa logotipom Miki & Miki TRAVEL",
      "Pogodan za prevoz putnika i transfere",
    ],
    images: [
      "/images/fleet/van-side.jpg",
      "/images/fleet/van-front.jpg",
      "/images/fleet/van-rear.jpg",
    ],
    note: "Tačan kapacitet, prostor za prtljag i opremljenost biće dopunjeni kada budu dostupni zvanični podaci o voznom parku.",
    demo: true,
  },
];
