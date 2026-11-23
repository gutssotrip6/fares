import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/language";
import { tourRequestSchema } from "@/lib/tour-request";
import { submitTourRequest } from "@/lib/tour-request.functions";

export function TourCityForm() {
  const { t } = useLanguage();
  const submit = useServerFn(submitTourRequest);
  const [values, setValues] = useState({ email: "", country: "", city: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    const parsed = tourRequestSchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0]?.path[0] === "email" ? t.invalidEmail : parsed.error.issues[0]?.path[0] === "country" ? t.invalidCountry : t.invalidCity); return; }
    setError("");
    setStatus("loading");
    try {
      await submit({ data: parsed.data });
      setStatus("success");
      setValues({ email: "", country: "", city: "" });
    } catch {
      setStatus("idle");
      setError(t.tourError);
    }
  }

  return (
    <section id="city-request" className="mx-auto max-w-6xl px-5 pb-20 pt-8">
      <h2 className="font-display-italic text-4xl text-primary sm:text-5xl md:text-6xl">{t.soon}</h2>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        {t.tourIntro}
      </p>
      {status === "success" ? (
        <p role="status" className="mt-8 rounded-sm border border-border bg-card p-6 text-lg font-semibold text-primary">
          {t.tourSuccess}
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 rounded-sm border border-border bg-card p-6 sm:p-8" aria-label={t.formLabel}>
          <div className="grid gap-5 text-start sm:grid-cols-2">
            <label className="flex min-w-0 flex-col gap-2 font-semibold sm:col-span-2" htmlFor="tour-email">
              {t.email}
              <input id="tour-email" name="email" type="email" autoComplete="email" required maxLength={255} value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} placeholder={t.emailPlaceholder} dir="ltr" className="min-w-0 rounded-sm border border-input bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label className="flex min-w-0 flex-col gap-2 font-semibold" htmlFor="tour-country">
              {t.country}
              <input id="tour-country" name="country" autoComplete="country-name" required minLength={2} maxLength={100} value={values.country} onChange={(event) => setValues({ ...values, country: event.target.value })} placeholder={t.countryPlaceholder} className="min-w-0 rounded-sm border border-input bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
            </label>
            <label className="flex min-w-0 flex-col gap-2 font-semibold" htmlFor="tour-city">
              {t.city}
              <input id="tour-city" name="city" autoComplete="address-level2" required maxLength={100} value={values.city} onChange={(event) => setValues({ ...values, city: event.target.value })} placeholder={t.cityPlaceholder} className="min-w-0 rounded-sm border border-input bg-background px-4 py-3 font-normal outline-none focus:ring-2 focus:ring-primary" />
            </label>
          </div>
          {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
          <Button type="submit" disabled={status === "loading"} className="mt-6 h-auto w-full rounded-sm px-8 py-4 text-sm font-extrabold uppercase tracking-widest sm:w-auto">{status === "loading" ? t.sending : t.send}</Button>
        </form>
      )}
    </section>
  );
}
