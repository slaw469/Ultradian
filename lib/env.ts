import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url("Invalid DATABASE_URL"),
  
  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("Invalid NEXTAUTH_URL").optional(),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_ID: z.string().optional(),
  GITHUB_SECRET: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const env = envSchema.parse(process.env);

// Validate OAuth provider pairs
if (env.GOOGLE_CLIENT_ID && !env.GOOGLE_CLIENT_SECRET) {
  throw new Error("GOOGLE_CLIENT_SECRET is required when GOOGLE_CLIENT_ID is provided");
}

if (env.GOOGLE_CLIENT_SECRET && !env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is required when GOOGLE_CLIENT_SECRET is provided");
}

if (env.GITHUB_ID && !env.GITHUB_SECRET) {
  throw new Error("GITHUB_SECRET is required when GITHUB_ID is provided");
}

if (env.GITHUB_SECRET && !env.GITHUB_ID) {
  throw new Error("GITHUB_ID is required when GITHUB_SECRET is provided");
} 