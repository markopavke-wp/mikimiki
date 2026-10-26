import type { Metadata, Viewport } from "next";
import { Manrope, Syne } from "next/font/google";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/hero-scroll.css";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0c0e",
};

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Miki & Miki TRAVEL — Putovanja i prevoz",
    template: "%s · Miki & Miki TRAVEL",
  },
  description:
    "Turistička agencija i prevoznik iz Niša. Putovanja, izleti, prevoz putnika i privatni transferi.",
  metadataBase: new URL("https://mikiimiki.example"),
  openGraph: {
    title: "Miki & Miki TRAVEL",
    description: "Putovanja, izleti i prevoz putnika — od polaska do destinacije.",
    locale: "sr_Latn_RS",
    type: "website",
    images: ["/images/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr-Latn">
      <body className={`${syne.variable} ${manrope.variable} antialiased`}>
        <SmoothScroll>
          <Navbar />
          <main id="top">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
