import { z } from "zod";

const placeName = (min: number, message: string) => z.string().trim().min(min, message).max(100, "100 caractères maximum.").regex(/^[\p{L}\p{M}\p{N} .,'’()\-]+$/u, "Utilisez un nom de lieu valide.");

export const tourRequestSchema = z.object({
  email: z.string().trim().toLowerCase().email("Indiquez une adresse e-mail valide.").max(255, "255 caractères maximum."),
  country: placeName(2, "Indiquez votre pays."),
  city: placeName(1, "Indiquez votre ville."),
});

export type TourRequest = z.infer<typeof tourRequestSchema>;
