# Prode Mundial 2026 — Guía de Setup

## 1. Instalá dependencias

```bash
npm install
```

## 2. Creá tu proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá un proyecto nuevo (gratis)
2. En **SQL Editor** ejecutá todo el contenido de `supabase/schema.sql`
3. En **Authentication > Providers**, habilitá **Google**:
   - Necesitás crear un proyecto en [Google Cloud Console](https://console.cloud.google.com)
   - Creá credenciales OAuth 2.0 (Web application)
   - URL de callback: `https://TU-PROYECTO.supabase.co/auth/v1/callback`
   - Pegá el Client ID y Client Secret en Supabase

## 3. Configurá las variables de entorno

```bash
cp .env.local.example .env.local
```

Editá `.env.local` con tus valores de Supabase y football-data.org:
- `NEXT_PUBLIC_SUPABASE_URL` → Settings > API > Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Settings > API > anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → Settings > API > service_role key
- `FOOTBALL_DATA_API_KEY` → Registrarse en football-data.org (gratis)
- `CRON_SECRET` → Cualquier string secreto (ej: `openssl rand -hex 32`)

## 4. Probá en local

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000)

## 5. Sincronizá el fixture del Mundial

Una vez que el fixture esté disponible en football-data.org (cuando empiece el torneo):

```bash
curl -X POST http://localhost:3000/api/sync-matches \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

## 6. Deploy en Vercel

```bash
npm i -g vercel
vercel
```

Agrega todas las variables de `.env.local` en **Vercel > Settings > Environment Variables**.

El cron de Vercel (`vercel.json`) va a correr `/api/cron/update-results` cada 5 minutos automáticamente durante el Mundial.

## Sistema de puntos

| Resultado | Puntos |
|-----------|--------|
| Resultado exacto (ej: predijiste 2-1, salió 2-1) | **3 pts** |
| Ganador correcto (ej: predijiste 2-1, salió 3-0) | **1 pt** |
| Error | **0 pts** |

## Estructura del proyecto

```
app/
  login/          → Pantalla de login con Google
  fixture/        → Todos los partidos del Mundial
  tabla/          → Tabla de posiciones
  mis-predicciones/ → Tus pronósticos y puntos
  api/
    auth/callback → OAuth callback de Supabase
    sync-matches  → Sincronizar fixture desde football-data.org
    cron/update-results → Actualizar resultados y puntos (cron)
components/       → Header, MatchCard, PredictionModal, Leaderboard, etc.
lib/              → Supabase client, football API, utilidades
supabase/         → Schema SQL de la base de datos
```
