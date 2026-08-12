// Natural Alphanumeric Sorting Utility for R.O.L.L. Catalogs
// Correctly sorts strings with embedded numbers (e.g. "Group 1", "Group 2", "Group 10", "Group 20")

export function alphaNumericCompare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}

export function sortAlphanumerically<T>(items: T[], keyExtractor: (item: T) => string): T[] {
  return [...items].sort((a, b) => alphaNumericCompare(keyExtractor(a), keyExtractor(b)));
}
