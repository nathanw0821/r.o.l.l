import { z } from "zod";

/**
 * One password rule for sign-up, reset and change. Passwords are never trimmed: what the user
 * typed is what gets hashed and compared.
 */
export const newPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");
