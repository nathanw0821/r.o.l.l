function splitEnvList(raw) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function toOrigin(raw) {
  if (!raw) return null;

  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

const allowedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      process.env.NEXTAUTH_URL,
      process.env.APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      ...splitEnvList(process.env.SERVER_ACTION_ALLOWED_ORIGINS)
    ]
      .map(toOrigin)
      .filter(Boolean)
  )
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins
    }
  }
};

export default nextConfig;
