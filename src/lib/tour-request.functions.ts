import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { tourRequestSchema, type TourRequest } from "@/lib/tour-request";

const SAVE_ERROR = "Impossible d’enregistrer votre demande. Réessayez.";

async function appendToGoogleSheet(webhookUrl: string, data: TourRequest) {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...data, submittedAt: new Date().toISOString() }),
  });
  const body = (await response.json().catch(() => null)) as { ok?: boolean } | null;
  if (!response.ok || body?.ok !== true) throw new Error(`Google Sheet webhook failed (${response.status})`);
}

async function insertIntoSupabase(url: string, key: string, data: TourRequest) {
  const client = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } },
  });
  const { error } = await client.from("tour_city_requests").insert(data);
  if (error) throw error;
}

// Submissions go to the Google Sheet (GOOGLE_SHEETS_WEBHOOK_URL) and, when configured, Supabase.
// The request succeeds as long as one destination saved it.
export const submitTourRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => tourRequestSchema.parse(input))
  .handler(async ({ data }) => {
    const sheetUrl = process.env["GOOGLE_SHEETS_WEBHOOK_URL"];
    const supabaseUrl = process.env["SUPABASE_URL"];
    const supabaseKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
    if (!sheetUrl && !(supabaseUrl && supabaseKey)) throw new Error("Les inscriptions sont momentanément indisponibles.");

    const results = await Promise.allSettled([
      sheetUrl ? appendToGoogleSheet(sheetUrl, data) : Promise.reject(new Error("skipped")),
      supabaseUrl && supabaseKey ? insertIntoSupabase(supabaseUrl, supabaseKey, data) : Promise.reject(new Error("skipped")),
    ]);
    results.forEach((result) => {
      if (result.status === "rejected" && result.reason?.message !== "skipped") console.error(result.reason);
    });
    if (!results.some((result) => result.status === "fulfilled")) throw new Error(SAVE_ERROR);
    return { success: true };
  });
