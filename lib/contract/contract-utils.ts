import { parseEther, decodeEventLog } from "viem";
import { blockchainBountyAddress, blockchainBountyAbi } from "@/components/providers/contract-abi";
import type { BountyCategory as FormBountyCategory } from "@/lib/types/opportunities";

// Contract BountyCategory enum values
export enum ContractBountyCategory {
  Content = 0,
  Design = 1,
  Development = 2,
  SmartContract = 3,
  SocialMedia = 4,
  FullStack = 5,
}

// Map form categories to contract categories
export function mapFormCategoryToContract(
  formCategory: FormBountyCategory,
  opportunityType: string
): ContractBountyCategory {
  // For non-bounty types, default to Development
  if (opportunityType !== "bounty") {
    return ContractBountyCategory.Development;
  }

  // Map form categories to contract categories
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

// Convert currency amount to wei (assuming 18 decimals for all tokens)
export function convertToWei(amount: number, currency: string): bigint {
  // For now, we'll treat all currencies as having 18 decimals
  // In production, you might want to handle different decimals per token
  return parseEther(amount.toString());
}

// Create bounty on contract
export interface CreateBountyParams {
  description: string;
  deadline: number; // Unix timestamp
  category: ContractBountyCategory;
  stakeAmount: bigint; // Amount in wei
}

// Get bounty ID from transaction receipt by parsing events
export function getBountyIdFromReceipt(receipt: any): bigint | null {
  try {
    if (!receipt) {
      console.warn("Receipt is null or undefined");
      return null;
    }

    // Handle different receipt formats (wagmi might return different structures)
    const logs = receipt.logs || receipt.log || [];
    
    if (!logs || logs.length === 0) {
      console.warn("No logs found in receipt", receipt);
      return null;
    }

    console.log("Parsing receipt logs:", logs.length, "logs found");

    // Find the BountyCreated event in the logs
    for (const log of logs) {
      try {
        // Ensure log has required properties
        if (!log.topics || !log.data) {
          continue;
        }

        // Try to decode as BountyCreated event
        // Event signature: BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 stakeAmount, uint256 deadline, string description, enum BountyCategory category)
        const decoded = decodeEventLog({
          abi: blockchainBountyAbi,
          data: log.data,
          topics: log.topics,
        });

        // Check if this is the BountyCreated event
        if (decoded.eventName === "BountyCreated") {
          // The bountyId is the first argument
          const bountyId = decoded.args?.[0];
          if (bountyId !== undefined && bountyId !== null) {
            console.log("Found BountyCreated event, bounty ID:", bountyId);
            // Handle both bigint and number types
            if (typeof bountyId === "bigint") {
              return bountyId;
            }
            return BigInt(String(bountyId));
          }
        }
      } catch (decodeError) {
        // Not the event we're looking for, continue
        continue;
      }
    }

    // Fallback: try to extract from topics if decodeEventLog fails
    // The BountyCreated event has bountyId as the first indexed parameter (topics[1])
    for (const log of logs) {
      if (log.topics && log.topics.length >= 2) {
        // Check if this log is from our contract
        const logAddress = log.address || log.contractAddress;
        if (logAddress?.toLowerCase() === blockchainBountyAddress.toLowerCase()) {
          // The event signature hash is in topics[0]
          // The bountyId (first indexed param) is in topics[1]
          try {
            const bountyId = BigInt(log.topics[1]);
            console.log("Extracted bounty ID from topics:", bountyId);
            return bountyId;
          } catch (e) {
            console.warn("Failed to parse bounty ID from topics:", e);
            continue;
          }
        }
      }
    }

    console.warn("Could not find BountyCreated event in receipt logs");
    return null;
  } catch (err) {
    console.error("Error parsing bounty ID from receipt:", err);
    return null;
  }
}

// Export contract address and ABI for use in components
export { blockchainBountyAddress, blockchainBountyAbi };

