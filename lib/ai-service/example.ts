/**
 * Example usage of the AI Skill Matching Service
 *
 * This file demonstrates how to use the skill matching agent
 * in various scenarios.
 */

import { matchCandidatesForOpportunity, skillMatchingAgent } from "./index";

// Example 1: Basic usage - Match candidates when an opportunity is created
export async function exampleBasicMatching() {
  const newOpportunity = {
    id: "opp-abc123",
    title: "Senior Solana Developer",
    organization: "DeFi Protocol",
    description:
      "We're looking for an experienced Solana developer to build our next-generation DeFi protocol with advanced smart contracts.",
    type: "job",
    amount: 120000,
    currency: "USD",
    deadline: "2024-12-31T23:59:59Z",
    required_skills: ["Solana", "Rust", "Smart Contracts", "Web3"],
    tags: ["DeFi", "Blockchain", "Remote", "Full-time"],
    difficulty_level: "advanced",
  };

  try {
    // Find matching candidates and send notifications
    const result = await matchCandidatesForOpportunity(newOpportunity, {
      minMatchScore: 75, // Only 75%+ matches
      maxCandidates: 10, // Top 10 candidates
      sendNotifications: true, // Send Telegram notifications
    });

    console.log("Matching Results:");
    console.log(`- Total candidates searched: ${result.totalCandidatesFound}`);
    console.log(`- Qualified matches: ${result.matchedCandidates.length}`);
    console.log(`- Notifications sent: ${result.notificationsSent}`);

    // Show top 3 matches
    result.matchedCandidates.slice(0, 3).forEach((match, index) => {
      console.log(`\n#${index + 1} Match:`);
      console.log(`  Name: ${match.candidate.name}`);
      console.log(`  Score: ${match.matchScore}%`);
      console.log(`  Skills: ${match.matchingSkills.join(", ")}`);
      console.log(`  Reasoning: ${match.reasoning.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error("Error matching candidates:", error);
  }
}

// Example 2: Preview matches without sending notifications
export async function examplePreviewMatching() {
  const opportunity = {
    id: "opp-xyz789",
    title: "Frontend React Developer",
    organization: "NFT Marketplace",
    description: "Build a modern NFT marketplace frontend using React and Web3",
    type: "project",
    amount: 5000,
    currency: "USDC",
    deadline: "2024-06-30T23:59:59Z",
    required_skills: ["React", "TypeScript", "Web3.js"],
    tags: ["NFT", "Frontend", "Web3"],
    difficulty_level: "intermediate",
    duration: "short-term",
  };

  try {
    // Preview matches without sending notifications
    const result = await matchCandidatesForOpportunity(opportunity, {
      minMatchScore: 60,
      maxCandidates: 20,
      sendNotifications: false, // Don't send notifications
    });

    console.log("Preview Results:");
    result.matchedCandidates.forEach((match) => {
      console.log(
        `\n${match.candidate.name || "Anonymous"} (${match.matchScore}%)`
      );
      console.log(`  Email: ${match.candidate.email}`);
      console.log(`  Skills: ${match.candidate.skills?.join(", ")}`);
      console.log(
        `  Has Telegram: ${match.candidate.telegram_id ? "Yes" : "No"}`
      );
    });

    return result;
  } catch (error) {
    console.error("Error previewing matches:", error);
    throw error;
  }
}

// Example 3: Get match details for a specific candidate
export async function exampleSpecificCandidateMatch() {
  const opportunity = {
    id: "opp-bounty-456",
    title: "Bug Bounty - Smart Contract Audit",
    organization: "Web3 Security",
    description: "Find vulnerabilities in our Solidity smart contracts",
    type: "bounty",
    amount: 2000,
    currency: "USDC",
    deadline: "2024-08-15T23:59:59Z",
    required_skills: ["Solidity", "Security", "Smart Contract Auditing"],
    tags: ["Security", "Ethereum", "Audit"],
    difficulty_level: "expert",
    category: "code",
  };

  const candidateId = "user-123";

  try {
    const match = await skillMatchingAgent.getMatchDetails(
      opportunity,
      candidateId
    );

    if (match) {
      console.log("Candidate Match Details:");
      console.log(`Match Score: ${match.matchScore}%`);
      console.log(`\nReasoning:\n${match.reasoning}`);
      console.log(`\nMatching Skills: ${match.matchingSkills.join(", ")}`);
      console.log(`\nSuggested Message:\n${match.suggestedMessage}`);
      return match;
    } else {
      console.log("No match found for this candidate");
      return null;
    }
  } catch (error) {
    console.error("Error getting match details:", error);
    throw error;
  }
}

// Example 4: Integration with opportunity creation flow
export async function exampleOpportunityCreationFlow(opportunityData: any) {
  try {
    // Step 1: Validate and save opportunity to database
    console.log("Creating opportunity...");
    // const savedOpportunity = await saveOpportunityToDB(opportunityData);

    // Step 2: Start matching process in background (don't await)
    console.log("Starting candidate matching in background...");
    matchCandidatesForOpportunity(opportunityData, {
      minMatchScore: 70,
      maxCandidates: 15,
      sendNotifications: true,
    })
      .then((result) => {
        console.log(
          `✅ Matched ${result.matchedCandidates.length} candidates and sent ${result.notificationsSent} notifications`
        );
      })
      .catch((error) => {
        console.error("❌ Error in background matching:", error);
        // Log to error tracking service (e.g., Sentry)
      });

    // Step 3: Return immediately to user
    console.log("Opportunity created! Matching candidates in background...");
    return { success: true };
  } catch (error) {
    console.error("Error in opportunity creation flow:", error);
    throw error;
  }
}

// Example 5: Batch matching for multiple opportunities
export async function exampleBatchMatching(opportunities: any[]) {
  console.log(
    `Starting batch matching for ${opportunities.length} opportunities...`
  );

  const results = [];

  for (const opportunity of opportunities) {
    try {
      const result = await matchCandidatesForOpportunity(opportunity, {
        minMatchScore: 65,
        maxCandidates: 10,
        sendNotifications: true,
      });

      results.push({
        opportunityId: opportunity.id,
        success: true,
        matchCount: result.matchedCandidates.length,
        notificationsSent: result.notificationsSent,
      });

      // Wait 2 seconds between opportunities to avoid rate limits
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Error matching for opportunity ${opportunity.id}:`, error);
      results.push({
        opportunityId: opportunity.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  console.log("\nBatch Matching Results:");
  results.forEach((result) => {
    console.log(
      `- ${result.opportunityId}: ${
        result.success
          ? `${result.matchCount} matches, ${result.notificationsSent} notifications`
          : `Failed: ${result.error}`
      }`
    );
  });

  return results;
}

// Uncomment to run examples
// exampleBasicMatching();
// examplePreviewMatching();
// exampleSpecificCandidateMatch();
