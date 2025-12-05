"use client";

import { useUser } from "@/contexts/user-context";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getSponsorStatistics, getUserStatistics } from "@/lib/supabase/services/statistics";
import { useWallets } from "@privy-io/react-auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { PersonalInfoCard } from "@/components/profile/personal-info-card";
import { SocialLinksCard } from "@/components/profile/social-links-card";
import { WorkInfoCard } from "@/components/profile/work-info-card";
import { SkillsCard } from "@/components/profile/skills-card";
import { SponsorStatisticsCard } from "@/components/profile/sponsor-statistics-card";
import { UserStatisticsCard } from "@/components/profile/user-statistics-card";

export default function ProfilePage() {
  const { user, loading } = useUser();
  const { wallets } = useWallets();
  const [sponsorStats, setSponsorStats] = useState<any>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch statistics - MUST be called before any early returns (Rules of Hooks)
  useEffect(() => {
    async function fetchStats() {
      if (!user?.id) return;
      
      setLoadingStats(true);
      try {
        // Fetch sponsor stats if user is a sponsor
        if (user.role === "sponsor") {
          const stats = await getSponsorStatistics(user.id);
          setSponsorStats(stats);
        }
        
        // Fetch user stats (participations/submissions) if user has wallet
        const walletAddress = user.wallet_address || wallets?.[0]?.address;
        if (walletAddress) {
          const stats = await getUserStatistics(walletAddress);
          setUserStats(stats);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    if (!loading && user) {
      fetchStats();
    }
  }, [user, loading, wallets]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Please connect your wallet to view your profile
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get profile_data from user (it's a JSONB field)
  const profileData = (user as any).profile_data as {
    username?: string;
    linkedin?: string;
    web3Areas?: string;
    workExperience?: string;
    location?: string;
    workPreference?: string;
    proofOfWork?: string[];
  } | null;
  
  const username = profileData?.username || user.name?.toLowerCase().replace(/\s+/g, "-") || "";

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-8">
      <ProfileHeader />

      <PersonalInfoCard user={user} username={username} />

      <SocialLinksCard
        twitterUrl={user.twitter_url}
        githubUrl={user.github_url}
        linkedinUrl={profileData?.linkedin || null}
        portfolioUrl={user.portfolio_url}
      />

      <WorkInfoCard profileData={profileData} />

      <SkillsCard skills={user.skills} />

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {user.role === "sponsor" && (
          <SponsorStatisticsCard stats={sponsorStats} loading={loadingStats} />
        )}

        {(user.role === "hunter" || !user.role) && (
          <UserStatisticsCard stats={userStats} loading={loadingStats} />
        )}
      </div>
    </div>
  );
}
