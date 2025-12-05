"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContractBalance } from "@/lib/contract/use-contract-categories";
import { Loader2, Wallet } from "lucide-react";
import { formatEther } from "viem";

export function ContractBalanceCard() {
  const { balance, balanceInEth, isLoading } = useContractBalance();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Contract Balance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="text-2xl font-bold">
              {balance ? formatEther(balance) : "0"} BNB
            </div>
            <p className="text-xs text-muted-foreground">
              Total funds locked in contract
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

