"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PERIOD_COOKIE } from "@/lib/period";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // The next login starts the Dashboard at This Month again.
  (await cookies()).delete(PERIOD_COOKIE);
  redirect("/login");
}
