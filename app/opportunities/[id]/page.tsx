"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOpportunityById } from "@/lib/supabase/services/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Award,
  Briefcase,
  Tag,
  MapPin,
  ExternalLink,
  Hash,
} from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { useRole } from "@/contexts/role-context";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

export default function OpportunityDetailPage() {
  const params = useParams();
  const { role } = useRole();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const data = await getOpportunityById(params.id as string);
        setOpportunity(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunity();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="text-lg">Opportunity not found</div>
        <Link href="/opportunities">
          <Button variant="outline" className="mt-4">
            Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  const deadline = new Date(opportunity.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto py-8 max-w-5xl">
          <div className="flex items-start justify-between gap-6">
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
            </div>

            {role === "hunter" && (
              <Button size="lg" className="shrink-0">
                Submit Now
              </Button>
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
                  {opportunity.applicants_count || 0}
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
      </div>

      {/* Content */}
      <div className="container mx-auto py-8 max-w-5xl space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Description */}
        {opportunity.detailed_description && (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.detailed_description} />
            </CardContent>
          </Card>
        )}

        {/* Required Skills */}
        {opportunity.required_skills &&
          opportunity.required_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Submission Guidelines */}
        {opportunity.submission_guidelines && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.submission_guidelines} />
            </CardContent>
          </Card>
        )}

        {/* About Organization */}
        {opportunity.about_organization && (
          <Card>
            <CardHeader>
              <CardTitle>About {opportunity.organization}</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.about_organization} />
            </CardContent>
          </Card>
        )}

        {/* Contact */}
        {opportunity.contact_email && (
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${opportunity.contact_email}`}
                className="text-primary hover:underline"
              >
                {opportunity.contact_email}
              </a>
            </CardContent>
          </Card>
        )}

        {/* Transaction Details */}
        {(opportunity as any).transaction_hash && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Blockchain Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Transaction Hash:
                  </span>
                  <a
                    href={`https://testnet.bscscan.com/tx/${(opportunity as any).transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm font-mono"
                  >
                    {(opportunity as any).transaction_hash.slice(0, 10)}...
                    {(opportunity as any).transaction_hash.slice(-8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {(opportunity as any).contract_bounty_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Contract Bounty ID:
                    </span>
                    <span className="text-sm font-mono">
                      #{(opportunity as any).contract_bounty_id}
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t">
                <a
                  href={`https://testnet.bscscan.com/tx/${(opportunity as any).transaction_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View on BSCScan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
