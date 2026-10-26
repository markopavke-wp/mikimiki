import type { Metadata } from "next";
import { ContactSection } from "@/components/contact/ContactSection";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Pošaljite upit za putovanje ili prevoz — Miki & Miki TRAVEL.",
};

export default function KontaktPage() {
  return (
    <div className="pt-16">
      <ContactSection />
    </div>
  );
}
