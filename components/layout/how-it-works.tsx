import { Search, Wrench, Coins } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      title: "Browse Opportunities",
      description:
        "Explore hackathons, bounties, and jobs from top Web3 projects",
      icon: Search,
    },
    {
      number: "02",
      title: "Apply & Build",
      description:
        "Submit your application and start working on exciting projects",
      icon: Wrench,
    },
    {
      number: "03",
      title: "Get Rewarded",
      description: "Earn crypto rewards and build your Web3 reputation",
      icon: Coins,
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-16 px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12">
          How It <span className="text-brand">Works</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <div className="mb-4 text-brand">
                <step.icon size={64} strokeWidth={1.5} />
              </div>
              <div className="text-brand text-2xl font-bold mb-2">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
