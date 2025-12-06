import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, X } from "lucide-react";
import { toast } from "sonner";

interface OpportunityActionButtonsProps {
  role?: string;
  isDeadlinePassed: boolean;
  authenticated: boolean;
  contractBountyId?: string | null;
  isCreator: boolean;
  isBountyClosed: boolean;
  isSubmitting: boolean;
  isRefundPending: boolean;
  isCancelPending: boolean;
  hasWinners?: boolean;
  opportunityStatus?: string | null;
  onWithdraw: () => void;
  onCancel: () => void;
  onSubmitClick: () => void;
}

export function OpportunityActionButtons({
  role,
  isDeadlinePassed,
  authenticated,
  contractBountyId,
  isCreator,
  isBountyClosed,
  isSubmitting,
  isRefundPending,
  isCancelPending,
  hasWinners,
  opportunityStatus,
  onWithdraw,
  onCancel,
  onSubmitClick,
}: OpportunityActionButtonsProps) {
  const isCancelled = opportunityStatus === "cancelled";
  const canCancel = isCreator && !isBountyClosed && !hasWinners && !isCancelled && 
    (contractBountyId ? isDeadlinePassed : true);

  return (
    <div className="flex items-center gap-3 shrink-0" style={{ position: 'relative', zIndex: 10 }}>
      {role === "hunter" && !isDeadlinePassed && opportunityStatus !== "cancelled" && (
        <Button 
          size="lg" 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!authenticated) {
              toast.error("Please connect your wallet first");
              return;
            }
            
            if (!contractBountyId) {
              toast.error("This opportunity is not available for on-chain submission");
              return;
            }
            
            onSubmitClick();
          }}
          style={{ 
            pointerEvents: 'auto',
            cursor: 'pointer',
            position: 'relative',
            zIndex: 10
          }}
        >
          Submit Now
        </Button>
      )}
      {isCreator && isDeadlinePassed && contractBountyId && !isBountyClosed && (
        <Button 
          size="lg" 
          variant="outline"
          onClick={onWithdraw}
          disabled={isSubmitting || isRefundPending || isCancelPending}
        >
          <Wallet className="h-4 w-4 mr-2" />
          {isSubmitting || isRefundPending || isCancelPending 
            ? "Processing..." 
            : "Withdraw Funds"}
        </Button>
      )}
      {canCancel && (
        <Button 
          size="lg" 
          variant="destructive"
          onClick={onCancel}
          disabled={isSubmitting || isRefundPending || isCancelPending}
        >
          <X className="h-4 w-4 mr-2" />
          {isSubmitting || isRefundPending || isCancelPending 
            ? "Processing..." 
            : contractBountyId ? "Cancel & Withdraw" : "Cancel Opportunity"}
        </Button>
      )}
      {isCreator && isDeadlinePassed && contractBountyId && isBountyClosed && (
        <Badge variant="secondary" className="px-4 py-2">
          Funds Withdrawn
        </Badge>
      )}
      {isCancelled && (
        <Badge variant="destructive" className="px-4 py-2">
          Cancelled
        </Badge>
      )}
    </div>
  );
}

