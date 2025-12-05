import { supabase } from "../client";
import { generateRandomUsername, generateAvatarUrl } from "@/lib/utils";

export async function getUserByPrivyId(privyId: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("privy_id", privyId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function createUser(userData: {
  privy_id?: string;
  email?: string;
  wallet_address?: string;
  role?: "hunter" | "sponsor";
}) {
  const randomUsername = generateRandomUsername();
  const avatarUrl = generateAvatarUrl(userData.email || userData.wallet_address || randomUsername);
  
  const defaultName = randomUsername
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const privyId = userData.privy_id || `wallet:${userData.wallet_address?.toLowerCase() || randomUsername}`;

  const { data, error } = await supabase
    .from("users")
    .insert({
      ...userData,
      privy_id: privyId,
      name: defaultName,
      avatar_url: avatarUrl,
    })
    .select()
    .single();

  if (error) throw error;
  
  return data;
}

export async function updateUserRole(
  userId: string,
  role: "hunter" | "sponsor"
) {
  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    name?: string;
    email?: string;
    bio?: string;
    github_url?: string | null;
    twitter_url?: string | null;
    portfolio_url?: string | null;
    avatar_url?: string | null;
    skills?: string[] | null;
    profile_data?: Record<string, any> | null;
  }
) {
  const { data, error } = await supabase
    .from("users")
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByWalletAddress(walletAddress: string) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}
