import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Target } from "lucide-react";

interface SponsorStatisticsCardProps {
  stats: {
    opportunitiesCreated?: number;
    activeOpportunities?: number;
    totalBudget?: number;
    completedOpportunities?: number;
  } | null;
  loading?: boolean;
}

export function SponsorStatisticsCard({ stats, loading }: SponsorStatisticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Sponsor Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Opportunities Created</span>
              <span className="text-2xl font-bold">{stats?.opportunitiesCreated || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Opportunities</span>
              <span className="text-2xl font-bold">{stats?.activeOpportunities || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Budget</span>
              <span className="text-2xl font-bold">${(stats?.totalBudget || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="text-2xl font-bold">{stats?.completedOpportunities || 0}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

