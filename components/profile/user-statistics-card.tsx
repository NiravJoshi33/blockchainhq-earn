import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, DollarSign } from "lucide-react";

interface UserStatisticsCardProps {
  stats: {
    participations?: number;
    submissions?: number;
    wins?: number;
    totalEarnings?: number;
  } | null;
  loading?: boolean;
}

export function UserStatisticsCard({ stats, loading }: UserStatisticsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Participation Statistics
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
              <span className="text-sm text-muted-foreground">Participations</span>
              <span className="text-2xl font-bold">{stats?.participations || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Submissions</span>
              <span className="text-2xl font-bold">{stats?.submissions || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="text-2xl font-bold">{stats?.wins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </span>
              <span className="text-2xl font-bold text-green-600">
                ${(stats?.totalEarnings || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

