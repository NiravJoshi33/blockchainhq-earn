"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryStats } from "@/components/opportunities/category-stats";
import { ContractBountyCategory } from "@/lib/contract/contract-utils";
import { useActiveBountiesByCategory } from "@/lib/contract/use-contract-categories";
import { OpportunitiesListingTable } from "@/components/opportunities/opportunities-listing-table";
import { getOpportunities } from "@/lib/supabase/services/opportunities";
import { useEffect } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { Loader2 } from "lucide-react";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];

const categoryLabels: Record<ContractBountyCategory, string> = {
  [ContractBountyCategory.Content]: "Content",
  [ContractBountyCategory.Design]: "Design",
  [ContractBountyCategory.Development]: "Development",
  [ContractBountyCategory.SmartContract]: "Smart Contract",
  [ContractBountyCategory.SocialMedia]: "Social Media",
  [ContractBountyCategory.FullStack]: "Full Stack",
};

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ContractBountyCategory>(
    ContractBountyCategory.Development
  );
  const [opportunities, setOpportunities] = useState<OpportunityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryCounts, setCategoryCounts] = useState<Record<number, number>>({});

  const { bountyIds, isLoading: isLoadingBounties } = useActiveBountiesByCategory(selectedCategory);

  useEffect(() => {
    const initialCounts: Record<number, number> = {};
    Object.values(ContractBountyCategory)
      .filter((cat) => typeof cat === "number")
      .forEach((category) => {
        initialCounts[category as number] = 0;
      });
    setCategoryCounts(initialCounts);
  }, []);

  useEffect(() => {
    async function fetchOpportunities() {
      if (!bountyIds || bountyIds.length === 0) {
        setOpportunities([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const allOpportunities = await getOpportunities({ status: "active" });
        
        const matchingOpportunities = allOpportunities.filter((opp) => {
          const contractBountyId = (opp as any).contract_bounty_id;
          if (!contractBountyId) return false;
          const contractId = BigInt(contractBountyId);
          return bountyIds.some((id) => id === contractId);
        });

        setOpportunities(matchingOpportunities);
        
        setCategoryCounts(prev => ({
          ...prev,
          [selectedCategory]: matchingOpportunities.length
        }));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }

    if (!isLoadingBounties && bountyIds !== undefined) {
      fetchOpportunities();
    }
  }, [bountyIds, isLoadingBounties, selectedCategory]);

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Browse by Category</h1>
        <p className="text-muted-foreground">
          Explore opportunities organized by blockchain categories
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.values(ContractBountyCategory)
          .filter((cat) => typeof cat === "number")
          .map((category) => (
            <CategoryStats
              key={category}
              category={category as ContractBountyCategory}
              label={categoryLabels[category as ContractBountyCategory]}
            />
          ))}
      </div>

      <Tabs
        value={selectedCategory.toString()}
        onValueChange={(value) => setSelectedCategory(Number(value) as ContractBountyCategory)}
        className="w-full"
      >
        <TabsList className="mb-6 w-full justify-start overflow-x-auto">
          {Object.values(ContractBountyCategory)
            .filter((cat) => typeof cat === "number")
            .map((category) => (
              <TabsTrigger
                key={category}
                value={category.toString()}
                className="gap-2 cursor-pointer"
              >
                {categoryLabels[category as ContractBountyCategory]}
                <span className="text-xs opacity-60">
                  ({categoryCounts[category] ?? 0})
                </span>
              </TabsTrigger>
            ))}
        </TabsList>

        <TabsContent value={selectedCategory.toString()} className="space-y-4">
          {isLoadingBounties || loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading opportunities...</p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active opportunities found in this category
            </div>
          ) : (
            <OpportunitiesListingTable opportunities={opportunities} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

