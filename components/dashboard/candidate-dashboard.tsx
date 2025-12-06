"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Briefcase,
  Heart,
  CheckCircle,
  DollarSign,
  Target,
  Award,
  AlertCircle,
  ArrowRight,
  Calendar,
  MapPin,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useUser } from "@/contexts/user-context";
import { useWallets } from "@privy-io/react-auth";
import { getUserStatistics } from "@/lib/supabase/services/statistics";
import { formatTimeAgo } from "@/lib/utils";
import { getUserApplications } from "@/lib/supabase/services/applications";
import { getSavedOpportunities } from "@/lib/supabase/services/saved-opportunities";
import { getOpportunities } from "@/lib/supabase/services/opportunities";
import type { Database } from "@/lib/supabase/database.types";

type OpportunityRow = Database["public"]["Tables"]["opportunities"]["Row"];
type ApplicationRow = Database["public"]["Tables"]["applications"]["Row"] & {
  opportunity: OpportunityRow;
};
type SavedOpportunityRow =
  Database["public"]["Tables"]["saved_opportunities"]["Row"] & {
    opportunity: OpportunityRow;
  };
import { TelegramConnect } from "@/components/profile/telegram-connect";

export function CandidateDashboard() {
  const { user } = useUser();
  const { wallets } = useWallets();
  const [userStats, setUserStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [savedOpportunities, setSavedOpportunities] = useState<
    SavedOpportunityRow[]
  >([]);
  const [recommendedOpportunities, setRecommendedOpportunities] = useState<
    OpportunityRow[]
  >([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch all data
  useEffect(() => {
    async function fetchAllData() {
      if (!user?.id) {
        setLoadingData(false);
        setLoadingStats(false);
        return;
      }

      setLoadingData(true);
      setLoadingStats(true);

      try {
        const walletAddress = user?.wallet_address || wallets?.[0]?.address;
        if (walletAddress) {
          const stats = await getUserStatistics(walletAddress);
          setUserStats(stats);
        }

        const apps = await getUserApplications(user.id);
        setApplications(apps || []);

        const saved = await getSavedOpportunities(user.id);
        setSavedOpportunities(saved || []);

        if (user.skills && user.skills.length > 0) {
          const allOpps = await getOpportunities({ status: "active" });
          const recommended = allOpps
            .filter((opp) => {
              if (!opp.required_skills || opp.required_skills.length === 0)
                return false;
              return opp.required_skills.some((skill) =>
                user.skills?.some(
                  (userSkill) =>
                    skill.toLowerCase().includes(userSkill.toLowerCase()) ||
                    userSkill.toLowerCase().includes(skill.toLowerCase())
                )
              );
            })
            .slice(0, 3);
          setRecommendedOpportunities(recommended);
        }
      } catch (error) {
      } finally {
        setLoadingData(false);
        setLoadingStats(false);
      }
    }

    if (user) {
      fetchAllData();
    }
  }, [user, wallets]);

  const activeApplications = applications.filter(
    (app) => app.status === "pending" || app.status === "reviewing"
  ).length;

  const completedApplications = applications.filter(
    (app) => app.status === "accepted" || app.status === "completed"
  ).length;

  const userData = {
    name: user?.name || "User",
    skills: user?.skills || [],
    completionRate:
      userStats && userStats.submissions > 0
        ? Math.round((userStats.wins / userStats.submissions) * 100)
        : 0,
    totalEarnings: userStats?.totalEarnings || 0,
    activeApplications,
    savedOpportunities: savedOpportunities.length,
    completedBounties: userStats?.wins || 0,
    participations: userStats?.participations || 0,
    submissions: userStats?.submissions || 0,
  };

  const recentApplications = applications
    .filter((app) => app.status === "pending" || app.status === "reviewing")
    .slice(0, 5);

  const savedOppsList = savedOpportunities
    .slice(0, 5)
    .map((saved) => saved.opportunity)
    .filter((opp) => opp !== null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
      case "reviewing":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
      case "accepted":
        return "bg-green-500/10 text-green-600 dark:text-green-400";
      case "rejected":
        return "bg-red-500/10 text-red-600 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userData.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Track your applications and discover new opportunities
          </p>
        </div>
        <Link href="/opportunities">
          <Button size="lg">
            <Target className="mr-2 h-4 w-4" />
            Browse Opportunities
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Applications
            </CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.activeApplications}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  $
                  {userData.totalEarnings.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {userData.completedBounties} wins
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Opportunities
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData.savedOpportunities}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Bookmarked for later
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{userData.submissions}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {userData.participations} participations
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <div>
              <h3 className="font-semibold">Complete your profile</h3>
              <p className="text-sm text-muted-foreground">
                Increase your chances by 40% - add your portfolio and experience
              </p>
            </div>
          </div>
          <Link href="/profile">
            <Button variant="outline">Complete Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Telegram Connect */}
      <TelegramConnect />

      {/* Main Content with Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Applications</CardTitle>
              <CardDescription>
                Track the status of your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="saved">Saved</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Loading applications...
                      </p>
                    </div>
                  ) : recentApplications.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No active applications yet</p>
                      <Link href="/opportunities">
                        <Button variant="outline" className="mt-4">
                          Browse Opportunities
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      {recentApplications.map((application) => (
                        <Link
                          key={application.id}
                          href={`/opportunities/${application.opportunity.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {application.opportunity.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>
                                      {application.opportunity.organization}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(
                                    application.status || "pending"
                                  )}
                                >
                                  {application.status || "pending"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    Applied{" "}
                                    {formatTimeAgo(application.created_at)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>
                                    $
                                    {application.opportunity.amount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              View
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Link>
                      ))}
                      {applications.length > 5 && (
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          asChild
                        >
                          <Link href="/dashboard?tab=applications">
                            View All Applications
                          </Link>
                        </Button>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="saved" className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Loading saved opportunities...
                      </p>
                    </div>
                  ) : savedOppsList.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No saved opportunities yet</p>
                      <Link href="/opportunities">
                        <Button variant="outline" className="mt-4">
                          Browse Opportunities
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    savedOppsList.map((opportunity) => (
                      <Link
                        key={opportunity.id}
                        href={`/opportunities/${opportunity.id}`}
                        className="block"
                      >
                        <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1 space-y-2">
                            <div>
                              <h4 className="font-semibold">
                                {opportunity.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>{opportunity.organization}</span>
                                {opportunity.type === "job" &&
                                  opportunity.location && (
                                    <>
                                      <span>•</span>
                                      <MapPin className="h-3.5 w-3.5" />
                                      <span>{opportunity.location}</span>
                                    </>
                                  )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {opportunity.type}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                ${opportunity.amount.toLocaleString()}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" onClick={(e) => e.preventDefault()}>
                            View
                          </Button>
                        </div>
                      </Link>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                  {loadingData ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Loading completed applications...
                      </p>
                    </div>
                  ) : completedApplications === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No completed applications yet</p>
                    </div>
                  ) : (
                    applications
                      .filter(
                        (app) =>
                          app.status === "accepted" ||
                          app.status === "completed"
                      )
                      .map((application) => (
                        <Link
                          key={application.id}
                          href={`/opportunities/${application.opportunity.id}`}
                          className="block"
                        >
                          <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-semibold">
                                    {application.opportunity.title}
                                  </h4>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span>
                                      {application.opportunity.organization}
                                    </span>
                                  </div>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(
                                    application.status || "completed"
                                  )}
                                >
                                  {application.status || "completed"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>
                                    Applied{" "}
                                    {formatTimeAgo(application.created_at)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3.5 w-3.5" />
                                  <span>
                                    $
                                    {application.opportunity.amount.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              View
                              <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </Link>
                      ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommended for You
              </CardTitle>
              <CardDescription>
                Based on your skills and interests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingData ? (
                <div className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Loading recommendations...
                  </p>
                </div>
              ) : recommendedOpportunities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No recommendations available</p>
                  <Link href="/opportunities">
                    <Button variant="outline" size="sm" className="mt-2">
                      Browse All
                    </Button>
                  </Link>
                </div>
              ) : (
                <>
                  {recommendedOpportunities.map((opportunity) => (
                    <Link
                      key={opportunity.id}
                      href={`/opportunities/${opportunity.id}`}
                      className="block"
                    >
                      <div className="p-3 border rounded-lg hover:bg-accent/50 transition-colors space-y-2">
                        <h4 className="font-semibold text-sm leading-tight">
                          {opportunity.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{opportunity.organization}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-green-600">
                            ${opportunity.amount.toLocaleString()}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.preventDefault()}
                          >
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/opportunities">
                    <Button variant="outline" className="w-full">
                      See All Recommendations
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm">
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Application accepted</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Logo design bounty • 2 days ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">New application submitted</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      NFT minting dApp • 5 days ago
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <div className="bg-purple-500/10 p-2 rounded-full">
                    <Heart className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Saved opportunity</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      DAO governance dashboard • 1 week ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Applications sent
                </span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Response rate
                </span>
                <span className="font-semibold">67%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Avg. response time
                </span>
                <span className="font-semibold">3 days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Earned</span>
                <span className="font-semibold text-green-600">$2,500</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
