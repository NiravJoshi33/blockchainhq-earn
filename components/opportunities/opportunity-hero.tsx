import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Award, Users, Clock, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { ApplicantCount } from "./applicant-count";
import type { Database } from "@/lib/supabase/database.types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

interface OpportunityHeroProps {
  opportunity: Opportunity;
  daysLeft: number;
  deadline: Date;
}

export function OpportunityHero({ opportunity, daysLeft, deadline }: OpportunityHeroProps) {
  return (
    <div className="space-y-4 flex-1">
      <div className="flex flex-wrap gap-2">
        <Badge variant="default" className="capitalize">
          {opportunity.type}
        </Badge>
        <Badge variant="secondary">
          {opportunity.difficulty_level}
        </Badge>
        {opportunity.category && (
          <Badge variant="outline">{opportunity.category}</Badge>
        )}
        <Badge variant="outline">{opportunity.status}</Badge>
      </div>

      <h1 className="text-4xl font-bold tracking-tight">
        {opportunity.title}
      </h1>

      <div className="flex items-center gap-4 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          <span className="text-lg">{opportunity.organization}</span>
        </div>
        {opportunity.type === "job" && opportunity.location && (
          <>
            <span>•</span>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{opportunity.location}</span>
            </div>
          </>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
          <Award className="h-8 w-8 text-primary shrink-0" />
          <div>
            <div className="text-2xl font-bold">
              ${opportunity.amount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {opportunity.currency}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
          <Users className="h-8 w-8 text-primary shrink-0" />
          <div>
            <div className="text-2xl font-bold">
              <ApplicantCount opportunity={opportunity} />
            </div>
            <p className="text-xs text-muted-foreground">Applicants</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
          <Clock className="h-8 w-8 text-primary shrink-0" />
          <div>
            <div
              className={cn(
                "text-2xl font-bold",
                daysLeft < 7 && daysLeft > 0 && "text-orange-500",
                daysLeft <= 0 && "text-red-500"
              )}
            >
              {daysLeft > 0 ? `${daysLeft}d` : "Ended"}
            </div>
            <p className="text-xs text-muted-foreground">Time Left</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
          <Calendar className="h-8 w-8 text-primary shrink-0" />
          <div>
            <div className="text-sm font-bold">
              {deadline.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Deadline</p>
          </div>
        </div>
      </div>
    </div>
  );
}

