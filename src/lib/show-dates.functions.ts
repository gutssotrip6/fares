import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ShowDate } from "@/lib/show-dates";

const CACHE_MS = 60_000;

const text = (max: number) => z.string().trim().max(max).catch("");

const sheetShowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: text(20),
  city: z.string().trim().min(1).max(100),
  venue: text(200),
  show: text(200),
  ticketUrl: z.string().trim().max(2000).regex(/^https?:\/\//i).catch(""),
});

let cache: { at: number; shows: ShowDate[] } | null = null;

// Shows are the rows of the "Dates" tab of the Google Sheet behind GOOGLE_SHEETS_WEBHOOK_URL
// (see google-apps-script/tour-requests.gs). Invalid rows are skipped.
async function readSheetShows(): Promise<ShowDate[]> {
  const webhookUrl = process.env["GOOGLE_SHEETS_WEBHOOK_URL"];
  if (!webhookUrl) throw new Error("Missing GOOGLE_SHEETS_WEBHOOK_URL environment variable.");

  const response = await fetch(webhookUrl, { signal: AbortSignal.timeout(8000) });
  const body = (await response.json()) as { ok?: boolean; shows?: unknown; error?: string };
  if (!response.ok || body.ok !== true || !Array.isArray(body.shows)) {
    throw new Error(`Google Sheet dates failed (${response.status}): ${body.error ?? "no shows"}`);
  }

  return body.shows.flatMap((row) => {
    const parsed = sheetShowSchema.safeParse(row);
    if (!parsed.success) return [];
    const { ticketUrl, ...show } = parsed.data;
    return [{ ...show, sourceUrl: ticketUrl }];
  });
}

export const getUpcomingShows = createServerFn({ method: "GET" }).handler(async () => {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    try {
      cache = { at: Date.now(), shows: await readSheetShows() };
    } catch (error) {
      console.error(error);
      // Keep showing the last known dates and retry after the cache delay.
      cache = { at: Date.now(), shows: cache?.shows ?? [] };
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return cache.shows
    .filter((show) => show.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
});
