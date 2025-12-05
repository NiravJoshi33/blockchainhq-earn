"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateOpportunityForm } from "@/components/sponsor/create-opportunity-form";
import { OpportunitiesTable } from "@/components/sponsor/opportunities-table";
import { mockOpportunities } from "@/lib/mock-data/opportunities";
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  CheckCircle,
  Clock,
} from "lucide-react";

export function SponsorDashboard() {
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Calculate stats from mock data (in real app, this would come from API)
  const activeOpportunities = mockOpportunities.filter(
    (o) => o.status === "active"
  ).length;
  const totalApplicants = mockOpportunities.reduce(
    (sum, o) => sum + (o.applicants || 0),
    0
  );
  const totalBudget = mockOpportunities.reduce((sum, o) => sum + o.amount, 0);
  const completedOpportunities = mockOpportunities.filter(
    (o) => o.status === "completed"
  ).length;

  if (showCreateForm) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowCreateForm(false)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <CreateOpportunityForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sponsor Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your opportunities and track applicants
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Create Opportunity
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Opportunities
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently accepting applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applicants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Allocated across opportunities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedOpportunities}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest updates on your opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 text-sm">
              <div className="bg-green-500/10 p-2 rounded-full">
                <Users className="h-4 w-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  New applicant for NFT minting dApp
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  2 hours ago
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-sm">
              <div className="bg-blue-500/10 p-2 rounded-full">
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  DeFi guide bounty deadline approaching
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  5 hours ago
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 text-sm">
              <div className="bg-purple-500/10 p-2 rounded-full">
                <CheckCircle className="h-4 w-4 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Logo design bounty completed</p>
                <p className="text-muted-foreground text-xs mt-1">1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities Management */}
      <Card>
        <CardHeader>
          <CardTitle>Your Opportunities</CardTitle>
          <CardDescription>
            View and manage all your posted opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="bounty">Bounties</TabsTrigger>
              <TabsTrigger value="job">Jobs</TabsTrigger>
              <TabsTrigger value="project">Projects</TabsTrigger>
              <TabsTrigger value="grant">Grants</TabsTrigger>
              <TabsTrigger value="hackathon">Hackathons</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <OpportunitiesTable opportunities={mockOpportunities} />
            </TabsContent>
            <TabsContent value="bounty">
              <OpportunitiesTable
                opportunities={mockOpportunities.filter(
                  (o) => o.type === "bounty"
                )}
              />
            </TabsContent>
            <TabsContent value="job">
              <OpportunitiesTable
                opportunities={mockOpportunities.filter(
                  (o) => o.type === "job"
                )}
              />
            </TabsContent>
            <TabsContent value="project">
              <OpportunitiesTable
                opportunities={mockOpportunities.filter(
                  (o) => o.type === "project"
                )}
              />
            </TabsContent>
            <TabsContent value="grant">
              <OpportunitiesTable
                opportunities={mockOpportunities.filter(
                  (o) => o.type === "grant"
                )}
              />
            </TabsContent>
            <TabsContent value="hackathon">
              <OpportunitiesTable
                opportunities={mockOpportunities.filter(
                  (o) => o.type === "hackathon"
                )}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
