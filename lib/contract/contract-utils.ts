import { parseEther, decodeEventLog } from "viem";
import { blockchainBountyAddress, blockchainBountyAbi } from "@/components/providers/contract-abi";
import type { BountyCategory as FormBountyCategory } from "@/lib/types/opportunities";

export enum ContractBountyCategory {
  Content = 0,
  Design = 1,
  Development = 2,
  SmartContract = 3,
  SocialMedia = 4,
  FullStack = 5,
}

export function mapFormCategoryToContract(
  formCategory: FormBountyCategory,
  opportunityType: string
): ContractBountyCategory {
  if (opportunityType !== "bounty") {
    return ContractBountyCategory.Development;
  }

  const categoryMap: Record<FormBountyCategory, ContractBountyCategory> = {
    content: ContractBountyCategory.Content,
    code: ContractBountyCategory.Development,
    ux: ContractBountyCategory.Design,
    "graphic-design": ContractBountyCategory.Design,
    marketing: ContractBountyCategory.SocialMedia,
    research: ContractBountyCategory.Content,
    video: ContractBountyCategory.Content,
    community: ContractBountyCategory.SocialMedia,
    translation: ContractBountyCategory.Content,
    testing: ContractBountyCategory.Development,
  };

  return categoryMap[formCategory] ?? ContractBountyCategory.Development;
}

export function convertToWei(amount: number, currency: string): bigint {
  return parseEther(amount.toString());
}

export interface CreateBountyParams {
  description: string;
  deadline: number;
  category: ContractBountyCategory;
  stakeAmount: bigint;
}

export function getBountyIdFromReceipt(receipt: any): bigint | null {
  try {
    if (!receipt) {
      return null;
    }

    const logs = receipt.logs || receipt.log || [];
    
    if (!logs || logs.length === 0) {
      return null;
    }

    for (const log of logs) {
      try {
        if (!log.topics || !log.data) {
          continue;
        }

        const decoded = decodeEventLog({
          abi: blockchainBountyAbi,
          data: log.data,
          topics: log.topics,
        });

        if (decoded.eventName === "BountyCreated") {
          const bountyId = decoded.args?.[0];
          if (bountyId !== undefined && bountyId !== null) {
            if (typeof bountyId === "bigint") {
              return bountyId;
            }
            return BigInt(String(bountyId));
          }
        }
      } catch (decodeError) {
        continue;
      }
    }

    for (const log of logs) {
      if (log.topics && log.topics.length >= 2) {
        const logAddress = log.address || log.contractAddress;
        if (logAddress?.toLowerCase() === blockchainBountyAddress.toLowerCase()) {
          try {
            const bountyId = BigInt(log.topics[1]);
            return bountyId;
          } catch (e) {
            continue;
          }
        }
      }
    }

    return null;
  } catch (err) {
    return null;
  }
}

export { blockchainBountyAddress, blockchainBountyAbi };

