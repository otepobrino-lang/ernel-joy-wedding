Phase 4 Express backend source files.

Copy this archive's src folder into your existing backend folder, replacing backend/src/server.ts and adding the other folders. Preserve your existing package.json and tsconfig.json.

Required dependencies were installed in Phase 1: express, cors, helmet, dotenv, zod, express-rate-limit, @supabase/supabase-js, pino, pino-http, typescript, tsx, @types/node, @types/express, @types/cors.

Copy backend/.env.example to backend/.env and fill in values from Supabase Project Settings -> API. SUPABASE_SERVICE_ROLE_KEY is server-only. Never put it in frontend/.env or commit backend/.env.

Public endpoints:
GET /api/public/settings
GET /api/public/events
GET /api/public/entourage
GET /api/public/gallery
POST /api/public/rsvp

Admin endpoints require Authorization: Bearer <Supabase access token>.
GET /api/admin/rsvps/stats
GET /api/admin/rsvps?page=1&limit=25&search=
GET /api/admin/rsvps/export.csv
GET/PATCH/DELETE /api/admin/rsvps/:id
GET/POST /api/admin/entourage; PATCH/DELETE /api/admin/entourage/:id
GET/POST /api/admin/gallery; PATCH/DELETE /api/admin/gallery/:id
PATCH /api/admin/settings
PATCH /api/admin/events/:id

This phase implements gallery metadata management and signed URLs for already-uploaded private images. Binary image uploads and frontend integration are later phases.
