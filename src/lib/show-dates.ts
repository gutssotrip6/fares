export type ShowDate = {
  date: string;
  time: string;
  city: string;
  venue: string;
  show: string;
  sourceUrl: string;
};

// Confirmed on 2026-11-12 using the linked ticketing announcements.
// Sacoddo's date input confirms 2026-10-10 in Algeria (UTC+1).
export const SHOW_DATES: ShowDate[] = [
  {
    date: "2026-10-10", time: "15h00", city: "Alger",
    venue: "Artissimo Hub Créatif et Culturel", show: "Spectacle Fares Barket — 2ème session",
    sourceUrl: "https://sacoddo.com/activities/SPECTACLE-FARES-BARKET--2me-SESSION-",
  },
  {
    date: "2026-10-10", time: "18h00", city: "Alger",
    venue: "Artissimo Hub Créatif et Culturel", show: "Spectacle Fares Barket",
    sourceUrl: "https://sacoddo.com/activities/SPECTACLE-FARES-BARKET--2me-SESSION-",
  },
  {
    date: "2026-04-03", time: "21h30", city: "Paris",
    venue: "Le République", show: "Juste Inès & Fares Barket — 30/30",
    sourceUrl: "https://www.ticketac.com/spectacles/juste-ines-fares-barket",
  },
];

export function isUpcomingShow(show: ShowDate, today: string) {
  return show.date >= today;
}