"use client";

import { useReadContract } from "wagmi";
import { blockchainBountyAddress, blockchainBountyAbi } from "@/components/providers/contract-abi";
import { ContractBountyCategory } from "./contract-utils";

export function useActiveBountiesByCategory(category: ContractBountyCategory) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getActiveBountiesByCategory",
    args: [category],
  });

  return {
    bountyIds: data as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

export function useBountiesByCategory(category: ContractBountyCategory) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getBountiesByCategory",
    args: [category],
  });

  return {
    bountyIds: data as bigint[] | undefined,
    isLoading,
    error,
    refetch,
  };
}

export function useBountyCountByCategory(category: ContractBountyCategory) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getBountyCountByCategory",
    args: [category],
  });

  return {
    count: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

export function useContractBalance() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: blockchainBountyAddress as `0x${string}`,
    abi: blockchainBountyAbi,
    functionName: "getContractBalance",
  });

  return {
    balance: data as bigint | undefined,
    balanceInEth: data ? Number(data) / 1e18 : 0,
    isLoading,
    error,
    refetch,
  };
}

