"use client";

import { getSupabase } from "@/lib/supabase/client";

export function GoogleButton() {
  return (
    <button
      onClick={async () => {
        const supabase = getSupabase();
        await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
      }}
      className="w-full rounded-md border border-gray-200 bg-white py-2 text-sm"
    >
      Continue with Google
    </button>
  );
}


