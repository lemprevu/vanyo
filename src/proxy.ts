import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Proxy (ex-middleware) : rafraîchit la session et protège /admin. */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
