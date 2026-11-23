import { describe, expect, it } from "vitest";
import { SHOW_DATES, isUpcomingShow } from "@/lib/show-dates";

describe("Confirmed show dates", () => {
  it("records the two Artissimo sessions on 10 October 2026", () => {
    expect(SHOW_DATES.filter((show) => show.city === "Alger").map((show) => [show.date, show.time, show.venue])).toEqual([
      ["2026-10-10", "15h00", "Artissimo Hub Créatif et Culturel"],
      ["2026-10-10", "18h00", "Artissimo Hub Créatif et Culturel"],
    ]);
  });
  it("records the Paris duo on 3 April 2026 at 21h30", () => {
    expect(SHOW_DATES.find((show) => show.city === "Paris")).toMatchObject({
      date: "2026-04-03", time: "21h30", venue: "Le République",
      sourceUrl: "https://www.ticketac.com/spectacles/juste-ines-fares-barket",
    });
  });
  it("does not offer these past dates as upcoming on 12 November 2026", () => {
    expect(SHOW_DATES.filter((show) => isUpcomingShow(show, "2026-11-12"))).toEqual([]);
    const confirmedShow = SHOW_DATES[0];
    if (!confirmedShow) throw new Error("Expected a confirmed show");
    expect(isUpcomingShow({ ...confirmedShow, date: "2026-12-01" }, "2026-11-12")).toBe(true);
  });
});