import { supabase } from "../client";

export async function getUserApplications(userId: string) {
  const { data, error } = await supabase
    .from("applications")
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

export async function createApplication(application: {
  opportunity_id: string;
  user_id: string;
  cover_letter?: string;
  portfolio_link?: string;
}) {
  const { data, error } = await supabase
    .from("applications")
    .insert(application)
    .select()
    .single();

  if (error) throw error;

  const { data: opportunity } = await supabase
    .from("opportunities")
    .select("applicants_count")
    .eq("id", application.opportunity_id)
    .single();

  if (opportunity) {
    await supabase
      .from("opportunities")
      .update({ applicants_count: (opportunity.applicants_count || 0) + 1 })
      .eq("id", application.opportunity_id);
  }

  return data;
}

export async function updateApplicationStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
