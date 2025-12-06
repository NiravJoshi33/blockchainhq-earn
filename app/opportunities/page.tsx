"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OpportunitiesListingTable } from "@/components/opportunities/opportunities-listing-table";
import { getOpportunities } from "@/lib/supabase/services/opportunities";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OpportunityType } from "@/lib/types/opportunities";
import type { Database } from "@/lib/supabase/database.types";
import { Loader2 } from "lucide-react";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];

export default function OpportunitiesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const typeParam = searchParams.get("type");

  const selectedType: OpportunityType | "all" =
    typeParam &&
    ["bounty", "job", "project", "grant", "hackathon"].includes(typeParam)
      ? (typeParam as OpportunityType)
      : "all";

  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [allOpportunities, setAllOpportunities] = useState<OpportunityRow[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllOpportunities() {
      try {
        const data = await getOpportunities({
          status: "active",
        });
        setAllOpportunities(data || []);
      } catch (error) {}
    }
    fetchAllOpportunities();
  }, []);

  useEffect(() => {
    async function fetchOpportunities() {
      try {
        setLoading(true);
        const data = await getOpportunities({
          type: selectedType === "all" ? undefined : selectedType,
          status: "active",
        });
        setOpportunities(data || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [selectedType]);

  const handleTabChange = (value: string) => {
    if (value === "all") {
      router.push("/opportunities");
    } else {
      router.push(`/opportunities?type=${value}`);
    }
  };

  const filteredOpportunities =
    selectedType === "all"
      ? opportunities
      : opportunities.filter((o) => o.type === selectedType);

  const stats = {
    all: allOpportunities.length,
    bounty: allOpportunities.filter((o) => o.type === "bounty").length,
    job: allOpportunities.filter((o) => o.type === "job").length,
    project: allOpportunities.filter((o) => o.type === "project").length,
    grant: allOpportunities.filter((o) => o.type === "grant").length,
    hackathon: allOpportunities.filter((o) => o.type === "hackathon").length,
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Discover Opportunities</h1>
        <p className="text-muted-foreground">
          {loading
            ? "Loading..."
            : `Showing ${filteredOpportunities.length} of ${opportunities.length} opportunities from top organizations`}
        </p>
      </div>

      <Tabs
        value={selectedType}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6 w-full justify-start">
          <TabsTrigger value="all" className="gap-2">
            All
            <span className="text-xs opacity-60">({stats.all})</span>
          </TabsTrigger>
          <TabsTrigger value="bounty" className="gap-2">
            Bounties
            <span className="text-xs opacity-60">({stats.bounty})</span>
          </TabsTrigger>
          <TabsTrigger value="job" className="gap-2">
            Jobs
            <span className="text-xs opacity-60">({stats.job})</span>
          </TabsTrigger>
          <TabsTrigger value="project" className="gap-2">
            Projects
            <span className="text-xs opacity-60">({stats.project})</span>
          </TabsTrigger>
          <TabsTrigger value="grant" className="gap-2">
            Grants
            <span className="text-xs opacity-60">({stats.grant})</span>
          </TabsTrigger>
          <TabsTrigger value="hackathon" className="gap-2">
            Hackathons
            <span className="text-xs opacity-60">({stats.hackathon})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedType} className="space-y-4">
          {loading ? (
            <div className="text-center py-12 flex flex-row items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
          ) : (
            <OpportunitiesListingTable opportunities={filteredOpportunities} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
