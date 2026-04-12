import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("username, position")
          .eq("id", user.id)
          .single();

        if (!profile || !profile.position) {
          redirect("/onboarding");
        }
        redirect("/feed");
      } catch {
        // DB tables not set up yet — send to onboarding/feed anyway
        redirect("/feed");
      }
    }
  } catch {
    // Auth error — send to login
  }

  redirect("/login");
}
