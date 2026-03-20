export function normalizeDatabaseUrl(connectionString?: string) {
  if (!connectionString) return connectionString;

  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");

    if (!sslmode || url.searchParams.has("uselibpqcompat")) {
      return connectionString;
    }

    if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      url.searchParams.set("uselibpqcompat", "true");
      return url.toString();
    }

    return connectionString;
  } catch {
    return connectionString;
  }
}
