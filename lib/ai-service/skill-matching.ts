import OpenAI from "openai";
import { supabase } from "../supabase/client";
import { sendTelegramNotification } from "./telegram";
import type {
  MatchedCandidate,
  SkillMatchingResult,
  OpportunityData,
} from "./types";

// Initialize OpenAI client (lazy initialization)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(
        "OPENAI_API_KEY is not set. Please add it to your .env.local file."
      );
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

/**
 * AI-powered skill matching agent that finds suitable candidates for opportunities
 * and notifies them via Telegram
 */
export class SkillMatchingAgent {
  private assistantId: string | null = null;

  constructor() {
    this.initializeAssistant();
  }

  /**
   * Initialize or retrieve the OpenAI Assistant
   */
  private async initializeAssistant() {
    try {
      // Check if we already have an assistant ID stored
      const existingAssistantId = process.env.OPENAI_ASSISTANT_ID;

      if (existingAssistantId) {
        this.assistantId = existingAssistantId;
        return;
      }

      // Create a new assistant
      const client = getOpenAIClient();
      const assistant = await client.beta.assistants.create({
        name: "BlockchainHQ Skill Matching Agent",
        instructions: `You are an expert talent matching AI for blockchain and Web3 opportunities. 
        Your role is to:
        1. Analyze opportunity requirements and required skills
        2. Evaluate candidate profiles and their skill sets
        3. Calculate match scores based on skill overlap, experience level, and relevance
        4. Provide detailed reasoning for match scores
        5. Suggest personalized messages for reaching out to candidates
        
        Consider factors like:
        - Direct skill matches (exact keyword matches)
        - Related skills (e.g., React and Next.js, Solidity and Web3)
        - Difficulty level alignment (beginner candidates for beginner opportunities)
        - Opportunity type relevance to candidate experience
        
        Return results as JSON with match scores (0-100) and reasoning.`,
        model: "gpt-4o-mini",
        tools: [{ type: "file_search" }],
      });

      this.assistantId = assistant.id;
      console.log(`Created new assistant: ${assistant.id}`);
      console.log(
        "Add this to your .env.local: OPENAI_ASSISTANT_ID=" + assistant.id
      );
    } catch (error) {
      console.error("Error initializing assistant:", error);
      throw error;
    }
  }

  /**
   * Find candidates from database based on skills and role
   */
  private async findCandidatesFromDB(requiredSkills: string[], tags: string[]) {
    try {
      // Get all hunter users with skills
      const { data: candidates, error } = await supabase
        .from("users")
        .select("*")
        .eq("role", "hunter")
        .not("skills", "is", null);

      if (error) throw error;

      if (!candidates || candidates.length === 0) {
        return [];
      }

      // Filter candidates who have at least one matching skill
      const matchingCandidates = candidates.filter((candidate) => {
        const candidateSkills = candidate.skills || [];
        const allSearchTerms = [...requiredSkills, ...tags];

        // Check for any skill overlap
        return allSearchTerms.some((searchTerm) =>
          candidateSkills.some(
            (skill: string) =>
              skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
              searchTerm.toLowerCase().includes(skill.toLowerCase())
          )
        );
      });

      return matchingCandidates;
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw error;
    }
  }

