import { supabase } from "../supabase/client";
import type { CandidateProfile } from "./types";

/**
 * Database queries for candidate matching
 */

/**
 * Get all hunter users (potential candidates)
 */
export async function getAllHunters(): Promise<CandidateProfile[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "hunter");

    if (error) throw error;

    return (data || []).map(mapUserToCandidate);
  } catch (error) {
    console.error("Error fetching hunters:", error);
    throw error;
  }
}

/**
 * Get hunters with specific skills
 */
export async function getHuntersBySkills(
  skills: string[]
): Promise<CandidateProfile[]> {
  try {
    if (skills.length === 0) {
      return getAllHunters();
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "hunter")
      .not("skills", "is", null);

    if (error) throw error;

    // Filter candidates who have matching skills
    const matchingCandidates = (data || []).filter((user) => {
      const userSkills = user.skills || [];
      return skills.some((requiredSkill) =>
        userSkills.some(
          (userSkill: string) =>
            userSkill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
            requiredSkill.toLowerCase().includes(userSkill.toLowerCase())
        )
      );
    });

    return matchingCandidates.map(mapUserToCandidate);
  } catch (error) {
    console.error("Error fetching hunters by skills:", error);
    throw error;
  }
}

/**
 * Get a specific candidate by ID
 */
export async function getCandidateById(
  userId: string
): Promise<CandidateProfile | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw error;
    }

    return mapUserToCandidate(data);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    throw error;
  }
}

/**
 * Get candidates with Telegram IDs (who can receive notifications)
 */
export async function getCandidatesWithTelegram(): Promise<CandidateProfile[]> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("role", "hunter")
      .not("telegram_id", "is", null);

    if (error) throw error;

    return (data || []).map(mapUserToCandidate);
  } catch (error) {
    console.error("Error fetching candidates with Telegram:", error);
    throw error;
  }
}

/**
 * Update user's Telegram ID
 */
export async function updateUserTelegramId(
  userId: string,
  telegramId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("users")
      .update({ telegram_id: telegramId })
      .eq("id", userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating Telegram ID:", error);
    return false;
  }
}

/**
 * Search candidates by multiple criteria
 */
export async function searchCandidates(criteria: {
  skills?: string[];
  minExperienceLevel?: string;
  hasEmail?: boolean;
  hasTelegram?: boolean;
}): Promise<CandidateProfile[]> {
  try {
    let query = supabase.from("users").select("*").eq("role", "hunter");

    if (criteria.hasEmail) {
      query = query.not("email", "is", null);
    }

    if (criteria.hasTelegram) {
      query = query.not("telegram_id", "is", null);
    }

    const { data, error } = await query;

    if (error) throw error;

    let results = data || [];

    // Filter by skills if provided
    if (criteria.skills && criteria.skills.length > 0) {
      results = results.filter((user) => {
        const userSkills = user.skills || [];
        return criteria.skills!.some((requiredSkill) =>
          userSkills.some(
            (userSkill: string) =>
              userSkill.toLowerCase().includes(requiredSkill.toLowerCase()) ||
              requiredSkill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
      });
    }

    return results.map(mapUserToCandidate);
  } catch (error) {
    console.error("Error searching candidates:", error);
    throw error;
  }
}

/**
 * Helper: Map database user row to CandidateProfile
 */
function mapUserToCandidate(user: any): CandidateProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    skills: user.skills,
    bio: user.bio,
    telegram_id: user.telegram_id || null,
    portfolio_url: user.portfolio_url,
    github_url: user.github_url,
  };
}

/**
 * Get candidate count by skill
 */
export async function getCandidateCountBySkill(skill: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id")
      .eq("role", "hunter")
      .not("skills", "is", null);

    if (error) throw error;

    const count = (data || []).filter((user: any) => {
      const userSkills = user.skills || [];
      return userSkills.some((s: string) =>
        s.toLowerCase().includes(skill.toLowerCase())
      );
    }).length;

    return count;
  } catch (error) {
    console.error("Error getting candidate count:", error);
    return 0;
  }
}
