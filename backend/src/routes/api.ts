import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, authClient } from "../config/supabase.js";
import { requireAdmin } from "../middleware/auth.js";
import { rsvpSchema, rsvpUpdateSchema, entourageSchema, gallerySchema, settingsSchema, eventSchema, uuidSchema } from "../validation/schemas.js";

export const apiRouter = Router();
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: "draft-7", legacyHeaders: false });
const asyncRoute = (fn: (req: any, res: any) => Promise<void>) => (req: any, res: any, next: any) => Promise.resolve(fn(req,res)).catch(next);
const audit = async (req: any, action: string, type: string, id?: string) => {
  const { error } = await db.from("audit_logs").insert({ actor_user_id: req.adminUserId, action, resource_type: type, resource_id: id ?? null });
  if (error) throw error;
};
const badId = (id: string, res: any) => { const parsed = uuidSchema.safeParse(id); if (!parsed.success) { res.status(400).json({ error: "Invalid ID." }); return null; } return parsed.data; };

apiRouter.get("/public/settings", asyncRoute(async (_req,res) => {
  const {data,error}=await db.from("wedding_settings").select("partner_one_name,partner_two_name,wedding_datetime,timezone,rsvp_deadline,welcome_message,dress_code,color_motif,guest_instructions").eq("is_published",true).maybeSingle();
  if(error) throw error; res.json({data});
}));
apiRouter.get("/public/events", asyncRoute(async (_req,res) => {
  const {data,error}=await db.from("wedding_events").select("id,event_type,title,venue_name,venue_address,event_datetime,description,directions_url,maps_url,qr_target_url,display_order").eq("is_published",true).order("display_order");
  if(error) throw error; res.json({data:data??[]});
}));
apiRouter.get("/public/entourage", asyncRoute(async (_req,res) => {
  const {data,error}=await db.from("entourage_members").select("id,group_name,role_name,full_name,description,photo_path,display_order").eq("is_published",true).order("display_order");
  if(error) throw error; res.json({data:data??[]});
}));
apiRouter.get("/public/gallery", asyncRoute(async (_req,res) => {
  const {data,error}=await db.from("gallery_photos").select("id,title,caption,alt_text,storage_path,display_order").eq("is_published",true).order("display_order");
  if(error) throw error;
  const photos=await Promise.all((data??[]).map(async p=>{const {data:signed,error:e}=await db.storage.from("wedding-gallery").createSignedUrl(p.storage_path,1800); return {...p,image_url:e?null:signed.signedUrl};}));
  res.json({data:photos});
}));
apiRouter.post("/public/rsvp",limiter,asyncRoute(async(req,res)=>{
  const parsed=rsvpSchema.safeParse(req.body);
  if(!parsed.success){res.status(400).json({error:"Please check the RSVP fields.",details:parsed.error.flatten().fieldErrors});return;}
  if(parsed.data.website){res.status(201).json({message:"Thank you. Your RSVP has been received."});return;}
  const {data:settings,error:se}=await db.from("wedding_settings").select("rsvp_deadline").eq("is_published",true).maybeSingle();
  if(se) throw se;
  if(!settings){res.status(503).json({error:"The invitation is temporarily unavailable."});return;}
  if(settings.rsvp_deadline && Date.now()>new Date(settings.rsvp_deadline).getTime()){res.status(410).json({error:"The RSVP deadline has passed."});return;}
  const v=parsed.data;
  const {data,error}=await db.from("rsvp_submissions").insert({
    full_name:v.fullName,email:v.email||null,contact_number:v.contactNumber||null,
    relationship_to_couple:v.relationshipToCouple||null,attendance_response:v.attendanceResponse,
    dietary_restrictions:v.dietaryRestrictions||null,message:v.message||null,privacy_consent:v.privacyConsent,
  }).select("id").single();
  if(error) throw error;
  res.status(201).json({message:"Thank you. Your RSVP has been received.",reference:data.id});
}));

