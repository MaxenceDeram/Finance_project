import crypto from "node:crypto";
import { getEnv } from "@/config/env";

export function createRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function hashToken(token: string) {
  const env = getEnv();
  return crypto
    .createHmac("sha256", env.EMAIL_TOKEN_PEPPER)
    .update(token)
    .digest("hex");
}

export function hashSessionToken(token: string) {
  const env = getEnv();
  return crypto
    .createHmac("sha256", env.SESSION_SECRET)
    .update(token)
    .digest("hex");
}

export function hashIp(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const env = getEnv();
  return crypto.createHmac("sha256", env.SESSION_SECRET).update(value).digest("hex");
}
