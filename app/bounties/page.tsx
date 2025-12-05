import { columns, Bounty } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<Bounty[]> {
  // Fetch data from your API here.
  return [
    {
      id: "1",
      title: "Indie.fun Hackathon - $10k+ in prizes (and growing!)",
      organization: "Indie.fun",
      amount: 10000,
      deadline: new Date("2025-12-12").getTime(), // 8 days from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "2",
      title: "Develop Analytics Platform for Xandeum pNodes",
      organization: "Xandeum Labs",
      amount: 5000,
      deadline: new Date("2025-12-20").getTime(), // 16 days from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "3",
      title:
        "Write a X thread about Snark Health Protocol and its upcoming Solana app launch",
      organization: "Snark Health",
      amount: 200,
      deadline: new Date("2025-12-04T18:00:00").getTime(), // 6 hours from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "4",
      title:
        "Alpha Farm Bounty | One-Click On-Chain Yield - No Wallet, No Gas, Pure Alpha",
      organization: "Bybit",
      amount: 1500,
      deadline: new Date("2025-12-04T19:00:00").getTime(), // 7 hours from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "5",
      title: "Write a tweet - Why I want to buy ERA Wallet",
      organization: "Era Wallet",
      amount: 150,
      deadline: new Date("2025-12-04T20:00:00").getTime(), // 8 hours from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "6",
      title: "Create content from the Drift v3 Townhall",
      organization: "Drift",
      amount: 2000,
      deadline: new Date("2025-12-05").getTime(), // 1 day from Dec 4
      url: "https://blockchainhq.xyz",
    },
    {
      id: "7",
      title: "Social Media & Content Intern for Turbine Cash",
      organization: "Seb Monty",
      amount: 1250,
      deadline: new Date("2025-12-05").getTime(), // 1 day from Dec 4
      url: "https://blockchainhq.xyz",
    },
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
