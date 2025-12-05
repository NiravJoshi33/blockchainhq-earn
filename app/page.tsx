import Hero from "@/components/layout/hero";

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <main className="flex min-h-screen w-full max-w-7xl mx-auto flex-col items-center justify-between py-32 px-16 sm:items-start">
        <Hero />
      </main>
    </div>
  );
}
