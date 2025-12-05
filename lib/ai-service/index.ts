/**
 * BlockchainHQ AI Skill Matching Service
 *
 * This service uses OpenAI's Assistant API to intelligently match
 * candidates with opportunities based on their skills and send
 * personalized notifications via Telegram.
 */

// Main AI Agent
export {
  SkillMatchingAgent,
  skillMatchingAgent,
  matchCandidatesForOpportunity,
} from "./skill-matching";

// Telegram Notifications
export {
  sendTelegramNotification,
  sendSimpleTelegramMessage,
  verifyTelegramBot,
} from "./telegram";

// Database Queries
export {
  getAllHunters,
  getHuntersBySkills,
  getCandidateById,
  getCandidatesWithTelegram,
  updateUserTelegramId,
  searchCandidates,
  getCandidateCountBySkill,
} from "./database";

// Types
export type {
  CandidateProfile,
  MatchedCandidate,
  SkillMatchingResult,
  TelegramNotificationPayload,
  MatchingOptions,
  AIMatchingResponse,
} from "./types";
