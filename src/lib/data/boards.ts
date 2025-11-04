"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { Board } from "@/types/app.types";

export async function fetchBoards(): Promise<Board[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("title", { ascending: true });
    if (error) throw error;
    return (data || []) as Board[];
  } catch (e) {
    console.warn("Boards fetch skipped: Supabase env not configured.");
    return [];
  }
}

export async function createBoard(payload: Partial<Board>): Promise<Board> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("boards").insert(payload).select("*").single();
  if (error) throw error;
  return data as Board;
}

export async function deleteBoard(id: string): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("boards").delete().eq("id", id);
  if (error) throw error;
}


