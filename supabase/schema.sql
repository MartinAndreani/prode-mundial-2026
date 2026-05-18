-- ============================================================
-- Prode Mundial 2026 — Schema SQL
-- Ejecutar en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Tabla de partidos (sincronizada desde football-data.org)
CREATE TABLE public.matches (
  id          TEXT PRIMARY KEY,
  home_team   TEXT NOT NULL,
  away_team   TEXT NOT NULL,
  home_team_crest TEXT,
  away_team_crest TEXT,
  group_name  TEXT,
  stage       TEXT NOT NULL DEFAULT 'GROUP_STAGE',
  utc_date    TIMESTAMPTZ NOT NULL,
  status      TEXT NOT NULL DEFAULT 'TIMED',
  home_score  INTEGER,
  away_score  INTEGER,
  winner      TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de predicciones
CREATE TABLE public.predictions (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id              TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_home_goals  INTEGER NOT NULL CHECK (predicted_home_goals >= 0),
  predicted_away_goals  INTEGER NOT NULL CHECK (predicted_away_goals >= 0),
  points_earned         INTEGER NOT NULL DEFAULT 0,
  scored                BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Tabla de perfiles (se crea automáticamente al registrarse)
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE public.matches     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;

-- Partidos: todos pueden leer
CREATE POLICY "matches_select_all" ON public.matches
  FOR SELECT USING (true);

-- Solo el cron (service_role) puede insertar/actualizar partidos
CREATE POLICY "matches_insert_service" ON public.matches
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "matches_update_service" ON public.matches
  FOR UPDATE TO service_role USING (true);

-- Predicciones: usuarios autenticados pueden leer todo (para tabla de puntos)
CREATE POLICY "predictions_select_auth" ON public.predictions
  FOR SELECT TO authenticated USING (true);

-- Cada usuario solo puede crear/editar sus propias predicciones
CREATE POLICY "predictions_insert_own" ON public.predictions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON public.predictions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- El cron puede actualizar puntos
CREATE POLICY "predictions_update_service" ON public.predictions
  FOR UPDATE TO service_role USING (true);

-- Perfiles: todos los auth pueden leer
CREATE POLICY "profiles_select_auth" ON public.profiles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Vista para leaderboard
-- ============================================================

CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.user_id,
  pr.full_name,
  pr.avatar_url,
  COUNT(p.id)::INTEGER       AS total_predictions,
  COALESCE(SUM(p.points_earned), 0)::INTEGER AS total_points,
  RANK() OVER (ORDER BY COALESCE(SUM(p.points_earned), 0) DESC) AS rank
FROM public.predictions p
JOIN public.profiles pr ON p.user_id = pr.id
GROUP BY p.user_id, pr.full_name, pr.avatar_url;
