import { z } from "zod";
const optionalText = (max: number) => z.string().trim().max(max).optional().nullable();
export const rsvpSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  contactNumber: optionalText(40),
  relationshipToCouple: optionalText(100),
  attendanceResponse: z.enum(["attending", "celebrating_from_afar"]),
  dietaryRestrictions: optionalText(1000),
  message: optionalText(1500),
  privacyConsent: z.literal(true),
  website: z.string().max(0).optional().default(""),
}).strict();
export const rsvpUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email().max(254).nullable().optional(),
  contactNumber: optionalText(40),
  relationshipToCouple: optionalText(100),
  attendanceResponse: z.enum(["attending", "celebrating_from_afar"]).optional(),
  dietaryRestrictions: optionalText(1000), message: optionalText(1500),
}).strict();
export const entourageSchema = z.object({
  group_name: z.string().trim().min(1).max(120), role_name: z.string().trim().min(1).max(120),
  full_name: z.string().trim().min(1).max(160), description: optionalText(1000),
  photo_path: optionalText(500), display_order: z.number().int().min(0).max(10000).optional(),
  is_published: z.boolean().optional(),
}).strict();
export const gallerySchema = z.object({
  title: optionalText(180), caption: optionalText(1000), alt_text: z.string().trim().min(1).max(250),
  storage_path: z.string().trim().min(1).max(500), display_order: z.number().int().min(0).max(10000).optional(),
  is_published: z.boolean().optional(),
}).strict();
export const settingsSchema = z.object({
  partner_one_name: z.string().trim().min(1).max(100).optional(),
  partner_two_name: z.string().trim().min(1).max(100).optional(),
  wedding_datetime: z.string().datetime({ offset: true }).optional(), timezone: z.string().trim().min(1).max(100).optional(),
  rsvp_deadline: z.string().datetime({ offset: true }).nullable().optional(),
  welcome_message: z.string().trim().min(1).max(5000).optional(), dress_code: optionalText(500),
  color_motif: z.string().trim().min(1).max(250).optional(), guest_instructions: optionalText(2000),
  is_published: z.boolean().optional(),
}).strict();
export const eventSchema = z.object({
  title: z.string().trim().min(1).max(180).optional(), venue_name: z.string().trim().min(1).max(220).optional(),
  venue_address: optionalText(500), event_datetime: z.string().datetime({ offset: true }).optional(),
  description: optionalText(2000), directions_url: z.string().url().max(1000).nullable().optional(),
  maps_url: z.string().url().max(1000).nullable().optional(), qr_target_url: z.string().url().max(1000).nullable().optional(),
  display_order: z.number().int().min(0).max(10000).optional(), is_published: z.boolean().optional(),
}).strict();
export const uuidSchema = z.string().uuid();
