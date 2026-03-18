import fs from "fs";

export interface ParsedTsv {
  header: string[];
  rows: string[][];
}

export function readTsvFile(filePath: string): ParsedTsv {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  if (lines.length === 0) {
    return { header: [], rows: [] };
  }

  // Remove trailing empty line created by a final newline.
  if (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }

  const headerLine = lines[0] ?? "";
  const header = headerLine.split("\t");
  const rows = lines.slice(1).map((line) => line.split("\t"));

  return { header, rows };
}

export function isTsvLike(headerLine: string): boolean {
  return headerLine.includes("\t");
}
