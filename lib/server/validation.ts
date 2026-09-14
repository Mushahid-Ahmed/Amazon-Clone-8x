import { z } from "zod";

export const addressSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().trim().min(2).max(60).default("United States"),
  isDefault: z.boolean().optional(),
});
