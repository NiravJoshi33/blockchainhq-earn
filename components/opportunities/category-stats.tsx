"use client";

import { useBountyCountByCategory } from "@/lib/contract/use-contract-categories";
import { ContractBountyCategory } from "@/lib/contract/contract-utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface CategoryStatsProps {
  category: ContractBountyCategory;
  label: string;
}

export function CategoryStats({ category, label }: CategoryStatsProps) {
  const { count, isLoading } = useBountyCountByCategory(category);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="text-2xl font-bold">{count}</div>
        )}
      </CardContent>
    </Card>
  );
}

