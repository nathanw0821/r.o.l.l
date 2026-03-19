import { spawn } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";

type ConversionResult =
  | { ok: true; buffer: Buffer; filename: string }
  | { ok: false; message: string };

function sanitizeBaseName(name: string) {
  const base = name.replace(/[^a-z0-9-_]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return base || "workbook";
}

function runLibreOffice(command: string, args: string[], cwd: string) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd });
    let stderr = "";
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(stderr || `LibreOffice conversion failed (${code})`));
      }
    });
  });
}

async function detectLibreOfficeCommand() {
  const candidates = [
    process.env.LIBREOFFICE_PATH,
    process.platform === "win32" ? "soffice.exe" : "soffice",
    "libreoffice"
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      await runLibreOffice(candidate, ["--version"], process.cwd());
      return candidate;
    } catch (error) {
      const errno = (error as NodeJS.ErrnoException)?.code;
      if (errno === "ENOENT") continue;
    }
  }
  return null;
}

export async function detectLibreOffice() {
  const command = await detectLibreOfficeCommand();
  return { available: Boolean(command), command };
}

async function convertWithLibreOffice(inputPath: string, outputDir: string) {
  const command = await detectLibreOfficeCommand();
  if (!command) {
    throw new Error("LibreOffice not found");
  }

  await runLibreOffice(command, ["--headless", "--convert-to", "xlsx", "--outdir", outputDir, inputPath], outputDir);
}

export async function convertXlsToXlsx(buffer: Buffer, filename: string): Promise<ConversionResult> {
  const base = sanitizeBaseName(path.parse(filename).name);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "roll-xls-"));
  const inputPath = path.join(tempDir, `${base}.xls`);

  try {
    await fs.writeFile(inputPath, buffer);
    try {
      await convertWithLibreOffice(inputPath, tempDir);
    } catch (error) {
      const fallbackUrl = process.env.XLS_CONVERTER_URL;
      if (!fallbackUrl) {
        throw error;
      }
      const response = await fetch(fallbackUrl, {
        method: "POST",
        headers: {
          "content-type": "application/vnd.ms-excel",
          ...(process.env.XLS_CONVERTER_TOKEN ? { authorization: `Bearer ${process.env.XLS_CONVERTER_TOKEN}` } : {})
        },
        body: buffer
      });
      if (!response.ok) {
        throw new Error(`Remote converter failed (${response.status})`);
      }
      const outputBuffer = Buffer.from(await response.arrayBuffer());
      return { ok: true, buffer: outputBuffer, filename: `${base}.xlsx` };
    }

    const files = await fs.readdir(tempDir);
    const outputName = files.find((file) => file.toLowerCase().endsWith(".xlsx"));
    if (!outputName) {
      return { ok: false, message: "Conversion failed to produce an .xlsx file." };
    }
    const outputPath = path.join(tempDir, outputName);
    const outputBuffer = await fs.readFile(outputPath);
    return { ok: true, buffer: outputBuffer, filename: `${base}.xlsx` };
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("not found")
        ? "LibreOffice is required to convert .xls files. Install LibreOffice, configure XLS_CONVERTER_URL, or upload .xlsx/.xlsm."
        : error instanceof Error
          ? error.message
          : "Failed to convert .xls file.";
    return { ok: false, message };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}
