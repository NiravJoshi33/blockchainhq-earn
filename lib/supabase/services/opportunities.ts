import { supabase } from "../client";
import type { Opportunity } from "@/lib/types/opportunities";

export async function getOpportunities(filters?: {
  type?: string;
  status?: string;
}) {
  let query = supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.type) {
    query = query.eq("type", filters.type);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getOpportunityById(id: string) {
  const { data, error } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createOpportunity(opportunity: Partial<Opportunity>) {
  const { data, error } = await supabase
    .from("opportunities")
    .insert(opportunity)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add more CRUD operations...
