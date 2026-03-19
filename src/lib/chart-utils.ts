export type ChartItem = {
  label: string;
  unlocked: boolean;
};

export type ChartTier = {
  label: string;
  items: ChartItem[];
};

export function buildChartData(rows: { effect: { name: string }; tier?: { label?: string } | null; unlocked: boolean }[]) {
  const tierOrder = ["1 Star", "2 Star", "3 Star", "4 Star"];
  const tiers = tierOrder.map((label) => ({ label, items: [] as ChartItem[] }));
  const tierMap = new Map(tiers.map((tier) => [tier.label, tier]));

  for (const row of rows) {
    const label = row.tier?.label ?? "Other";
    const tier = tierMap.get(label);
    if (!tier) continue;
    tier.items.push({ label: row.effect.name, unlocked: row.unlocked });
  }

  for (const tier of tiers) {
    tier.items.sort((a, b) => a.label.localeCompare(b.label));
  }

  return tiers;
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildChartSvg(
  rows: { effect: { name: string }; tier?: { label?: string } | null; unlocked: boolean }[],
  width: number
) {
  const tiers = buildChartData(rows);
  const padding = 20;
  const cardGap = 16;
  const cardPadding = 14;
  const titleHeight = 18;
  const pillHeight = 20;
  const pillGap = 8;
  const pillHPad = 10;
  const cardWidth = Math.max(280, Math.floor((width - padding * 2 - cardGap) / 2));

  const background = "#121416";
  const cardBg = "#15181b";
  const cardBorder = "#2a2f35";
  const unlockedBg = "rgba(27, 110, 194, 0.2)";
  const unlockedBorder = "rgba(27, 110, 194, 0.7)";
  const unlockedText = "#bfe0ff";
  const lockedBg = "rgba(196, 107, 24, 0.2)";
  const lockedBorder = "rgba(196, 107, 24, 0.7)";
  const lockedText = "#ffd7a6";
  const titleColor = "#e7eaee";

  const estimateWidth = (text: string) => text.length * 6.5;

  function measureCard(items: { label: string; unlocked: boolean }[]) {
    if (items.length === 0) {
      return cardPadding + titleHeight + cardPadding;
    }
    let x = cardPadding;
    let y = cardPadding + titleHeight + 10;
    for (const item of items) {
      const text = `${item.label} | ${item.unlocked ? "UNLOCKED" : "LOCKED"}`;
      const pillWidth = estimateWidth(text) + pillHPad * 2;
      if (x + pillWidth > cardWidth - cardPadding) {
        x = cardPadding;
        y += pillHeight + pillGap;
      }
      x += pillWidth + pillGap;
    }
    return y + pillHeight + cardPadding;
  }

  const cardHeights = tiers.map((tier) => measureCard(tier.items));
  const row1Height = Math.max(cardHeights[0] ?? 0, cardHeights[1] ?? 0);
  const row2Height = Math.max(cardHeights[2] ?? 0, cardHeights[3] ?? 0);
  const height = padding * 2 + row1Height + row2Height + cardGap;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="100%" height="100%" fill="${background}"/>`;

  function drawCard(tierIndex: number, x: number, y: number, cardHeight: number) {
    const tier = tiers[tierIndex];
    if (!tier) return;
    svg += `<rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="12" ry="12" fill="${cardBg}" stroke="${cardBorder}" />`;
    svg += `<text x="${x + cardPadding}" y="${y + cardPadding + 6}" fill="${titleColor}" font-family="Segoe UI, sans-serif" font-size="14" font-weight="600">${escapeXml(
      tier.label
    )}</text>`;

    let px = x + cardPadding;
    let py = y + cardPadding + titleHeight + 10;

    for (const item of tier.items) {
      const text = `${item.label} | ${item.unlocked ? "UNLOCKED" : "LOCKED"}`;
      const pillWidth = estimateWidth(text) + pillHPad * 2;
      if (px + pillWidth > x + cardWidth - cardPadding) {
        px = x + cardPadding;
        py += pillHeight + pillGap;
      }
      const bg = item.unlocked ? unlockedBg : lockedBg;
      const border = item.unlocked ? unlockedBorder : lockedBorder;
      const textColor = item.unlocked ? unlockedText : lockedText;
      svg += `<rect x="${px}" y="${py}" width="${pillWidth}" height="${pillHeight}" rx="999" ry="999" fill="${bg}" stroke="${border}" />`;
      svg += `<text x="${px + pillHPad}" y="${py + 14}" fill="${textColor}" font-family="Segoe UI, sans-serif" font-size="11" font-weight="600">${escapeXml(
        text
      )}</text>`;
      px += pillWidth + pillGap;
    }
  }

  const row1Y = padding;
  const row2Y = padding + row1Height + cardGap;

  drawCard(0, padding, row1Y, row1Height);
  drawCard(1, padding + cardWidth + cardGap, row1Y, row1Height);
  drawCard(2, padding, row2Y, row2Height);
  drawCard(3, padding + cardWidth + cardGap, row2Y, row2Height);

  svg += "</svg>";
  return { svg, height, width };
}
