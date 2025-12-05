"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { getOpportunityById } from "@/lib/supabase/services/opportunities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  DollarSign,
  Users,
  Clock,
  Award,
  Briefcase,
  Tag,
  MapPin,
  ExternalLink,
  Hash,
  X,
  Wallet,
  Github,
  Twitter,
  Youtube,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { useRole } from "@/contexts/role-context";
import { useUser } from "@/contexts/user-context";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract, usePublicClient } from "wagmi";
import {
  blockchainBountyAddress,
  blockchainBountyAbi,
} from "@/components/providers/contract-abi";
import { useNetworkSwitch } from "@/lib/contract/use-network-switch";
import { ApplicantCount } from "@/components/opportunities/applicant-count";
import { getUserByWalletAddress, createUser } from "@/lib/supabase/services/users";
import { supabase } from "@/lib/supabase/client";

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

  // Contract interaction hooks for submission
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

  // Contract interaction hooks for withdrawal
  const { writeContract: writeRefund, data: refundHash, isPending: isRefundPending } = useWriteContract();
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending } = useWriteContract();
  const { isSuccess: isRefundConfirmed } = useWaitForTransactionReceipt({
    hash: refundHash,
  });
  const { isSuccess: isCancelConfirmed } = useWaitForTransactionReceipt({
    hash: cancelHash,
  });

  // Check if user is the creator
  const isCreator = user?.id === opportunity?.sponsor_id;
  const contractBountyId = (opportunity as any)?.contract_bounty_id;

  // Read contract to check if bounty has submissions and if it's closed
  const { data: bountyData } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getBounty",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  // Get submission count
  const { data: submissionCount } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getSubmissionCount",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  const publicClient = usePublicClient();

  // Fetch all submissions
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
        
        // Fetch user information for each submitter
        const userPromises = formattedSubmissions.map(async (submission) => {
          try {
            const user = await getUserByWalletAddress(submission.submitter);
            return { address: submission.submitter.toLowerCase(), user };
          } catch (error) {
            console.error(`Error fetching user for ${submission.submitter}:`, error);
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
        console.error("Error fetching submissions:", error);
      } finally {
        setLoadingSubmissions(false);
      }
    }

    fetchSubmissions();
  }, [contractBountyId, submissionCount, publicClient]);

  // Check if bounty is closed (funds have been withdrawn)
  const isBountyClosed = useMemo(() => {
    if (!bountyData) return false;
    
    // getBounty returns: (id, creator, stakeAmount, deadline, description, category, isActive, isClosed, totalSubmissions)
    if (Array.isArray(bountyData)) {
      return bountyData[7] === true; // isClosed is at index 7
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
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOpportunity();
  }, [params.id]);

  // Handle successful submission
  useEffect(() => {
    async function handleSubmissionSuccess() {
      if (isSubmitConfirmed && submitHash) {
        // Get wallet address from the connected wallet
        const walletAddress = wallets[0]?.address;
        
        if (walletAddress) {
          try {
            // Check if user exists by wallet address
            let dbUser = await getUserByWalletAddress(walletAddress);
            
            // If user doesn't exist, create them
            if (!dbUser) {
              dbUser = await createUser({
                privy_id: privyUser?.id,
                email: privyUser?.email?.address,
                wallet_address: walletAddress,
                role: "hunter",
              });
              console.log("User created in database:", dbUser);
            } else if (dbUser && !dbUser.wallet_address) {
              // Update existing user with wallet address if missing
              const { updateUserProfile } = await import("@/lib/supabase/services/users");
              // Note: updateUserProfile doesn't support wallet_address, so we'll update directly
              const { error: updateError } = await supabase
                .from("users")
                .update({ wallet_address: walletAddress.toLowerCase() })
                .eq("id", dbUser.id);
              
              if (!updateError) {
                console.log("Updated user with wallet address");
              }
            }
          } catch (error) {
            console.error("Error saving user to database:", error);
            // Don't block the success message if user creation fails
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
        
        // Refresh submissions to show the new one
        if (contractBountyId && submissionCount !== undefined) {
          // Trigger a refetch by updating a dependency
          const count = typeof submissionCount === 'bigint' 
            ? Number(submissionCount) 
            : Number(submissionCount);
          // The useEffect will refetch when submissionCount changes
        }
      }
    }
    
    handleSubmissionSuccess();
  }, [isSubmitConfirmed, submitHash, wallets, privyUser, contractBountyId, submissionCount]);

  // Handle submission errors
  useEffect(() => {
    if (submitError) {
      console.error("Submit error:", submitError);
      toast.error("Failed to submit work", {
        description: submitError.message || "Please try again",
        id: "submit-work",
      });
      setIsSubmitting(false);
    }
  }, [submitError]);

  // Handle receipt errors
  useEffect(() => {
    if (submitReceiptError) {
      console.error("Submit receipt error:", submitReceiptError);
      toast.error("Transaction failed", {
        description: submitReceiptError.message || "Please try again",
        id: "submit-work",
      });
      setIsSubmitting(false);
    }
  }, [submitReceiptError]);

  // Handle successful refund
  useEffect(() => {
    if (isRefundConfirmed && refundHash) {
      toast.success("Funds withdrawn successfully! 🎉", {
        description: `Your staked amount has been refunded.`,
      });
      setIsSubmitting(false);
    }
  }, [isRefundConfirmed, refundHash]);

  // Handle successful cancel
  useEffect(() => {
    if (isCancelConfirmed && cancelHash) {
      toast.success("Bounty cancelled and funds withdrawn! 🎉", {
        description: `Your staked amount has been refunded.`,
      });
      setIsSubmitting(false);
    }
  }, [isCancelConfirmed, cancelHash]);

  const handleSubmitWork = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    console.log("handleSubmitWork called", {
      authenticated,
      contractBountyId,
      submissionData,
    });

    if (!authenticated) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!contractBountyId) {
      toast.error("This opportunity is not on-chain");
      return;
    }

    // Validate required fields
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

      console.log("Calling writeSubmit with:", {
        address: blockchainBountyAddress,
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
      });

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
      console.error("Error submitting work:", error);
      toast.error("Failed to submit work", {
        description: error?.message || "Please try again",
        id: "submit-work",
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

      // Check if there are submissions
      // getBounty returns a struct: (id, creator, stakeAmount, deadline, description, category, isActive, isClosed, totalSubmissions)
      // wagmi returns it as an array or object, so we need to handle both
      let totalSubmissions = BigInt(0);
      if (bountyData) {
        // Handle both array and object formats
        if (Array.isArray(bountyData)) {
          totalSubmissions = bountyData[8] || BigInt(0);
        } else if (typeof bountyData === 'object' && 'totalSubmissions' in bountyData) {
          totalSubmissions = BigInt(bountyData.totalSubmissions as string | number | bigint);
        }
      }

      if (totalSubmissions === BigInt(0)) {
        // Use refundBounty if no submissions
        toast.loading("Withdrawing funds...", { id: "withdraw" });
        writeRefund({
          address: blockchainBountyAddress as `0x${string}`,
          abi: blockchainBountyAbi,
          functionName: "refundBounty",
          args: [BigInt(contractBountyId)],
          chainId: 97,
        });
      } else {
        // Use cancelBounty if there are submissions but no winners
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
      console.error("Error withdrawing funds:", error);
      toast.error("Failed to withdraw funds", {
        description: error?.message || "Please try again",
        id: "withdraw",
      });
      setIsSubmitting(false);
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
      {/* Hero Header */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto py-8 max-w-5xl">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default" className="capitalize">
                  {opportunity.type}
                </Badge>
                <Badge variant="secondary">
                  {opportunity.difficulty_level}
                </Badge>
                {opportunity.category && (
                  <Badge variant="outline">{opportunity.category}</Badge>
                )}
                <Badge variant="outline">{opportunity.status}</Badge>
              </div>

              <h1 className="text-4xl font-bold tracking-tight">
                {opportunity.title}
              </h1>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  <span className="text-lg">{opportunity.organization}</span>
                </div>
                {opportunity.type === "job" && opportunity.location && (
                  <>
                    <span>•</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0" style={{ position: 'relative', zIndex: 10 }}>
              {role === "hunter" && !isDeadlinePassed && (
                <Button 
                  size="lg" 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Submit Now button clicked", { 
                      authenticated, 
                      contractBountyId,
                      role,
                      isDeadlinePassed,
                      showSubmitModal 
                    });
                    
                    if (!authenticated) {
                      toast.error("Please connect your wallet first");
                      return;
                    }
                    
                    if (!contractBountyId) {
                      toast.error("This opportunity is not available for on-chain submission");
                      return;
                    }
                    
                    console.log("Opening submit modal");
                    setShowSubmitModal(true);
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
                  onClick={handleWithdraw}
                  disabled={isSubmitting || isRefundPending || isCancelPending}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isSubmitting || isRefundPending || isCancelPending 
                    ? "Processing..." 
                    : "Withdraw Funds"}
                </Button>
              )}
              {isCreator && isDeadlinePassed && contractBountyId && isBountyClosed && (
                <Badge variant="secondary" className="px-4 py-2">
                  Funds Withdrawn
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
              <Award className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-2xl font-bold">
                  ${opportunity.amount.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {opportunity.currency}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
              <Users className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-2xl font-bold">
                  <ApplicantCount opportunity={opportunity} />
                </div>
                <p className="text-xs text-muted-foreground">Applicants</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
              <Clock className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div
                  className={cn(
                    "text-2xl font-bold",
                    daysLeft < 7 && daysLeft > 0 && "text-orange-500",
                    daysLeft <= 0 && "text-red-500"
                  )}
                >
                  {daysLeft > 0 ? `${daysLeft}d` : "Ended"}
                </div>
                <p className="text-xs text-muted-foreground">Time Left</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-background border">
              <Calendar className="h-8 w-8 text-primary shrink-0" />
              <div>
                <div className="text-sm font-bold">
                  {deadline.toLocaleDateString()}
                </div>
                <p className="text-xs text-muted-foreground">Deadline</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto py-8 max-w-5xl space-y-8">
        {/* Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {opportunity.description}
            </p>
          </CardContent>
        </Card>

        {/* Detailed Description */}
        {opportunity.detailed_description && (
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.detailed_description} />
            </CardContent>
          </Card>
        )}

        {/* Required Skills */}
        {opportunity.required_skills &&
          opportunity.required_skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {opportunity.required_skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Submission Guidelines */}
        {opportunity.submission_guidelines && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.submission_guidelines} />
            </CardContent>
          </Card>
        )}

        {/* About Organization */}
        {opportunity.about_organization && (
          <Card>
            <CardHeader>
              <CardTitle>About {opportunity.organization}</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={opportunity.about_organization} />
            </CardContent>
          </Card>
        )}

        {/* Contact */}
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

        {/* Submissions - Only visible to creator/sponsor */}
        {isCreator && contractBountyId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Submissions ({submissions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading submissions...
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No submissions yet
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission, index) => (
                    <Card key={index} className="border">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Submission #{submission.id + 1}
                            </Badge>
                            {submission.isWinner && (
                              <Badge variant="default">
                                Winner - Rank {submission.rank}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(Number(submission.submissionTime) * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">Submitted by:</span>
                            {submissionUsers[submission.submitter.toLowerCase()] ? (
                              <>
                                {submissionUsers[submission.submitter.toLowerCase()].avatar_url && (
                                  <img
                                    src={submissionUsers[submission.submitter.toLowerCase()].avatar_url}
                                    alt="Avatar"
                                    className="w-6 h-6 rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                  />
                                )}
                                <Link
                                  href={`/profile/${submissionUsers[submission.submitter.toLowerCase()].id}`}
                                  className="font-semibold text-foreground hover:text-primary hover:underline"
                                >
                                  {submissionUsers[submission.submitter.toLowerCase()].name || 
                                   (submissionUsers[submission.submitter.toLowerCase()].profile_data as any)?.username ||
                                   "Unknown User"}
                                </Link>
                                <span className="text-xs text-muted-foreground">•</span>
                                <a
                                  href={`https://testnet.bscscan.com/address/${submission.submitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                  {submission.submitter.slice(0, 6)}...{submission.submitter.slice(-4)}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </>
                            ) : (
                              <a
                                href={`https://testnet.bscscan.com/address/${submission.submitter}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-mono text-xs text-primary hover:underline flex items-center gap-1"
                              >
                                {submission.submitter.slice(0, 6)}...{submission.submitter.slice(-4)}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {submission.submissionLink && (
                            <a
                              href={submission.submissionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              Submission Link
                            </a>
                          )}
                          {submission.githubLink && (
                            <a
                              href={submission.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Github className="h-4 w-4" />
                              GitHub Repository
                            </a>
                          )}
                          {submission.twitterLink && (
                            <a
                              href={submission.twitterLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Twitter className="h-4 w-4" />
                              Project Twitter
                            </a>
                          )}
                          {submission.videoLink && (
                            <a
                              href={submission.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Youtube className="h-4 w-4" />
                              Video Trailer
                            </a>
                          )}
                          {submission.indieFunLink && (
                            <a
                              href={submission.indieFunLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              Indie.fun Page
                            </a>
                          )}
                          {submission.tweetLink && (
                            <a
                              href={submission.tweetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <Twitter className="h-4 w-4" />
                              Tweet Link
                            </a>
                          )}
                          {submission.projectLink && (
                            <a
                              href={submission.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-sm text-primary hover:underline"
                            >
                              <LinkIcon className="h-4 w-4" />
                              Live Project
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Transaction Details */}
        {(opportunity as any).transaction_hash && (
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
                    href={`https://testnet.bscscan.com/tx/${(opportunity as any).transaction_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 text-sm font-mono"
                  >
                    {(opportunity as any).transaction_hash.slice(0, 10)}...
                    {(opportunity as any).transaction_hash.slice(-8)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {(opportunity as any).contract_bounty_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Contract Bounty ID:
                    </span>
                    <span className="text-sm font-mono">
                      #{(opportunity as any).contract_bounty_id}
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-2 border-t">
                <a
                  href={`https://testnet.bscscan.com/tx/${(opportunity as any).transaction_hash}`}
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
        )}
      </div>

      {/* Submission Modal */}
      {showSubmitModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowSubmitModal(false);
            }
          }}
        >
          <Card 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Submit Your Work</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSubmitModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="submissionLink">
                  Submission Link <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="submissionLink"
                  placeholder="https://..."
                  value={submissionData.submissionLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, submissionLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="githubLink">
                  GitHub Repository <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="githubLink"
                  placeholder="https://github.com/..."
                  value={submissionData.githubLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, githubLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="twitterLink">
                  Project Twitter <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="twitterLink"
                  placeholder="https://twitter.com/... or https://x.com/..."
                  value={submissionData.twitterLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, twitterLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoLink">
                  Video Trailer <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="videoLink"
                  placeholder="https://youtube.com/... or https://vimeo.com/..."
                  value={submissionData.videoLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, videoLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indieFunLink">
                  Indie.fun Page <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="indieFunLink"
                  placeholder="https://indie.fun/..."
                  value={submissionData.indieFunLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, indieFunLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tweetLink">Tweet Link (Optional)</Label>
                <Input
                  id="tweetLink"
                  placeholder="https://twitter.com/.../status/..."
                  value={submissionData.tweetLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, tweetLink: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectLink">Live Project Link (Optional)</Label>
                <Input
                  id="projectLink"
                  placeholder="https://..."
                  value={submissionData.projectLink}
                  onChange={(e) =>
                    setSubmissionData({ ...submissionData, projectLink: e.target.value })
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Submit button clicked");
                    handleSubmitWork(e);
                  }}
                  disabled={isSubmitting || isSubmitPending}
                  className="flex-1"
                >
                  {isSubmitting || isSubmitPending ? "Submitting..." : "Submit Work"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log("Cancel button clicked");
                    setShowSubmitModal(false);
                  }}
                  disabled={isSubmitting || isSubmitPending}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
