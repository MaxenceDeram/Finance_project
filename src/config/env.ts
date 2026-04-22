import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.string().url().default("http://localhost:3000"),
  APP_NAME: z.string().min(1).default("Waren"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SESSION_COOKIE_NAME: z.string().min(1).default("sim_session"),
  SESSION_SECRET: z.string().min(32),
  EMAIL_TOKEN_PEPPER: z.string().min(32),
  CRON_SECRET: z.string().min(32),
  PASSWORD_MIN_LENGTH: z.coerce.number().int().min(10).default(12),
  SIMULATED_FEE_BPS: z.coerce.number().min(0).max(500).default(5),
  MARKET_DATA_PROVIDER: z.enum(["mock"]).default("mock"),
  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .string()
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASSWORD: z.string().optional().default(""),
  SMTP_FROM: z.string().min(1).default("Waren <no-reply@example.com>"),
  DAILY_SUMMARY_DEFAULT_TIMEZONE: z.string().min(1).default("Europe/Paris")
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  cachedEnv = parsed.data;
  return cachedEnv;
}

export function isProduction() {
  return process.env.NODE_ENV === "production";
}
