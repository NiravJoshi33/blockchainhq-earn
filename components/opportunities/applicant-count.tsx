"use client";

import { useReadContract } from "wagmi";
import {
  blockchainBountyAddress,
  blockchainBountyAbi,
} from "@/components/providers/contract-abi";

interface ApplicantCountProps {
  opportunity: {
    applicants_count?: number | null;
    applicants?: number | null;
    contract_bounty_id?: string | null;
  };
  className?: string;
}

export function ApplicantCount({ opportunity, className }: ApplicantCountProps) {
  const contractBountyId = opportunity.contract_bounty_id;

  // Get submission count from contract if available
  const { data: submissionCount } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getSubmissionCount",
    args: contractBountyId ? [BigInt(contractBountyId)] : undefined,
    query: {
      enabled: !!contractBountyId,
    },
  });

  // Use on-chain count if available, otherwise fall back to database count
  const count = contractBountyId && submissionCount !== undefined
    ? typeof submissionCount === 'bigint'
      ? Number(submissionCount)
      : Number(submissionCount)
    : opportunity.applicants_count || opportunity.applicants || 0;

  return <span className={className}>{count}</span>;
}

