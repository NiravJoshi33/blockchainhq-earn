import { supabase } from "../client";

export interface PlatformStats {
  totalRewards: number;
  activeOpportunities: number;
  totalBuilders: number;
  partnerProjects: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    // Get total rewards (sum of all opportunity amounts)
    const { data: rewardsData, error: rewardsError } = await supabase
      .from("opportunities")
      .select("amount");

    if (rewardsError) throw rewardsError;

    const totalRewards =
      rewardsData?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;

    // Get active opportunities count (status = 'active')
    const { count: activeCount, error: activeError } = await supabase
      .from("opportunities")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    if (activeError) throw activeError;

    // Get total builders (users count)
    const { count: buildersCount, error: buildersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (buildersError) throw buildersError;

    // Get unique partner projects (distinct organizations)
    const { data: orgsData, error: orgsError } = await supabase
      .from("opportunities")
      .select("organization");

    if (orgsError) throw orgsError;

    const uniqueOrgs = new Set(orgsData?.map((o) => o.organization) || []);
    const partnerProjects = uniqueOrgs.size;

    return {
      totalRewards,
      activeOpportunities: activeCount || 0,
      totalBuilders: buildersCount || 0,
      partnerProjects,
    };
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    // Return default values on error
    return {
      totalRewards: 0,
      activeOpportunities: 0,
      totalBuilders: 0,
      partnerProjects: 0,
    };
  }
}

export function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  } else if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}
