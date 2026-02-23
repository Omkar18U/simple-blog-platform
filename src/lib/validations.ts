import { z } from "zod";

// ─── Auth Schemas ───────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// ─── Post Schemas ───────────────────────────────────────

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(300).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).max(5, "Maximum 5 tags").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

// ─── Types ──────────────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PostInput = z.infer<typeof postSchema>;
