import { describe, expect, it } from "vitest";
import { tourRequestSchema } from "@/lib/tour-request";

const request = { email: "fares-fan@example.com", country: "Algérie", city: "Alger" };

describe("Tour city requests", () => {
  it("accepts Arabic country and city names", () => {
    expect(tourRequestSchema.parse({ email: "fan@example.com", country: "الجزائر", city: "الجزائر العاصمة" })).toEqual({ email: "fan@example.com", country: "الجزائر", city: "الجزائر العاصمة" });
  });
  it("requires a valid email", () => {
    expect(tourRequestSchema.safeParse({ ...request, email: "invalid" }).success).toBe(false);
  });
  it("requires a country", () => {
    expect(tourRequestSchema.safeParse({ ...request, country: " " }).success).toBe(false);
  });
  it("requires a city", () => {
    expect(tourRequestSchema.safeParse({ ...request, city: " " }).success).toBe(false);
  });
  it("normalizes and accepts email, country, then city", () => {
    expect(tourRequestSchema.parse({ email: " FAN@EXAMPLE.COM ", country: " Algérie ", city: " Alger " })).toEqual({ email: "fan@example.com", country: "Algérie", city: "Alger" });
  });
  it("rejects oversized or unsafe place names", () => {
    expect(tourRequestSchema.safeParse({ ...request, country: "x".repeat(101) }).success).toBe(false);
    expect(tourRequestSchema.safeParse({ ...request, city: "<script>" }).success).toBe(false);
  });
});