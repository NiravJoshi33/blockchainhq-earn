"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Loader2, ExternalLink } from "lucide-react";
import { useReadContract } from "wagmi";
import { blockchainBountyAddress, blockchainBountyAbi } from "@/components/providers/contract-abi";
import { useEffect, useState } from "react";
import { getUserByWalletAddress } from "@/lib/supabase/services/users";
import Link from "next/link";
import { formatEther } from "viem";

interface WinnersCardProps {
  contractBountyId: string | null;
  opportunity: {
    amount: number;
    currency: string;
  };
}

export function WinnersCard({ contractBountyId, opportunity }: WinnersCardProps) {
  const [winnersUsers, setWinnersUsers] = useState<Record<string, any>>({});
  const [loadingUsers, setLoadingUsers] = useState(false);

  const { data: winners, isLoading } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getWinners",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  // Fetch user data for winners
  useEffect(() => {
    async function fetchWinnerUsers() {
      if (!winners || !Array.isArray(winners) || winners.length === 0) {
        return;
      }

      setLoadingUsers(true);
      try {
        const userPromises = winners.map((winner: any) => {
          const address = winner.winner || winner[0];
          return getUserByWalletAddress(address);
        });

        const userResults = await Promise.all(userPromises);
        const usersMap: Record<string, any> = {};
        
        winners.forEach((winner: any, index: number) => {
          const address = (winner.winner || winner[0])?.toLowerCase();
          if (address && userResults[index]) {
            usersMap[address] = userResults[index];
          }
        });

        setWinnersUsers(usersMap);
      } catch (error) {
        console.error("Error fetching winner users:", error);
      } finally {
        setLoadingUsers(false);
      }
    }

    fetchWinnerUsers();
  }, [winners]);

  if (!contractBountyId) return null;
  if (isLoading || loadingUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
            Loading winners...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!winners || !Array.isArray(winners) || winners.length === 0) {
    return null;
  }

  // Sort winners by rank (1st, 2nd, 3rd)
  const sortedWinners = [...winners].sort((a: any, b: any) => {
    const rankA = a.rank || a[1] || 0;
    const rankB = b.rank || b[1] || 0;
    return rankA - rankB;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Winners
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedWinners.map((winner: any, index: number) => {
            const winnerAddress = winner.winner || winner[0];
            const rank = winner.rank || winner[1] || 0;
            const prizeAmount = winner.prizeAmount || winner[2];
            const address = winnerAddress?.toLowerCase();
            const user = address ? winnersUsers[address] : null;

            const rankColors = {
              1: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
              2: "bg-gray-400/10 text-gray-600 border-gray-400/20",
              3: "bg-orange-500/10 text-orange-600 border-orange-500/20",
            };

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Badge
                    variant="outline"
                    className={`${rankColors[rank as keyof typeof rankColors] || ""} font-bold text-lg px-3 py-1`}
                  >
                    #{rank}
                  </Badge>
                  <div className="flex items-center gap-3 flex-1">
                    {user?.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1">
                      {user ? (
                        <Link
                          href={`/profile/${user.id}`}
                          className="font-semibold text-foreground hover:text-primary hover:underline"
                        >
                          {user.name || (user.profile_data as any)?.username || "Unknown User"}
                        </Link>
                      ) : (
                        <span className="font-semibold">Unknown User</span>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <a
                          href={`https://testnet.bscscan.com/address/${winnerAddress}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono hover:underline flex items-center gap-1"
                        >
                          {winnerAddress?.slice(0, 6)}...{winnerAddress?.slice(-4)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {prizeAmount ? formatEther(BigInt(prizeAmount.toString())) : "0"} BNB
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${opportunity.amount.toLocaleString()} {opportunity.currency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

