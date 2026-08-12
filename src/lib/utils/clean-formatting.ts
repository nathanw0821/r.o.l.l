// Universal Text Sanitizer & Formatting Cleaner for R.O.L.L.
// Strips raw extensions (.html, .md, .php), converts slugs into human titles, cleans raw HTML tags, and decodes HTML entities.

export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/â€¢/g, "•");
}

export function sanitizeTitle(raw: string): string {
  if (!raw) return "";
  let text = decodeHtmlEntities(raw.trim());

  // Strip file extensions (.html, .htm, .php, .md, .txt, .json)
  text = text.replace(/\.(html?|php|md|txt|json)$/i, "");

  // Strip URL query parameters
  text = text.replace(/\?.*$/, "");

  // Replace underscores and hyphenated slugs with spaces
  text = text.replace(/[-_]+/g, " ");

  // Strip raw HTML tags (e.g. <b>, <div>, <p>, </span>)
  text = text.replace(/<[^>]*>/g, "");

  // Strip redundant double spaces
  text = text.replace(/\s+/g, " ").trim();

  // Capitalize first letter of words if all lowercase
  if (text === text.toLowerCase()) {
    text = text.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return text;
}

export function toHighResImageUrl(url: string): string {
  if (!url) return "";
  // Strip Wikia/Fandom low-res thumbnail constraints (e.g. /scale-to-width-down/350)
  return url.replace(/\/revision\/latest\/scale-to-width-down\/\d+/i, "/revision/latest");
}

export function stripHtmlAndMarkdown(text: string): string {
  if (!text) return "";
  let clean = decodeHtmlEntities(text);
  clean = clean.replace(/<[^>]*>/g, ""); // Strip HTML tags
  clean = clean.replace(/(\*\*\*|\*\*|\*|___|__|_) /g, " "); // Strip MD markers
  clean = clean.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"); // Strip MD links [label](url) -> label
  return clean.replace(/\s+/g, " ").trim();
}
