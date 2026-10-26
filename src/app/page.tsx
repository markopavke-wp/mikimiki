import { HeroScroll } from "@/components/hero/HeroScroll";
import { SearchPanel } from "@/components/search/SearchPanel";
import { TripsSection } from "@/components/trips/TripsSection";
import { TransportSection } from "@/components/transport/TransportSection";
import { FleetSection } from "@/components/fleet/FleetSection";
import { AboutSection } from "@/components/about/AboutSection";
import { FaqSection } from "@/components/faq/FaqSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default function HomePage() {
  return (
    <>
      <HeroScroll />
      <div className="site-after-hero">
        <SearchPanel />
        <TripsSection limit={6} />
        <TransportSection />
        <FleetSection />
        <AboutSection />
        <FaqSection />
        <ContactSection />
      </div>
    </>
  );
}
