import { Card } from "../ui/card";
import Image from "next/image";

const OpportunityTypes = () => {
  const types = [
    {
      title: "Hackathons",
      description:
        "Compete in 24-48 hour coding competitions with prize pools up to $100K",
      image: "/drone-race.svg",
      stats: { count: "50+ Active", reward: "$50K avg" },
    },
    {
      title: "Bounties",
      description:
        "Complete specific tasks and earn rewards for bug fixes, features, and more",
      image: "/awards.svg",
      stats: { count: "300+ Active", reward: "$5K avg" },
    },
    {
      title: "Jobs",
      description:
        "Full-time and contract positions with leading Web3 companies",
      image: "/job.svg",
      stats: { count: "150+ Active", reward: "$100K+ salary" },
    },
  ];

  return (
    <section id="opportunity-types" className="w-full py-16 px-8 bg-muted/30">
      <h2 className="text-4xl font-bold text-center mb-12">
        Explore <span className="text-brand">Opportunities</span>
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {types.map((type) => (
          <Card
            key={type.title}
            className="p-6 hover:border-brand transition-all cursor-pointer"
          >
            <Image
              src={type.image}
              alt={type.title}
              width={80}
              height={80}
              className="mb-4"
            />
            <h3 className="text-2xl font-bold mb-2">{type.title}</h3>
            <p className="text-muted-foreground mb-4">{type.description}</p>
            <div className="flex justify-between text-sm">
              <span className="text-brand font-semibold">
                {type.stats.count}
              </span>
              <span className="text-muted-foreground">{type.stats.reward}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default OpportunityTypes;
