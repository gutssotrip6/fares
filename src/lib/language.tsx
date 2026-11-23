import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const fr = {
  name: "Fares Barket", dates: "Dates", fares: "Fares", newsletter: "Newsletter", tickets: "Billetterie",
  reserve: "Réserver mes places", poster: "Affiche du spectacle Fils de Habiba de Fares Barket",
  confirmed: "Les dates confirmées des spectacles de Fares Barket.", ticket: "Réserver", past: "Date passée",
  datesComingSoon: "Les prochaines dates arrivent bientôt.",
  bioTitle: "Qui est Fares ?",
  bio: "Révélé sur les réseaux par ses sketchs sur la famille et le quotidien, Fares Barket s'est imposé comme l'une des voix montantes de l'humour. Avec « Fils de Habiba » (ولد حبيبة), il rend un hommage drôle et tendre aux mamans qui nous couvent bien trop longtemps — entre harira, tricot et remarques bien senties.",
  newsIntro: "Nouvelles dates, vidéos et ventes en avant-première : soyez les premiers informés.",
  newsSuccess: "Merci ! Vous êtes bien inscrit(e).", subscribe: "S'inscrire", sending: "Envoi en cours…",
  newsError: "Oups, une erreur est survenue. Réessayez.", rights: "Tous droits réservés",
  instagram: "Instagram", youtube: "YouTube", facebook: "Facebook",
  soon: "Bientôt dans votre ville",
  tourIntro: "Fares prépare sa tournée. Laissez votre e-mail, votre pays et votre ville pour être informé(e) en premier quand il passe près de chez vous.",
  tourSuccess: "Merci ! Votre demande a bien été enregistrée.", tourError: "Impossible d’enregistrer votre demande. Réessayez.",
  formLabel: "Demande de spectacle dans votre ville", email: "E-mail", country: "Pays", city: "Ville",
  emailPlaceholder: "Votre adresse e-mail", countryPlaceholder: "Votre pays", cityPlaceholder: "Votre ville",
  send: "Envoyer ma demande", invalidEmail: "Indiquez une adresse e-mail valide.", invalidCountry: "Indiquez un pays valide (2 à 100 caractères).", invalidCity: "Indiquez une ville valide (1 à 100 caractères).",
  months: ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEP", "OCT", "NOV", "DÉC"],
  cities: ["Alger", "Alger", "Paris"], venues: ["Artissimo Hub Créatif et Culturel", "Artissimo Hub Créatif et Culturel", "Le République"],
  shows: ["Spectacle Fares Barket — 2ème session", "Spectacle Fares Barket", "Juste Inès & Fares Barket — 30/30"],
};

const ar: typeof fr = {
  name: "فارس باركت", dates: "المواعيد", fares: "فارس", newsletter: "النشرة البريدية", tickets: "التذاكر",
  reserve: "احجز تذاكرك", poster: "ملصق عرض ولد حبيبة لفارس باركت",
  confirmed: "المواعيد المؤكدة لعروض فارس باركت.", ticket: "احجز", past: "عرض سابق",
  datesComingSoon: "المواعيد القادمة قريباً.",
  bioTitle: "من هو فارس؟",
  bio: "برز فارس باركت على مواقع التواصل الاجتماعي من خلال مقاطعه الكوميدية عن العائلة والحياة اليومية، ليصبح أحد الأسماء الصاعدة في عالم الكوميديا. في عرضه «ولد حبيبة»، يقدم تحية مليئة بالضحك والحنان للأمهات اللواتي يفرطن في رعايتنا، بين الحريرة والحياكة والتعليقات اللاذعة.",
  newsIntro: "مواعيد جديدة، فيديوهات وتذاكر قبل الجميع: كن أول من يعرف.",
  newsSuccess: "شكراً! تم اشتراكك بنجاح.", subscribe: "اشترك", sending: "جارٍ الإرسال…",
  newsError: "حدث خطأ. يرجى المحاولة مجدداً.", rights: "جميع الحقوق محفوظة",
  instagram: "إنستغرام", youtube: "يوتيوب", facebook: "فيسبوك",
  soon: "قريباً في مدينتكم",
  tourIntro: "يستعد فارس لجولته. اترك بريدك الإلكتروني وبلدك ومدينتك لتكون أول من يعرف عندما يقدم عرضاً بالقرب منك.",
  tourSuccess: "شكراً! تم تسجيل طلبك بنجاح.", tourError: "تعذّر تسجيل طلبك. يرجى المحاولة مجدداً.",
  formLabel: "طلب عرض في مدينتك", email: "البريد الإلكتروني", country: "البلد", city: "المدينة",
  emailPlaceholder: "بريدك الإلكتروني", countryPlaceholder: "بلدك", cityPlaceholder: "مدينتك",
  send: "أرسل طلبي", invalidEmail: "يرجى إدخال بريد إلكتروني صالح.", invalidCountry: "يرجى إدخال بلد صالح (من حرفين إلى 100 حرف).", invalidCity: "يرجى إدخال مدينة صالحة (من حرف إلى 100 حرف).",
  months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  cities: ["الجزائر", "الجزائر", "باريس"], venues: ["أرتيسيمو، فضاء الإبداع والثقافة", "أرتيسيمو، فضاء الإبداع والثقافة", "مسرح لو ريبوبليك"],
  shows: ["عرض فارس باركت — الجلسة الثانية", "عرض فارس باركت", "جوست إيناس وفارس باركت — 30/30"],
};

type Language = "fr" | "ar";
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void; t: typeof fr }>({ language: "fr", setLanguage: () => {}, t: fr });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("fr");
  useEffect(() => {
    try { if (localStorage.getItem("fares-language") === "ar") setLanguage("ar"); } catch { /* Storage may be unavailable. */ }
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);
  function changeLanguage(next: Language) {
    setLanguage(next);
    try { localStorage.setItem("fares-language", next); } catch { /* Switching still works without storage. */ }
  }
  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: language === "ar" ? ar : fr }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);