  /**
   * Use OpenAI to score and rank candidates
   */
  private async scoreAndRankCandidates(
    opportunity: OpportunityData,
    candidates: Record<string, unknown>[]
  ): Promise<MatchedCandidate[]> {
    try {
      if (!this.assistantId) {
        await this.initializeAssistant();
      }

      const matchedCandidates: MatchedCandidate[] = [];

      // Process candidates in batches to avoid rate limits
      const batchSize = 5;
      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);

        const batchPromises = batch.map(async (candidate) => {
          try {
            const client = getOpenAIClient();

            // Create a thread for this matching task
            const thread = await client.beta.threads.create();

            // Prepare the matching request
            const matchingPrompt = `
Analyze this candidate match for the opportunity:

OPPORTUNITY:
- Title: ${opportunity.title}
- Type: ${opportunity.type}
- Difficulty: ${opportunity.difficulty_level}
- Required Skills: ${
              opportunity.required_skills?.join(", ") || "None specified"
            }
- Tags: ${opportunity.tags?.join(", ") || "None"}
- Description: ${opportunity.description}

CANDIDATE:
- Name: ${candidate.name || "Anonymous"}
- Skills: ${
              Array.isArray(candidate.skills)
                ? candidate.skills.join(", ")
                : "No skills listed"
            }
- Bio: ${candidate.bio || "No bio provided"}

Task: Calculate a match score (0-100) and provide reasoning. Return ONLY a JSON object with this exact structure:
{
  "matchScore": <number between 0-100>,
  "reasoning": "<detailed explanation>",
  "matchingSkills": ["<skill1>", "<skill2>"],
  "suggestedMessage": "<personalized outreach message>"
}`;

            // Add message to thread
            await client.beta.threads.messages.create(thread.id, {
              role: "user",
              content: matchingPrompt,
            });

            // Run the assistant
            const run = await client.beta.threads.runs.create(thread.id, {
              assistant_id: this.assistantId!,
            });

            // Wait for completion
            let runStatus = await client.beta.threads.runs.retrieve(run.id, {
              thread_id: thread.id,
            });

            let attempts = 0;
            while (runStatus.status !== "completed" && attempts < 30) {
              await new Promise((resolve) => setTimeout(resolve, 1000));
              runStatus = await client.beta.threads.runs.retrieve(run.id, {
                thread_id: thread.id,
              });
              attempts++;
            }

            if (runStatus.status !== "completed") {
              console.error(
                `Run did not complete for candidate ${candidate.id}`
              );
              return null;
            }

            // Get the response
            const messages = await client.beta.threads.messages.list(thread.id);
            const lastMessage = messages.data[0];

            if (
              lastMessage.role === "assistant" &&
              lastMessage.content[0].type === "text"
            ) {
              const responseText = lastMessage.content[0].text.value;

              // Extract JSON from response (handle markdown code blocks)
              let jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/);
              let jsonText = jsonMatch ? jsonMatch[1] : responseText;

              // If no markdown, try to find raw JSON
              if (!jsonMatch) {
                jsonMatch = responseText.match(/\{[\s\S]*\}/);
                jsonText = jsonMatch ? jsonMatch[0] : responseText;
              }

              const result = JSON.parse(jsonText);

              return {
                candidate: {
                  id: candidate.id,
                  name: candidate.name,
                  email: candidate.email,
                  skills: candidate.skills,
                  bio: candidate.bio,
                  telegram_id: candidate.telegram_id || null,
                },
                matchScore: result.matchScore,
                reasoning: result.reasoning,
                matchingSkills: result.matchingSkills || [],
                suggestedMessage: result.suggestedMessage,
              } as MatchedCandidate;
            }

            return null;
          } catch (error) {
            console.error(`Error scoring candidate ${candidate.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(batchPromises);
        matchedCandidates.push(
          ...batchResults.filter((r): r is MatchedCandidate => r !== null)
        );
      }

      // Sort by match score (highest first)
      return matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
      console.error("Error scoring candidates:", error);
      throw error;
    }
  }

  /**
   * Main method: Find and notify suitable candidates for an opportunity
   */
  async matchAndNotifyCandidates(
    opportunityData: OpportunityData,
    options: {
      minMatchScore?: number;
      maxCandidates?: number;
      sendNotifications?: boolean;
    } = {}
  ): Promise<SkillMatchingResult> {
    const {
      minMatchScore = 60,
      maxCandidates = 20,
      sendNotifications = false,
    } = options;

    try {
      console.log(
        `Starting skill matching for opportunity: ${opportunityData.title}`
      );

      // Step 1: Find potential candidates from database
      const candidates = await this.findCandidatesFromDB(
        opportunityData.required_skills || [],
        opportunityData.tags || []
      );

      console.log(`Found ${candidates.length} potential candidates`);

      if (candidates.length === 0) {
        return {
          opportunityId: opportunityData.id || "",
          totalCandidatesFound: 0,
          matchedCandidates: [],
          notificationsSent: 0,
        };
      }

      // Step 2: Use AI to score and rank candidates
      let matchedCandidates = await this.scoreAndRankCandidates(
        opportunityData,
        candidates
      );

      // Step 3: Filter by minimum match score
      matchedCandidates = matchedCandidates.filter(
        (c) => c.matchScore >= minMatchScore
      );

      // Step 4: Limit to max candidates
      matchedCandidates = matchedCandidates.slice(0, maxCandidates);

      console.log(
        `Matched ${matchedCandidates.length} candidates with score >= ${minMatchScore}`
      );

      // Step 5: Send Telegram notifications if enabled
      let notificationsSent = 0;
      if (sendNotifications) {
        for (const match of matchedCandidates) {
          try {
            if (match.candidate.telegram_id) {
              await sendTelegramNotification({
                telegramId: match.candidate.telegram_id,
                opportunity: {
                  id: opportunityData.id || "",
                  title: opportunityData.title,
                  organization: opportunityData.organization,
                  amount: opportunityData.amount,
                  currency: opportunityData.currency,
                  description: opportunityData.description,
                  type: opportunityData.type,
                  deadline: opportunityData.deadline,
                },
                matchScore: match.matchScore,
                personalizedMessage: match.suggestedMessage,
              });
              notificationsSent++;

              // Rate limit: wait 100ms between messages
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error(
              `Failed to notify candidate ${match.candidate.id}:`,
              error
            );
          }
        }
        console.log(`Sent ${notificationsSent} Telegram notifications`);
      }

      return {
        opportunityId: opportunityData.id || "",
        totalCandidatesFound: candidates.length,
        matchedCandidates,
        notificationsSent,
      };
    } catch (error) {
      console.error("Error in matchAndNotifyCandidates:", error);
      throw error;
    }
  }

  /**
   * Get match details for a specific candidate and opportunity
   */
  async getMatchDetails(
    opportunityData: OpportunityData,
    candidateId: string
  ): Promise<MatchedCandidate | null> {
    try {
      // Fetch candidate from database
      const { data: candidate, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", candidateId)
        .single();

      if (error || !candidate) {
        throw new Error("Candidate not found");
      }

      // Score this specific candidate
      const matches = await this.scoreAndRankCandidates(opportunityData, [
        candidate,
      ]);

      return matches[0] || null;
    } catch (error) {
      console.error("Error getting match details:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const skillMatchingAgent = new SkillMatchingAgent();

// Export convenience function
export async function matchCandidatesForOpportunity(
  opportunityData: OpportunityData,
  options?: {
    minMatchScore?: number;
    maxCandidates?: number;
    sendNotifications?: boolean;
  }
): Promise<SkillMatchingResult> {
  return skillMatchingAgent.matchAndNotifyCandidates(opportunityData, options);
}
