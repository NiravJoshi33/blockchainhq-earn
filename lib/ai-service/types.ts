/**
 * Type definitions for the AI Skill Matching Service
 */

export interface CandidateProfile {
  id: string;
  name: string | null;
  email: string | null;
  skills: string[] | null;
  bio: string | null;
  telegram_id: string | null;
  portfolio_url?: string | null;
  github_url?: string | null;
}

export interface MatchedCandidate {
  candidate: CandidateProfile;
  matchScore: number; // 0-100
  reasoning: string;
  matchingSkills: string[];
  suggestedMessage: string;
}

export interface SkillMatchingResult {
  opportunityId: string;
  totalCandidatesFound: number;
  matchedCandidates: MatchedCandidate[];
  notificationsSent: number;
}

export interface OpportunityData {
  id?: string;
  title: string;
  organization: string;
  amount: number;
  currency: string;
  description: string;
  type: string;
  deadline: string;
  required_skills?: string[] | null;
  tags?: string[] | null;
  difficulty_level?: string | null;
  [key: string]: unknown; // Allow additional properties
}

export interface TelegramNotificationPayload {
  telegramId: string;
  opportunity: {
    id: string;
    title: string;
    organization: string;
    amount: number;
    currency: string;
    description: string;
    type: string;
    deadline: string;
  };
  matchScore: number;
  personalizedMessage: string;
}

export interface MatchingOptions {
  minMatchScore?: number; // Minimum match score to consider (default: 60)
  maxCandidates?: number; // Maximum candidates to match (default: 20)
  sendNotifications?: boolean; // Whether to send Telegram notifications (default: false)
}

export interface AIMatchingResponse {
  matchScore: number;
  reasoning: string;
  matchingSkills: string[];
  suggestedMessage: string;
}
