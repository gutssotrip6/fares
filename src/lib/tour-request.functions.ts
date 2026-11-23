import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { tourRequestSchema } from "@/lib/tour-request";

const SAVE_ERROR = "Impossible d’enregistrer votre demande. Réessayez.";

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
});

// Both forms append a row to the Google Sheet behind GOOGLE_SHEETS_WEBHOOK_URL
// (see google-apps-script/tour-requests.gs).
async function appendToGoogleSheet(payload: Record<string, string>) {
  const webhookUrl = process.env["GOOGLE_SHEETS_WEBHOOK_URL"];
  if (!webhookUrl) {
    console.error("Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable.");
    throw new Error(SAVE_ERROR);
  }
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...payload, submittedAt: new Date().toISOString() }),
    });
    const body = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
    if (!response.ok || body?.ok !== true) throw new Error(`Google Sheet webhook failed (${response.status}): ${body?.error ?? "no JSON response"}`);
  } catch (error) {
    console.error(error);
    throw new Error(SAVE_ERROR);
  }
}

export const submitTourRequest = createServerFn({ method: "POST" })
  .validator((input: unknown) => tourRequestSchema.parse(input))
  .handler(async ({ data }) => {
    await appendToGoogleSheet({ type: "tour", ...data });
    return { success: true };
  });

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .validator((input: unknown) => newsletterSchema.parse(input))
  .handler(async ({ data }) => {
    await appendToGoogleSheet({ type: "newsletter", ...data });
    return { success: true };
  });
