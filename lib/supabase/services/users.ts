import { supabase } from "../client";

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
  privy_id: string;
  email?: string;
  wallet_address?: string;
  role?: "hunter" | "sponsor";
}) {
  const { data, error } = await supabase
    .from("users")
    .insert(userData)
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
