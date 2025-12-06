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

export async function getSponsorStatistics(sponsorId: string) {
  try {
    const { data: opportunities, error } = await supabase
      .from("opportunities")
      .select("id, contract_bounty_id, amount, currency")
      .eq("sponsor_id", sponsorId);

    if (error) throw error;

    const opportunitiesCreated = opportunities?.length || 0;
    
    const totalBudget = opportunities?.reduce((sum, opp) => sum + ((opp as any).amount || 0), 0) || 0;

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
    return {
      opportunitiesCreated: 0,
      totalBudget: 0,
      activeOpportunities: 0,
      completedOpportunities: 0,
    };
  }
}

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

    for (const opp of opportunities) {
      const oppAny = opp as any;
      if (!oppAny.contract_bounty_id) continue;

      try {
        const submissionCount = await publicClient.readContract({
          address: blockchainBountyAddress as `0x${string}`,
          abi: blockchainBountyAbi,
          functionName: "getSubmissionCount",
          args: [BigInt(oppAny.contract_bounty_id)],
        });

        const count = typeof submissionCount === 'bigint' 
          ? Number(submissionCount) 
          : Number(submissionCount);

        if (count === 0) continue;

        for (let i = 0; i < count; i++) {
          try {
            const submission = await publicClient.readContract({
              address: blockchainBountyAddress as `0x${string}`,
              abi: blockchainBountyAbi,
              functionName: "getSubmission",
              args: [BigInt(oppAny.contract_bounty_id), BigInt(i)],
            });

            if (Array.isArray(submission)) {
              const submitter = submission[1]?.toLowerCase();
              const isWinner = submission[10];
              const rank = submission[11];

              if (submitter === walletAddress.toLowerCase()) {
                submissions++;
                participatedBounties.add(oppAny.contract_bounty_id);
                
                if (isWinner && rank > 0) {
                  wins++;
                  const prizeDist = oppAny?.prize_distribution || {
                    first: 50,
                    second: 30,
                    third: 20,
                  };
                  
                  let percentage = 0;
                  if (rank === 1) percentage = prizeDist.first || 50;
                  else if (rank === 2) percentage = prizeDist.second || 30;
                  else if (rank === 3) percentage = prizeDist.third || 20;
                  
                  totalEarnings += (oppAny.amount || 0) * (percentage / 100);
                }
              }
            }
          } catch (submissionError) {
          }
        }
      } catch (bountyError) {
      }
    }

    return {
      participations: participatedBounties.size,
      submissions,
      wins,
      totalEarnings,
    };
  } catch (error) {
    return {
      participations: 0,
      submissions: 0,
      wins: 0,
      totalEarnings: 0,
    };
  }
}

