"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { ContentBlock } from "@/types/app.types";

export async function fetchBlocks(boardId: string): Promise<ContentBlock[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("content_blocks")
    .select("*")
    .eq("board_id", boardId)
    .order("position_index", { ascending: true });
  if (error) throw error;
  return (data || []) as ContentBlock[];
}

export async function createBlock(partial: Partial<ContentBlock>): Promise<ContentBlock> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("content_blocks").insert(partial).select("*").single();
  if (error) throw error;
  return data as ContentBlock;
}

export async function updateBlock(id: string, partial: Partial<ContentBlock>) {
  const supabase = getSupabase();
  const { error } = await supabase.from("content_blocks").update(partial).eq("id", id);
  if (error) throw error;
}

export async function deleteBlock(id: string) {
  const supabase = getSupabase();
  const { error } = await supabase.from("content_blocks").delete().eq("id", id);
  if (error) throw error;
}


