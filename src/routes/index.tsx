import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import portraitUrl from "@/assets/fares-hero.webp";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { TourCityForm } from "@/components/tour-city-form";
import type { ShowDate } from "@/lib/show-dates";
import { getUpcomingShows } from "@/lib/show-dates.functions";
import { subscribeNewsletter } from "@/lib/tour-request.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fares Barket | Billetterie" },
      { name: "description", content: "Site officiel de Fares Barket, humoriste. Retrouvez les prochaines dates de spectacle, la billetterie et demandez sa venue dans votre ville." },
      { property: "og:title", content: "Fares Barket" },
      { property: "og:description", content: "Site officiel de Fares Barket, humoriste. Retrouvez les prochaines dates de spectacle, la billetterie et demandez sa venue dans votre ville." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getUpcomingShows(),
  component: Index,
});

function Index() {
  const { language, setLanguage, t } = useLanguage();
  const shows = Route.useLoaderData();
  // "Réserver" opens the ticket link of the next show that has one, else scrolls to the dates.
  const reserveUrl = shows.find((show) => show.sourceUrl)?.sourceUrl;
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="site-header sticky top-0 z-20 bg-primary text-primary-foreground">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:h-[72px] md:px-8 md:py-0">
          <a href="#top" className="font-display-italic text-2xl">{t.name}</a>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest sm:gap-6">
            <a href="#dates" className="hidden hover:text-accent sm:inline">{t.dates}</a>
            <a href="#bio" className="hidden hover:text-accent sm:inline">{t.fares}</a>
            <a href="#newsletter" className="hidden hover:text-accent sm:inline">{t.newsletter}</a>
            <a href="#dates" className="rounded-sm bg-ink px-4 py-2 text-ink-foreground">{t.tickets}</a>
            <Button variant="ghost" onClick={() => setLanguage(language === "fr" ? "ar" : "fr")} aria-label={language === "fr" ? "Passer en arabe" : "التبديل إلى الفرنسية"} className="h-9 shrink-0 rounded-sm border border-primary-foreground/40 px-3 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" lang={language === "fr" ? "ar" : "fr"}>
              {language === "fr" ? "العربية" : "FR"}
            </Button>
          </div>
        </nav>
      </header>

      <section id="top" className="portrait-hero bg-primary text-primary-foreground">
        <div className="portrait-layout">
          <img src={portraitUrl} alt={t.name} width={1920} height={1280} fetchPriority="high" className="hero-portrait" />
          <div className="portrait-actions">
            <Button asChild className="btn-pulse h-auto w-full rounded-sm bg-ink px-8 py-4 text-center text-sm font-extrabold uppercase tracking-widest text-ink-foreground shadow-none hover:bg-ink hover:opacity-90 sm:w-auto">
              <a href={reserveUrl ?? "#dates"} {...(reserveUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}><span className="btn-label">{t.reserve}</span></a>
            </Button>
          </div>
        </div>
      </section>

      <ShowDates shows={shows} />

      <TourCityForm />

      <section id="bio" className="bg-muted">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="font-display-italic text-5xl text-primary md:text-6xl">{t.bioTitle}</h2>
          <p className="mt-8 text-lg leading-relaxed">
            {t.bio}
          </p>
        </div>
      </section>

      <Newsletter />

      <footer className="bg-royal-deep py-8 text-center text-sm text-primary-foreground opacity-95">
        <div className="mb-4 flex justify-center gap-6 font-semibold uppercase tracking-widest">
          <a href="https://www.instagram.com/faresbarkett" target="_blank" rel="noopener noreferrer" className="hover:text-accent">{t.instagram}</a>
          <a href="https://www.youtube.com/@faresbarkett" target="_blank" rel="noopener noreferrer" className="hover:text-accent">{t.youtube}</a>
          <a href="https://www.facebook.com/faresbarkett/" target="_blank" rel="noopener noreferrer" className="hover:text-accent">{t.facebook}</a>
        </div>
        <a href="mailto:faresbarkettpro@gmail.com" dir="ltr" className="mb-4 block font-semibold hover:text-accent">faresbarkettpro@gmail.com</a>
        © {new Date().getFullYear()} {t.name} — {t.rights}
      </footer>
    </div>
  );
}

function formatShowDate(show: ShowDate, months: string[]) {
  const [year, month, day] = show.date.split("-");
  return { day, month: months[Number(month) - 1] ?? "", year };
}

// Upcoming shows come from the "Dates" tab of the Google Sheet (see show-dates.functions.ts).
function ShowDates({ shows }: { shows: ShowDate[] }) {
  const { t } = useLanguage();
  if (shows.length === 0) {
    return (
      <section id="dates" className="mx-auto max-w-3xl px-5 pt-20 pb-8 text-center">
        <h2 className="font-display-italic text-5xl text-primary md:text-6xl">{t.tickets}</h2>
        <p className="mt-8 inline-block rounded-sm border border-primary/20 bg-primary/5 px-8 py-5 text-xl font-semibold text-primary shadow-sm">{t.datesComingSoon}</p>
      </section>
    );
  }
  return (
    <section id="dates" className="mx-auto max-w-6xl px-5 pt-20 pb-8">
      <h2 className="text-center font-display-italic text-5xl text-primary md:text-6xl">{t.tickets}</h2>
      <p className="mt-2 text-center text-muted-foreground">{t.confirmed}</p>
      <ul className="mt-10 flex flex-wrap justify-center gap-4">
        {shows.map((show) => {
          const d = formatShowDate(show, t.months);
          return (
            <li key={show.date + show.time + show.city} className="flex w-full flex-col overflow-hidden rounded-sm border border-border bg-card sm:w-80">
              <div className="flex items-center justify-between gap-3 bg-primary px-5 py-3 text-primary-foreground">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold leading-none">{d.day}</span>
                  <span className="text-sm font-semibold uppercase tracking-wide">{d.month} {d.year}</span>
                </div>
                <bdi className="text-sm font-bold">{show.time}</bdi>
              </div>
              <div className="flex flex-1 flex-col gap-1 px-5 py-4 text-center break-words">
                <div className="text-lg font-extrabold uppercase">{show.show}</div>
                <div className="text-sm text-muted-foreground">{show.venue}</div>
                <div className="text-sm">{show.city}</div>
              </div>
              {show.sourceUrl && (
                <div className="px-5 pb-5">
                  <a href={show.sourceUrl} target="_blank" rel="noopener noreferrer" className="block rounded-sm bg-primary px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-primary-foreground hover:bg-royal-deep">{t.ticket}</a>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Newsletter() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const subscribe = useServerFn(subscribeNewsletter);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await subscribe({ data: { email } });
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="newsletter" className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        <h2 className="font-display-italic text-5xl md:text-6xl">{t.newsletter}</h2>
        <p className="mt-4 opacity-90">{t.newsIntro}</p>
        {status === "ok" ? (
          <p className="mt-8 text-lg font-bold text-accent">{t.newsSuccess}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email" required maxLength={255} value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder} aria-label={t.email} dir="ltr"
              className="flex-1 rounded-sm bg-background px-4 py-4 text-foreground outline-none focus:ring-2 focus:ring-accent"
            />
            <Button disabled={status === "loading"} className="h-auto rounded-sm bg-ink px-8 py-4 text-sm font-extrabold uppercase tracking-widest text-ink-foreground hover:opacity-90 disabled:opacity-60">
              {status === "loading" ? t.sending : t.subscribe}
            </Button>
          </form>
        )}
        {status === "error" && <p className="mt-4 text-accent">{t.newsError}</p>}
      </div>
    </section>
  );
}
