import { supabase } from "./client";

export async function ensureUserRow() {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return;

  const email = user.email ?? null;
  const name = (user.user_metadata?.full_name || user.user_metadata?.name || "").toString() || null;

  try {
    if (email) {
      const { data: existing, error: selErr } = await supabase
        .from("users")
        .select("user_id")
        .eq("email", email)
        .limit(1)
        .maybeSingle();
      if (selErr) {
        // Non-fatal; continue to try insert
      }
      if (!existing) {
        await supabase.from("users").insert({ email, name });
      } else if (name) {
        await supabase.from("users").update({ name }).eq("user_id", existing.user_id);
      }
    }
  } catch (_) {
    // Swallow errors to avoid breaking UI
  }
}



























































