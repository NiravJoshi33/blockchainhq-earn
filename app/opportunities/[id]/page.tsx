"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getOpportunityById } from "@/lib/supabase/services/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";
import { useRole } from "@/contexts/role-context";
import { useUser } from "@/contexts/user-context";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { toast } from "sonner";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from "wagmi";
import {
  blockchainBountyAddress,
  blockchainBountyAbi,
} from "@/components/providers/contract-abi";
import { useNetworkSwitch } from "@/lib/contract/use-network-switch";
import { getUserByWalletAddress, createUser } from "@/lib/supabase/services/users";
import { supabase } from "@/lib/supabase/client";
import { OpportunityHero } from "@/components/opportunities/opportunity-hero";
import { OpportunityActionButtons } from "@/components/opportunities/opportunity-action-buttons";
import { OpportunityContentCard } from "@/components/opportunities/opportunity-content-card";
import { TransactionDetailsCard } from "@/components/opportunities/transaction-details-card";
import { SubmissionsListCard } from "@/components/opportunities/submissions-list-card";
import { SubmitWorkModal } from "@/components/opportunities/submit-work-modal";
import { SelectWinnersModal } from "@/components/opportunities/select-winners-modal";
import { WinnersCard } from "@/components/opportunities/winners-card";
import { updateOpportunity } from "@/lib/supabase/services/opportunities";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

