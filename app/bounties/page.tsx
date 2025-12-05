import { columns, Bounty } from "./columns";
import { DataTable } from "./data-table";
import { getOpportunities } from "@/lib/supabase/services/opportunities";
import type { Database } from "@/lib/supabase/database.types";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];

async function getData(): Promise<Bounty[]> {
  const opportunities = await getOpportunities({ 
    status: "active",
    type: "bounty"
  });

  return opportunities.map((opp: OpportunityRow) => ({
    id: opp.id,
    title: opp.title,
    organization: opp.organization || "Unknown",
    amount: opp.amount || 0,
    deadline: opp.deadline ? new Date(opp.deadline).getTime() : Date.now(),
    url: `/opportunities/${opp.id}`,
  }));
}

export default async function BountiesPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Bounties</h1>
        <p className="text-muted-foreground">
          Discover and apply for bounties from top Web3 projects
        </p>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
