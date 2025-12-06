"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "lucide-react";

const Hero = () => {
  return (
    <section className="w-full px-16 flex flex-row items-center justify-between gap-16">
      {/* left side */}
      <div className="flex flex-col items-start justify-center max-w-xl">
        <h1 className="text-6xl font-bold">
          <span className="text-brand">Earning Opportunities</span> <br />
          in Web3
        </h1>

        <p className="text-lg text-muted-foreground">
          Discover the latest earning opportunities in the blockchain space in{" "}
          <span className="text-brand font-bold">one place</span>
        </p>

        {/* cta button */}
        <Button
          className="mt-8 h-12 font-bold cursor-pointer text-lg hover:bg-brand/90 hover:text-secondary-foreground transition-all duration-300 hover:translate-x-1"
          size="lg"
          onClick={() => {
            window.location.href = "/opportunities";
          }}
        >
          Earn Your First Crypto
          <ArrowRightIcon className="w-8 h-8 font-bold group-hover:translate-x-1 transition-all duration-300" />
        </Button>
      </div>

      {/* right side */}
      <div className="flex flex-col items-center justify-center max-w-xl gap-8 hidden md:flex">
        <div className="flex flex-row items-center justify-start gap-4">
          <Image
            src="/drone-race.svg"
            alt="Drone Race"
            width={150}
            height={150}
            className="animate-float opacity-50 hover:opacity-100 transition-all duration-300 hover:translate-y-1"
          />
          <h2 className="text-2xl font-medium text-muted-foreground">
            Hackathons
          </h2>
        </div>

        <div className="flex flex-row items-center justify-start gap-8">
          <h2 className="text-2xl font-medium text-muted-foreground">
            Bounties
          </h2>
          <Image
            src="/awards.svg"
            alt="Awards"
            width={150}
            height={150}
            className="animate-float opacity-50 hover:opacity-100 transition-all duration-300 hover:translate-y-1"
          />
        </div>

        <div className="flex flex-row items-center justify-start gap-4">
          <Image
            src="/job.svg"
            alt="Jobs"
            width={150}
            height={150}
            className="animate-float opacity-50 hover:opacity-100 transition-all duration-300 hover:translate-y-1"
          />
          <h2 className="text-2xl font-medium text-muted-foreground">Jobs</h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;
