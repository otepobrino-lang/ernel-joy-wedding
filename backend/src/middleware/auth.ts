import type { Request, Response, NextFunction } from "express";
import { authClient, db } from "../config/supabase.js";
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) { res.status(401).json({ error: "Authentication required." }); return; }
  try {
    const { data, error } = await authClient.auth.getUser(token);
    if (error || !data.user) { res.status(401).json({ error: "Session invalid or expired." }); return; }
    const { data: admin, error: adminError } = await db.from("admin_users").select("user_id")
      .eq("user_id", data.user.id).eq("role", "admin").eq("is_active", true).maybeSingle();
    if (adminError) throw adminError;
    if (!admin) { res.status(403).json({ error: "Administrator access required." }); return; }
    req.authUser = data.user; req.adminUserId = data.user.id; next();
  } catch (error) { next(error); }
}
