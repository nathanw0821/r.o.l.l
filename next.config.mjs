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
  cacheComponents: false,
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "exceljs",
    "pg",
    "@prisma/adapter-pg",
    "@neondatabase/serverless",
    "bcryptjs"
  ],
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/pg-cloudflare/dist/**",
      "./node_modules/pg-cloudflare/esm/**"
    ]
  },
  outputFileTracingExcludes: {
    "*": [
      "**/node_modules/exceljs/**",
      "**/node_modules/unzipper/**",
      "**/node_modules/fstream/**",
      "**/node_modules/bluebird/**",
      "**/node_modules/async/**",
      "**/node_modules/@prisma/client/runtime/query_compiler_*_bg.mysql.*",
      "**/node_modules/@prisma/client/runtime/query_compiler_*_bg.sqlite.*",
      "**/node_modules/@prisma/client/runtime/query_compiler_*_bg.sqlserver.*",
      "**/node_modules/@prisma/client/runtime/query_compiler_*_bg.cockroachdb.*",
      "**/node_modules/**/*.map"
    ]
  },
  experimental: {
    serverActions: {
      allowedOrigins
    }
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload"
          }
        ]
      },
      {
        source: "/l/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=86400, stale-while-revalidate=604800"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