apiRouter.use("/admin",requireAdmin);
apiRouter.get("/admin/rsvps/stats",asyncRoute(async(_req,res)=>{
  const {data,error}=await db.from("rsvp_submissions").select("attendance_response,created_at"); if(error)throw error;
  const rows=data??[]; res.json({data:{total:rows.length,attending:rows.filter(r=>r.attendance_response==="attending").length,celebratingFromAfar:rows.filter(r=>r.attendance_response==="celebrating_from_afar").length}});
}));
apiRouter.get("/admin/rsvps/export.csv",asyncRoute(async(_req,res)=>{
  const {data,error}=await db.from("rsvp_submissions").select("*").order("created_at",{ascending:false}); if(error)throw error;
  const cols=["id","full_name","email","contact_number","relationship_to_couple","attendance_response","dietary_restrictions","message","created_at"];
  const esc=(v:unknown)=>`"${String(v??"").replace(/"/g,'""')}"`;
  const csv=[cols.join(","),...(data??[]).map(row=>cols.map(c=>esc((row as Record<string,unknown>)[c])).join(","))].join("\r\n");
  res.setHeader("Content-Type","text/csv; charset=utf-8");res.setHeader("Content-Disposition",'attachment; filename="wedding-rsvps.csv"');res.send("\uFEFF"+csv);
}));
apiRouter.get("/admin/rsvps",asyncRoute(async(req,res)=>{
  const page=Math.max(1,Number(req.query.page)||1),limit=Math.min(100,Math.max(1,Number(req.query.limit)||25));
  const search=typeof req.query.search==="string"?req.query.search.trim().slice(0,120):"";
  let q=db.from("rsvp_submissions").select("*",{count:"exact"});
  if(search)q=q.ilike("full_name",`%${search.replace(/[%_,]/g,"")}%`);
  if(req.query.attendance==="attending"||req.query.attendance==="celebrating_from_afar")q=q.eq("attendance_response",req.query.attendance);
  const {data,error,count}=await q.order("created_at",{ascending:false}).range((page-1)*limit,page*limit-1);if(error)throw error;
  res.json({data:data??[],pagination:{page,limit,total:count??0}});
}));
apiRouter.get("/admin/rsvps/:id",asyncRoute(async(req,res)=>{
  const id=badId(req.params.id,res);if(!id)return;
  const {data,error}=await db.from("rsvp_submissions").select("*").eq("id",id).maybeSingle();if(error)throw error;
  if(!data){res.status(404).json({error:"RSVP not found."});return;}res.json({data});
}));
apiRouter.patch("/admin/rsvps/:id",asyncRoute(async(req,res)=>{
  const id=badId(req.params.id,res);if(!id)return;const p=rsvpUpdateSchema.safeParse(req.body);
  if(!p.success){res.status(400).json({error:"Invalid RSVP update.",details:p.error.flatten()});return;}
  const map:Record<string,string>={fullName:"full_name",email:"email",contactNumber:"contact_number",relationshipToCouple:"relationship_to_couple",attendanceResponse:"attendance_response",dietaryRestrictions:"dietary_restrictions",message:"message"};
  const update=Object.fromEntries(Object.entries(p.data).map(([k,v])=>[map[k],v]));
  const {data,error}=await db.from("rsvp_submissions").update(update).eq("id",id).select("*").maybeSingle();if(error)throw error;
  if(!data){res.status(404).json({error:"RSVP not found."});return;}await audit(req,"update","rsvp_submission",id);res.json({data});
}));
apiRouter.delete("/admin/rsvps/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const {error}=await db.from("rsvp_submissions").delete().eq("id",id);if(error)throw error;await audit(req,"delete","rsvp_submission",id);res.status(204).send();}));

apiRouter.get("/admin/entourage",asyncRoute(async(_req,res)=>{const {data,error}=await db.from("entourage_members").select("*").order("display_order");if(error)throw error;res.json({data:data??[]});}));
apiRouter.post("/admin/entourage",asyncRoute(async(req,res)=>{const p=entourageSchema.safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid entourage data.",details:p.error.flatten()});return;}const {data,error}=await db.from("entourage_members").insert(p.data).select("*").single();if(error)throw error;await audit(req,"create","entourage_member",data.id);res.status(201).json({data});}));
apiRouter.patch("/admin/entourage/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const p=entourageSchema.partial().safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid entourage data.",details:p.error.flatten()});return;}const {data,error}=await db.from("entourage_members").update(p.data).eq("id",id).select("*").maybeSingle();if(error)throw error;if(!data){res.status(404).json({error:"Entourage member not found."});return;}await audit(req,"update","entourage_member",id);res.json({data});}));
apiRouter.delete("/admin/entourage/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const {error}=await db.from("entourage_members").delete().eq("id",id);if(error)throw error;await audit(req,"delete","entourage_member",id);res.status(204).send();}));

apiRouter.get("/admin/gallery",asyncRoute(async(_req,res)=>{const {data,error}=await db.from("gallery_photos").select("*").order("display_order");if(error)throw error;res.json({data:data??[]});}));
apiRouter.post("/admin/gallery",asyncRoute(async(req,res)=>{const p=gallerySchema.safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid gallery data.",details:p.error.flatten()});return;}const {data,error}=await db.from("gallery_photos").insert(p.data).select("*").single();if(error)throw error;await audit(req,"create","gallery_photo",data.id);res.status(201).json({data});}));
apiRouter.patch("/admin/gallery/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const p=gallerySchema.partial().safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid gallery data.",details:p.error.flatten()});return;}const {data,error}=await db.from("gallery_photos").update(p.data).eq("id",id).select("*").maybeSingle();if(error)throw error;if(!data){res.status(404).json({error:"Gallery photo not found."});return;}await audit(req,"update","gallery_photo",id);res.json({data});}));
apiRouter.delete("/admin/gallery/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const {error}=await db.from("gallery_photos").delete().eq("id",id);if(error)throw error;await audit(req,"delete","gallery_photo",id);res.status(204).send();}));

apiRouter.patch("/admin/settings",asyncRoute(async(req,res)=>{const p=settingsSchema.safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid settings.",details:p.error.flatten()});return;}const {data,error}=await db.from("wedding_settings").update(p.data).eq("singleton",true).select("*").single();if(error)throw error;await audit(req,"update","wedding_settings",data.id);res.json({data});}));
apiRouter.patch("/admin/events/:id",asyncRoute(async(req,res)=>{const id=badId(req.params.id,res);if(!id)return;const p=eventSchema.safeParse(req.body);if(!p.success){res.status(400).json({error:"Invalid event.",details:p.error.flatten()});return;}const {data,error}=await db.from("wedding_events").update(p.data).eq("id",id).select("*").maybeSingle();if(error)throw error;if(!data){res.status(404).json({error:"Event not found."});return;}await audit(req,"update","wedding_event",id);res.json({data});}));