export default function OpportunityDetailPage() {
  const params = useParams();
  const { role } = useRole();
  const { user } = useUser();
  const { authenticated, user: privyUser } = usePrivy();
  const { wallets } = useWallets();
  const { ensureCorrectNetwork } = useNetworkSwitch();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    submissionLink: "",
    tweetLink: "",
    githubLink: "",
    twitterLink: "",
    videoLink: "",
    indieFunLink: "",
    projectLink: "",
  });
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionUsers, setSubmissionUsers] = useState<Record<string, any>>({});
  const [showSelectWinnersModal, setShowSelectWinnersModal] = useState(false);
  const [selectedWinners, setSelectedWinners] = useState<Array<{ submissionId: number; rank: number; percentage: number }>>([]);

  const { 
    writeContract: writeSubmit, 
    data: submitHash, 
    isPending: isSubmitPending,
    error: submitError 
  } = useWriteContract();
  const { 
    isSuccess: isSubmitConfirmed,
    error: submitReceiptError 
  } = useWaitForTransactionReceipt({
    hash: submitHash,
  });

  const { writeContract: writeRefund, data: refundHash, isPending: isRefundPending } = useWriteContract();
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending } = useWriteContract();
  const { 
    writeContract: writeSelectWinners, 
    data: selectWinnersHash, 
    isPending: isSelectWinnersPending,
    error: selectWinnersError 
  } = useWriteContract();
  const { 
    isSuccess: isSelectWinnersConfirmed,
    error: selectWinnersReceiptError 
  } = useWaitForTransactionReceipt({
    hash: selectWinnersHash,
  });
  const { isSuccess: isRefundConfirmed } = useWaitForTransactionReceipt({
    hash: refundHash,
  });
  const { isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  useEffect(() => {
    if (isCancelConfirmed && cancelHash) {
      toast.success("Opportunity cancelled and funds withdrawn! 🎉", {
        description: `Your staked amount has been refunded.`,
      });
      setIsSubmitting(false);
      if (opportunity) {
        setOpportunity({ ...opportunity, status: "cancelled" });
      }
    }
  }, [isCancelConfirmed, cancelHash, opportunity]);

  const isCreator = user?.id === opportunity?.sponsor_id;
  const contractBountyId = (opportunity as any)?.contract_bounty_id;

  const { data: bountyData } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getBounty",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  const { data: submissionCount } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getSubmissionCount",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  const { data: winners } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getWinners",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  const hasWinners = useMemo(() => {
    if (!winners || !Array.isArray(winners)) return false;
    return winners.length > 0;
  }, [winners]);

  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchSubmissions() {
      if (!contractBountyId || !submissionCount || !publicClient) return;
      
      const count = typeof submissionCount === 'bigint' 
        ? Number(submissionCount) 
        : Number(submissionCount);
      
      if (count === 0) {
        setSubmissions([]);
        return;
      }

      setLoadingSubmissions(true);
      try {
        const submissionPromises = [];
        for (let i = 0; i < count; i++) {
          submissionPromises.push(
            publicClient.readContract({
              address: blockchainBountyAddress as `0x${string}`,
              abi: blockchainBountyAbi,
              functionName: "getSubmission",
              args: [BigInt(contractBountyId), BigInt(i)],
            })
          );
        }
        
        const results = await Promise.all(submissionPromises);
        const formattedSubmissions = results.map((submission, index) => {
          if (Array.isArray(submission)) {
            return {
              id: index,
              bountyId: submission[0],
              submitter: submission[1],
              submissionLink: submission[2],
              tweetLink: submission[3],
              githubLink: submission[4],
              twitterLink: submission[5],
              videoLink: submission[6],
              indieFunLink: submission[7],
              projectLink: submission[8],
              submissionTime: submission[9],
              isWinner: submission[10],
              rank: submission[11],
            };
          }
          return { 
            id: index, 
            bountyId: (submission as any).bountyId,
            submitter: (submission as any).submitter,
            submissionLink: (submission as any).submissionLink,
            tweetLink: (submission as any).tweetLink,
            githubLink: (submission as any).githubLink,
            twitterLink: (submission as any).twitterLink,
            videoLink: (submission as any).videoLink,
            indieFunLink: (submission as any).indieFunLink,
            projectLink: (submission as any).projectLink,
            submissionTime: (submission as any).submissionTime,
            isWinner: (submission as any).isWinner,
            rank: (submission as any).rank,
          };
        });
        
        setSubmissions(formattedSubmissions);
        
        const userPromises = formattedSubmissions.map(async (submission) => {
          try {
            const user = await getUserByWalletAddress(submission.submitter);
            return { address: submission.submitter.toLowerCase(), user };
          } catch (error) {
            return { address: submission.submitter.toLowerCase(), user: null };
          }
        });
        
        const userResults = await Promise.all(userPromises);
        const usersMap: Record<string, any> = {};
        userResults.forEach(({ address, user }) => {
          usersMap[address] = user;
        });
        setSubmissionUsers(usersMap);
      } catch (error) {
      } finally {
        setLoadingSubmissions(false);
      }
    }

    fetchSubmissions();
  }, [contractBountyId, submissionCount, publicClient]);

  const isBountyClosed = useMemo(() => {
    if (!bountyData) return false;
    
    if (Array.isArray(bountyData)) {
      return bountyData[7] === true;
    } else if (typeof bountyData === 'object' && 'isClosed' in bountyData) {
      return bountyData.isClosed === true;
    }
    return false;
  }, [bountyData]);

  useEffect(() => {
    async function fetchOpportunity() {
      try {
        const data = await getOpportunityById(params.id as string);
        setOpportunity(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunity();
  }, [params.id]);

  useEffect(() => {
    async function handleSubmissionSuccess() {
      if (isSubmitConfirmed && submitHash) {
        const walletAddress = wallets[0]?.address;
        
        if (walletAddress) {
          try {
            let dbUser = await getUserByWalletAddress(walletAddress);
            
            if (!dbUser) {
              dbUser = await createUser({
                privy_id: privyUser?.id,
                email: privyUser?.email?.address,
                wallet_address: walletAddress,
                role: "hunter",
              });
            } else if (dbUser && !dbUser.wallet_address) {
              const { updateUserProfile } = await import("@/lib/supabase/services/users");
              const { error: updateError } = await supabase
                .from("users")
                .update({ wallet_address: walletAddress.toLowerCase() })
                .eq("id", dbUser.id);
            }
          } catch (error) {
          }
        }
        
        toast.success("Submission successful! 🎉", {
          description: `Your work has been submitted on-chain.`,
        });
        setShowSubmitModal(false);
        setSubmissionData({
          submissionLink: "",
          tweetLink: "",
          githubLink: "",
          twitterLink: "",
          videoLink: "",
          indieFunLink: "",
          projectLink: "",
        });
        setIsSubmitting(false);
      }
    }
    
    handleSubmissionSuccess();
  }, [isSubmitConfirmed, submitHash, wallets, privyUser, contractBountyId, submissionCount]);

  useEffect(() => {
    if (submitError) {
      toast.error("Failed to submit work", {
        description: submitError.message || "Please try again",
        id: "submit-work",
      });
      setIsSubmitting(false);
    }
  }, [submitError]);

  useEffect(() => {
    if (submitReceiptError) {
      toast.error("Transaction failed", {
        description: submitReceiptError.message || "Please try again",
        id: "submit-work",
      });
      setIsSubmitting(false);
    }
  }, [submitReceiptError]);

  useEffect(() => {
    if (isRefundConfirmed && refundHash) {
      toast.success("Funds withdrawn successfully! 🎉", {
        description: `Your staked amount has been refunded.`,
      });
      setIsSubmitting(false);
    }
  }, [isRefundConfirmed, refundHash]);

  useEffect(() => {
    if (isCancelConfirmed && cancelHash) {
      toast.success("Bounty cancelled and funds withdrawn! 🎉", {
        description: `Your staked amount has been refunded.`,
      });
      setIsSubmitting(false);
    }
  }, [isCancelConfirmed, cancelHash]);

  useEffect(() => {
    if (selectWinnersError) {
      toast.error("Failed to select winners", {
        description: selectWinnersError.message || "Please try again",
        id: "select-winners",
      });
      setIsSubmitting(false);
    }
  }, [selectWinnersError]);

  useEffect(() => {
    if (selectWinnersReceiptError) {
      toast.error("Transaction failed", {
        description: selectWinnersReceiptError.message || "Please try again",
        id: "select-winners",
      });
      setIsSubmitting(false);
    }
  }, [selectWinnersReceiptError]);

  useEffect(() => {
    if (isSelectWinnersConfirmed && selectWinnersHash) {
      toast.dismiss("select-winners");
      toast.success("Winners selected and prizes distributed! 🎉", {
        description: `Prizes have been transferred to the winners.`,
      });
      setShowSelectWinnersModal(false);
      setSelectedWinners([]);
      setIsSubmitting(false);
      if (contractBountyId && submissionCount !== undefined) {
        const fetchSubmissions = async () => {
          if (!publicClient) return;
          const count = typeof submissionCount === 'bigint' 
            ? Number(submissionCount) 
            : Number(submissionCount);
          if (count === 0) return;
          
          try {
            const submissionPromises = [];
            for (let i = 0; i < count; i++) {
              submissionPromises.push(
                publicClient.readContract({
                  address: blockchainBountyAddress as `0x${string}`,
                  abi: blockchainBountyAbi,
                  functionName: "getSubmission",
                  args: [BigInt(contractBountyId), BigInt(i)],
                })
              );
            }
            const results = await Promise.all(submissionPromises);
            const formattedSubmissions = results.map((submission, index) => {
              if (Array.isArray(submission)) {
                return {
                  id: index,
                  bountyId: submission[0],
                  submitter: submission[1],
                  submissionLink: submission[2],
                  tweetLink: submission[3],
                  githubLink: submission[4],
                  twitterLink: submission[5],
                  videoLink: submission[6],
                  indieFunLink: submission[7],
                  projectLink: submission[8],
                  submissionTime: submission[9],
                  isWinner: submission[10],
                  rank: submission[11],
                };
              }
              return { 
                id: index, 
                bountyId: (submission as any).bountyId,
                submitter: (submission as any).submitter,
                submissionLink: (submission as any).submissionLink,
                tweetLink: (submission as any).tweetLink,
                githubLink: (submission as any).githubLink,
                twitterLink: (submission as any).twitterLink,
                videoLink: (submission as any).videoLink,
                indieFunLink: (submission as any).indieFunLink,
                projectLink: (submission as any).projectLink,
                submissionTime: (submission as any).submissionTime,
                isWinner: (submission as any).isWinner,
                rank: (submission as any).rank,
              };
            });
            setSubmissions(formattedSubmissions);
          } catch (error) {
          }
        };
        fetchSubmissions();
      }
    }
  }, [isSelectWinnersConfirmed, selectWinnersHash, contractBountyId, submissionCount, publicClient]);

  const handleSubmitWork = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractBountyId) {
      toast.error("This opportunity is not on-chain");
      return;
    }

    if (!submissionData.submissionLink || !submissionData.githubLink || 
        !submissionData.twitterLink || !submissionData.videoLink || 
        !submissionData.indieFunLink) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      if (!isOnCorrectNetwork) {
        toast.error("Please switch to BNB Testnet to continue");
        setIsSubmitting(false);
        return;
      }

      toast.loading("Submitting work...", { id: "submit-work" });

      writeSubmit({
        address: blockchainBountyAddress as `0x${string}`,
        abi: blockchainBountyAbi,
        functionName: "submitWork",
        args: [
          BigInt(contractBountyId),
          submissionData.submissionLink,
          submissionData.tweetLink || "",
          submissionData.githubLink,
          submissionData.twitterLink,
          submissionData.videoLink,
          submissionData.indieFunLink,
          submissionData.projectLink || "",
        ],
        chainId: 97,
      });

      toast.loading("Waiting for transaction confirmation...", { id: "submit-work" });
    } catch (error: any) {
      toast.error("Failed to submit work", {
        description: error?.message || "Please try again",
        id: "submit-work",
      });
      setIsSubmitting(false);
    }
  };

  const handleSelectWinners = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractBountyId) {
      toast.error("This opportunity is not on-chain");
      return;
    }

    if (!isCreator) {
      toast.error("Only the creator can select winners");
      return;
    }

    if (selectedWinners.length === 0) {
      toast.error("Please select at least one winner");
      return;
    }

    const totalPercentage = selectedWinners.reduce((sum, w) => sum + w.percentage, 0);
    if (totalPercentage !== 100) {
      toast.error("Prize distribution must sum to 100%");
      return;
    }

    setIsSubmitting(true);

    try {
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      if (!isOnCorrectNetwork) {
        toast.error("Please switch to BNB Testnet to continue");
        setIsSubmitting(false);
        return;
      }

      const submissionIds = selectedWinners.map(w => BigInt(w.submissionId));
      const ranks = selectedWinners.map(w => w.rank as 1 | 2 | 3);
      const prizeDistribution = selectedWinners.map(w => BigInt(Math.round(w.percentage * 100)));

      toast.loading("Selecting winners and distributing prizes...", { id: "select-winners" });

      writeSelectWinners({
        address: blockchainBountyAddress as `0x${string}`,
        abi: blockchainBountyAbi,
        functionName: "selectWinners",
        args: [
          BigInt(contractBountyId),
          submissionIds,
          ranks,
          prizeDistribution,
        ],
        chainId: 97,
      });

      toast.loading("Waiting for transaction confirmation...", { id: "select-winners" });
    } catch (error: any) {
      toast.error("Failed to select winners", {
        description: error?.message || "Please try again",
        id: "select-winners",
      });
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractBountyId) {
      toast.error("This opportunity is not on-chain");
      return;
    }

    if (!isCreator) {
      toast.error("Only the creator can withdraw funds");
      return;
    }

    setIsSubmitting(true);

    try {
      const isOnCorrectNetwork = await ensureCorrectNetwork();
      if (!isOnCorrectNetwork) {
        toast.error("Please switch to BNB Testnet to continue");
        setIsSubmitting(false);
        return;
      }

      let totalSubmissions = BigInt(0);
      if (bountyData) {
        if (Array.isArray(bountyData)) {
          totalSubmissions = bountyData[8] || BigInt(0);
        } else if (typeof bountyData === 'object' && 'totalSubmissions' in bountyData) {
          totalSubmissions = BigInt(bountyData.totalSubmissions as string | number | bigint);
        }
      }

      if (totalSubmissions === BigInt(0)) {
        toast.loading("Withdrawing funds...", { id: "withdraw" });
        writeRefund({
          address: blockchainBountyAddress as `0x${string}`,
          abi: blockchainBountyAbi,
          functionName: "refundBounty",
          args: [BigInt(contractBountyId)],
          chainId: 97,
        });
      } else {
        toast.loading("Cancelling bounty and withdrawing funds...", { id: "withdraw" });
        writeCancel({
          address: blockchainBountyAddress as `0x${string}`,
          abi: blockchainBountyAbi,
          functionName: "cancelBounty",
          args: [BigInt(contractBountyId), "Creator withdrawal after deadline"],
          chainId: 97,
        });
      }
    } catch (error: any) {
      toast.error("Failed to withdraw funds", {
        description: error?.message || "Please try again",
        id: "withdraw",
      });
      setIsSubmitting(false);
    }
  };

  const handleCancelOpportunity = async () => {
    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!isCreator) {
      toast.error("Only the creator can cancel this opportunity");
      return;
    }

    if (contractBountyId) {
      if (!isDeadlinePassed) {
        toast.error("Cannot cancel on-chain bounty before deadline");
        return;
      }

      if (hasWinners) {
        toast.error("Cannot cancel: winners have already been selected");
        return;
      }

      if (isBountyClosed) {
        toast.error("This bounty is already closed");
        return;
      }

      if (!confirm("Are you sure you want to cancel this opportunity? This will withdraw your funds and cannot be undone.")) {
        return;
      }

      setIsSubmitting(true);

      try {
        const isOnCorrectNetwork = await ensureCorrectNetwork();
        if (!isOnCorrectNetwork) {
          toast.error("Please switch to BNB Testnet to continue");
          setIsSubmitting(false);
          return;
        }

        let totalSubmissions = BigInt(0);
        if (bountyData) {
          if (Array.isArray(bountyData)) {
            totalSubmissions = bountyData[8] || BigInt(0);
          } else if (typeof bountyData === 'object' && 'totalSubmissions' in bountyData) {
            totalSubmissions = BigInt(bountyData.totalSubmissions as string | number | bigint);
          }
        }

        if (totalSubmissions === BigInt(0)) {
          toast.loading("Cancelling opportunity and withdrawing funds...", { id: "cancel" });
          writeRefund({
            address: blockchainBountyAddress as `0x${string}`,
            abi: blockchainBountyAbi,
            functionName: "refundBounty",
            args: [BigInt(contractBountyId)],
            chainId: 97,
          });
        } else {
          toast.loading("Cancelling opportunity and withdrawing funds...", { id: "cancel" });
          writeCancel({
            address: blockchainBountyAddress as `0x${string}`,
            abi: blockchainBountyAbi,
            functionName: "cancelBounty",
            args: [BigInt(contractBountyId), "Sponsor cancelled - no suitable submissions"],
            chainId: 97,
          });
        }
      } catch (error: any) {
        toast.error("Failed to cancel opportunity", {
          description: error?.message || "Please try again",
          id: "cancel",
        });
        setIsSubmitting(false);
      }
    } else {
      if (!confirm("Are you sure you want to cancel this opportunity? This action cannot be undone.")) {
        return;
      }

      setIsSubmitting(true);

      try {
        await updateOpportunity(opportunity!.id, { status: "cancelled" });
        toast.success("Opportunity cancelled successfully");
        setOpportunity({ ...opportunity!, status: "cancelled" });
      } catch (error: any) {
        toast.error("Failed to cancel opportunity", {
          description: error?.message || "Please try again",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-16 text-center">
        <div className="text-lg">Opportunity not found</div>
        <Link href="/opportunities">
          <Button variant="outline" className="mt-4">
            Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  const deadline = new Date(opportunity.deadline);
  const now = new Date();
  const daysLeft = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isDeadlinePassed = deadline.getTime() < now.getTime();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/30">
        <div className="container mx-auto py-8 max-w-5xl">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <OpportunityHero 
                opportunity={opportunity} 
                daysLeft={daysLeft} 
                deadline={deadline} 
              />
            </div>
            <OpportunityActionButtons
              role={role}
              isDeadlinePassed={isDeadlinePassed}
              authenticated={authenticated}
              contractBountyId={contractBountyId}
              isCreator={isCreator}
              isBountyClosed={isBountyClosed}
              isSubmitting={isSubmitting}
              isRefundPending={isRefundPending}
              isCancelPending={isCancelPending}
              hasWinners={hasWinners}
              opportunityStatus={opportunity?.status}
              onWithdraw={handleWithdraw}
              onCancel={handleCancelOpportunity}
              onSubmitClick={() => setShowSubmitModal(true)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 max-w-5xl space-y-8">
        <OpportunityContentCard 
          title="Overview" 
          content={opportunity.description} 
          type="text"
        />

        <OpportunityContentCard 
          title="Details" 
          content={opportunity.detailed_description} 
          type="markdown"
        />

        <OpportunityContentCard 
          title="Required Skills" 
          skills={opportunity.required_skills} 
          type="skills"
        />

        <OpportunityContentCard 
          title="Submission Guidelines" 
          content={opportunity.submission_guidelines} 
          type="markdown"
        />

        <OpportunityContentCard 
          title={`About ${opportunity.organization}`} 
          content={opportunity.about_organization} 
          type="markdown"
        />

        {opportunity.contact_email && (
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <a
                href={`mailto:${opportunity.contact_email}`}
                className="text-primary hover:underline"
              >
                {opportunity.contact_email}
              </a>
            </CardContent>
          </Card>
        )}

        <WinnersCard
          contractBountyId={(opportunity as any).contract_bounty_id}
          opportunity={{
            amount: opportunity.amount || 0,
            currency: opportunity.currency || "USD",
          }}
        />

        <SubmissionsListCard
          submissions={submissions}
          loading={loadingSubmissions}
          isCreator={isCreator}
          isDeadlinePassed={isDeadlinePassed}
          isBountyClosed={isBountyClosed}
          submissionUsers={submissionUsers}
          isSubmitting={isSubmitting}
          isSelectWinnersPending={isSelectWinnersPending}
          onSelectWinnersClick={() => setShowSelectWinnersModal(true)}
        />

        <TransactionDetailsCard
          transactionHash={(opportunity as any).transaction_hash}
          contractBountyId={(opportunity as any).contract_bounty_id}
        />
      </div>

      <SubmitWorkModal
        open={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        submissionData={submissionData}
        onSubmissionDataChange={setSubmissionData}
        onSubmit={handleSubmitWork}
        isSubmitting={isSubmitting}
        isSubmitPending={isSubmitPending}
      />

      <SelectWinnersModal
        open={showSelectWinnersModal}
        onClose={() => {
          setShowSelectWinnersModal(false);
          setSelectedWinners([]);
        }}
        submissions={submissions}
        submissionUsers={submissionUsers}
        opportunity={opportunity}
        selectedWinners={selectedWinners}
        onSelectedWinnersChange={setSelectedWinners}
        onSubmit={handleSelectWinners}
        isSubmitting={isSubmitting}
        isSelectWinnersPending={isSelectWinnersPending}
      />
    </div>
  );
}
