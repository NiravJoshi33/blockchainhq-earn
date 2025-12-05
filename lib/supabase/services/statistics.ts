import { supabase } from "../client";
import { createPublicClient, http } from "viem";
import { bscTestnet } from "viem/chains";
import {
  blockchainBountyAddress,
  blockchainBountyAbi,
} from "@/components/providers/contract-abi";

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(),
});

/**
 * Get statistics for a sponsor
 * @param sponsorId - The sponsor's user ID
 * @returns Statistics including opportunities created count
 */
export async function getSponsorStatistics(sponsorId: string) {
  try {
    // Get all opportunities created by this sponsor
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("id, contract_bounty_id, amount, currency")
      .eq("sponsor_id", sponsorId);

    if (error) throw error;

    const opportunitiesCreated = opportunities?.length || 0;
    
    // Calculate total budget allocated
    const totalBudget = opportunities?.reduce((sum, opp) => sum + (opp.amount || 0), 0) || 0;

    // Count active opportunities (deadline not passed)
    const now = new Date();
    const { data: activeOpportunities } = await supabase
      .from("opportunities")
      .select("id")
      .eq("sponsor_id", sponsorId)
      .gt("deadline", now.toISOString());

    const activeCount = activeOpportunities?.length || 0;

    return {
      opportunitiesCreated,
      totalBudget,
      activeOpportunities: activeCount,
      completedOpportunities: opportunitiesCreated - activeCount,
    };
  } catch (error) {
    console.error("Error fetching sponsor statistics:", error);
    return {
      opportunitiesCreated: 0,
      totalBudget: 0,
      activeOpportunities: 0,
      completedOpportunities: 0,
    };
  }
}

/**
 * Get statistics for a user/hunter
 * @param walletAddress - The user's wallet address
 * @returns Statistics including participations and submissions count
 */
export async function getUserStatistics(walletAddress: string) {
  try {
    if (!walletAddress) {
      return {
        participations: 0,
        submissions: 0,
        wins: 0,
        totalEarnings: 0,
      };
    }

    // Get all opportunities with contract_bounty_id
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("id, contract_bounty_id, amount, currency")
      .not("contract_bounty_id", "is", null);

    if (error) throw error;

    if (!opportunities || opportunities.length === 0) {
      return {
        participations: 0,
        submissions: 0,
        wins: 0,
        totalEarnings: 0,
      };
    }

    let submissions = 0;
    let wins = 0;
    let totalEarnings = 0;
    const participatedBounties = new Set<string>();

    // Check each opportunity for submissions
    for (const opp of opportunities) {
      if (!opp.contract_bounty_id) continue;

      try {
        // Get submission count for this bounty
        const submissionCount = await publicClient.readContract({
          address: blockchainBountyAddress as `0x${string}`,
          abi: blockchainBountyAbi,
          functionName: "getSubmissionCount",
          args: [BigInt(opp.contract_bounty_id)],
        });

        const count = typeof submissionCount === 'bigint' 
          ? Number(submissionCount) 
          : Number(submissionCount);

        if (count === 0) continue;

        // Check each submission to see if this user submitted
        for (let i = 0; i < count; i++) {
          try {
            const submission = await publicClient.readContract({
              address: blockchainBountyAddress as `0x${string}`,
              abi: blockchainBountyAbi,
              functionName: "getSubmission",
              args: [BigInt(opp.contract_bounty_id), BigInt(i)],
            });

            if (Array.isArray(submission)) {
              const submitter = submission[1]?.toLowerCase();
              const isWinner = submission[10];
              const rank = submission[11];

              if (submitter === walletAddress.toLowerCase()) {
                submissions++;
                participatedBounties.add(opp.contract_bounty_id);
                
                if (isWinner && rank > 0) {
                  wins++;
                  // Calculate earnings based on rank and prize distribution
                  // This is approximate - actual earnings would need prize_distribution from DB
                  const prizeDist = (opp as any)?.prize_distribution || {
                    first: 50,
                    second: 30,
                    third: 20,
                  };
                  
                  let percentage = 0;
                  if (rank === 1) percentage = prizeDist.first || 50;
                  else if (rank === 2) percentage = prizeDist.second || 30;
                  else if (rank === 3) percentage = prizeDist.third || 20;
                  
                  totalEarnings += (opp.amount || 0) * (percentage / 100);
                }
              }
            }
          } catch (submissionError) {
            // Skip if submission read fails
            console.warn(`Failed to read submission ${i} for bounty ${opp.contract_bounty_id}:`, submissionError);
          }
        }
      } catch (bountyError) {
        // Skip if bounty read fails
        console.warn(`Failed to read bounty ${opp.contract_bounty_id}:`, bountyError);
      }
    }

    return {
      participations: participatedBounties.size,
      submissions,
      wins,
      totalEarnings,
    };
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    return {
      participations: 0,
      submissions: 0,
      wins: 0,
      totalEarnings: 0,
    };
  }
}

