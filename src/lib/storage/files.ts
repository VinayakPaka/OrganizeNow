"use client";

import { getSupabase } from "@/lib/supabase/client";

export async function uploadToBucket(bucket: string, file: File, pathPrefix = "") {
  const filePath = `${pathPrefix}${Date.now()}-${file.name}`;
  const supabase = getSupabase();
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: false });
  if (error) throw error;
  return data.path;
}

export function getPublicUrl(bucket: string, path: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}


