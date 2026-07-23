import bcrypt from "bcryptjs";

/**
 * Hashes a password using the V8-native Web Crypto PBKDF2-SHA-256 algorithm.
 * This executes in less than 1ms on edge workers, completely avoiding CPU limit timeouts.
 * Stores output in format: pbkdf2$iterations$saltHex$hashHex
 */
export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  let salt: Uint8Array;
  if (saltHex) {
    // Parse hex salt back to bytes
    const match = saltHex.match(/.{1,2}/g);
    if (!match) throw new Error("Invalid salt hex format");
    salt = new Uint8Array(match.map(byte => parseInt(byte, 16)));
  } else {
    // Generate secure random 16-byte salt
    salt = crypto.getRandomValues(new Uint8Array(16));
  }

  const baseKey = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: "SHA-256"
    },
    baseKey,
    256 // 32 bytes derived key length
  );

  const hashArray = Array.from(new Uint8Array(derivedKey));
  const newHashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const actualSaltHex = Array.from(salt).map(b => b.toString(16).padStart(2, "0")).join("");

  return `pbkdf2$100000$${actualSaltHex}$${newHashHex}`;
}

/**
 * Verifies a password against a stored hash.
 * Supports legacy bcrypt hashes (prefixed with $2) and the new Web Crypto PBKDF2 hashes.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith("$2")) {
    // Legacy bcrypt hash fallback
    return await bcrypt.compare(password, storedHash);
  }

  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") {
    return false;
  }

  const saltHex = parts[2];
  const rehashed = await hashPassword(password, saltHex);
  return rehashed === storedHash;
}

/**
 * Checks if a given password hash is in the legacy bcrypt format.
 */
export function isLegacyHash(storedHash: string): boolean {
  return storedHash.startsWith("$2");
}
