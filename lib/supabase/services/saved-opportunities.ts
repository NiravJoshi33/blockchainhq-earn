import { supabase } from "../client";

export async function getSavedOpportunities(userId: string) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select(
      `
      *,
      opportunity:opportunities(*)
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function saveOpportunity(userId: string, opportunityId: string) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .insert({ user_id: userId, opportunity_id: opportunityId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function unsaveOpportunity(userId: string, opportunityId: string) {
  const { error } = await supabase
    .from("saved_opportunities")
    .delete()
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId);

  if (error) throw error;
}

export async function isOpportunitySaved(
  userId: string,
  opportunityId: string
) {
  const { data, error } = await supabase
    .from("saved_opportunities")
    .select("id")
    .eq("user_id", userId)
    .eq("opportunity_id", opportunityId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}
