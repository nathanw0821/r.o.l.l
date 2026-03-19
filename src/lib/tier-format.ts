export function formatTierStars(label?: string | null) {
  if (!label) return "";
  const match = label.match(/(\d+)/);
  const count = match ? Number.parseInt(match[1], 10) : Number.NaN;
  if (!Number.isNaN(count) && count > 0) {
    return "☆".repeat(Math.min(count, 4));
  }
  return label;
}

export function formatTierStarsWithLabel(label?: string | null) {
  const stars = formatTierStars(label);
  if (!stars) return { stars: "", label: "" };
  return { stars, label: label ?? stars };
}
