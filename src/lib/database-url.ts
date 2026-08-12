export function normalizeDatabaseUrl(connectionString?: string) {
  if (!connectionString) return connectionString;

  try {
    const url = new URL(connectionString);
    url.searchParams.delete("channel_binding");

    const sslmode = url.searchParams.get("sslmode");
    if (!sslmode || url.searchParams.has("uselibpqcompat")) {
      return url.toString();
    }

    if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      url.searchParams.set("uselibpqcompat", "true");
    }

    return url.toString();
  } catch {
    return connectionString;
  }
}
