# Smart Contract Integration for Opportunities

This document describes the smart contract integration for creating bounties, hackathons, projects, and other opportunities.

## Overview

The integration allows users to create opportunities on-chain using the `BlockchainBounty` smart contract, and then saves the transaction information to the database.

## Implementation Details

### 1. Contract Utilities (`lib/contract/contract-utils.ts`)

- **Category Mapping**: Maps form categories to contract enum values
  - Form categories (content, code, ux, etc.) → Contract categories (Content, Design, Development, SmartContract, SocialMedia, FullStack)
  
- **Currency Conversion**: Converts amounts to wei using `parseEther` (18 decimals)

- **Event Parsing**: Extracts bounty ID from transaction receipts using viem's `decodeEventLog`

### 2. Form Integration (`components/sponsor/create-opportunity-form.tsx`)

The create opportunity form now:
1. Calls the smart contract `createBounty` function with:
   - Description (title + description)
   - Deadline (Unix timestamp)
   - Category (mapped from form category)
   - Stake amount (in wei)

2. Waits for transaction confirmation

3. Extracts bounty ID from the transaction receipt

4. Saves opportunity to database with:
   - All form data
   - Transaction hash
   - Contract bounty ID (if successfully extracted)

## Database Schema Update Required

To fully store contract information, add these columns to your `opportunities` table:

```sql
ALTER TABLE opportunities 
ADD COLUMN contract_bounty_id TEXT,
ADD COLUMN transaction_hash TEXT;
```

**Note**: The code will work without these columns (it will log the information), but adding them allows you to:
- Track which opportunities are on-chain
- Link database records to contract bounties
- Query opportunities by transaction hash

## Contract Function

The contract's `createBounty` function signature:
```solidity
function createBounty(
    string memory _description,
    uint256 _deadline,
    BountyCategory _category
) external payable
```

**Parameters:**
- `_description`: Full description of the opportunity (title + description)
- `_deadline`: Unix timestamp for the deadline
- `_category`: Enum value (0-5) representing the category
- `msg.value`: The stake amount in wei (sent as ETH/BNB)

**Events:**
- `BountyCreated(uint256 indexed bountyId, address indexed creator, uint256 stakeAmount, uint256 deadline, string description, BountyCategory category)`

## Usage Flow

1. User fills out the opportunity form
2. User clicks "Create Opportunity"
3. Transaction is prepared and sent to contract
4. User confirms transaction in wallet
5. Transaction is mined and confirmed
6. Bounty ID is extracted from transaction receipt
7. Opportunity is saved to database with contract info
8. Success message is shown with transaction hash

## Error Handling

- Contract errors are caught and displayed to the user
- If contract transaction succeeds but database save fails, user is notified
- If bounty ID cannot be extracted, transaction hash is still saved
- All errors are logged to console for debugging

## Supported Opportunity Types

All opportunity types (bounty, hackathon, project, job, grant) can be created on-chain. Non-bounty types default to the `Development` category in the contract.

## Testing

To test the integration:
1. Connect a wallet (using Privy)
2. Ensure you have testnet BNB/ETH
3. Create an opportunity through the form
4. Confirm the transaction in your wallet
5. Check the database for the saved transaction hash and bounty ID

## Future Enhancements

- Support for different token decimals (currently assumes 18)
- Multi-token support (USDC, SOL, etc.)
- Batch opportunity creation
- Gas optimization
- Transaction status tracking

