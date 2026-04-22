import argon2 from "argon2";
import { getEnv } from "@/config/env";

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 3,
    parallelism: 1
  });
}

export async function verifyPassword(hash: string, password: string) {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

export function validatePasswordPolicy(password: string) {
  const env = getEnv();
  const minLength = env.PASSWORD_MIN_LENGTH;
  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${minLength} caracteres.`);
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Le mot de passe doit contenir une majuscule.");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Le mot de passe doit contenir une minuscule.");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir un chiffre.");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Le mot de passe doit contenir un caractere special.");
  }

  return errors;
}
