import { createServiceClient } from "@/lib/supabase/server";
import { clientIp } from "@/lib/rateLimit";

/**
 * Journal d'activité (qui a fait quoi, depuis quelle IP). Insertion via la
 * clé service_role uniquement (jamais depuis le client) pour que le journal
 * ne soit pas falsifiable. Silencieux en cas d'échec : une action métier ne
 * doit jamais planter juste parce que la journalisation rate.
 */
export async function logActivity(
  request: Request,
  params: {
    userId?: string | null;
    email?: string | null;
    action: string;
    resourceLabel?: string;
    details?: Record<string, unknown>;
  }
) {
  try {
    const admin = createServiceClient();
    if (!admin) return;
    await admin.from("activity_logs").insert({
      user_id: params.userId ?? null,
      email: params.email ?? null,
      ip: clientIp(request),
      action: params.action,
      resource_label: params.resourceLabel ?? null,
      details: params.details ?? null,
    });
  } catch (err) {
    console.error("[activityLog] échec d'écriture:", err instanceof Error ? err.message : err);
  }
}
