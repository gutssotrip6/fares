CREATE TABLE public.tour_city_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 created_at timestamptz NOT NULL DEFAULT now(),
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255 AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 country text NOT NULL CHECK (char_length(btrim(country)) BETWEEN 2 AND 100 AND country !~ '[[:cntrl:]<>]'),
 city text NOT NULL CHECK (char_length(btrim(city)) BETWEEN 1 AND 100 AND city !~ '[[:cntrl:]<>]')
);
GRANT INSERT ON public.tour_city_requests TO anon, authenticated;
GRANT ALL ON public.tour_city_requests TO service_role;
ALTER TABLE public.tour_city_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visitors can submit city requests" ON public.tour_city_requests FOR INSERT TO anon, authenticated WITH CHECK (true);