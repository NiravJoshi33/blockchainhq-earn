import Hero from "@/components/layout/hero";
import HowItWorks from "@/components/layout/how-it-works";
import Stats from "@/components/layout/stats";
import OpportunityTypes from "@/components/layout/opportunity-types";

export default function Home() {
  return (
    <div className="flex max-w-7xl mx-auto min-h-screen flex-col space-y-16">
      {/* Hero - Full viewport height */}
      <section className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <Hero />
      </section>

      {/* Rest of the sections */}
      <Stats />
      <OpportunityTypes />
      <HowItWorks />
    </div>
  );
}
