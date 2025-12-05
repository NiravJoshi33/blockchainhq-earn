import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hash, ExternalLink } from "lucide-react";

interface TransactionDetailsCardProps {
  transactionHash?: string | null;
  contractBountyId?: string | null;
}

export function TransactionDetailsCard({ 
  transactionHash, 
  contractBountyId 
}: TransactionDetailsCardProps) {
  if (!transactionHash) return null;

  return (
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
              href={`https://testnet.bscscan.com/tx/${transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1 text-sm font-mono"
            >
              {transactionHash.slice(0, 10)}...
              {transactionHash.slice(-8)}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          {contractBountyId && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Contract Bounty ID:
              </span>
              <span className="text-sm font-mono">
                #{contractBountyId}
              </span>
            </div>
          )}
        </div>
        <div className="pt-2 border-t">
          <a
            href={`https://testnet.bscscan.com/tx/${transactionHash}`}
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
  );
}

