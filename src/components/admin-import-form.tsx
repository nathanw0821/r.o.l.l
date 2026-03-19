"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type ImportError = {
  type: string;
  message: string;
  sheet?: string;
};

export default function AdminImportForm() {
  const [file, setFile] = React.useState<File | null>(null);
  const [pending, setPending] = React.useState(false);
  const [errors, setErrors] = React.useState<ImportError[]>([]);
  const [success, setSuccess] = React.useState(false);
  const [baseline, setBaseline] = React.useState<{
    yes: number;
    no: number;
    unknown: number;
    total: number;
  } | null>(null);
  const [libreOfficeStatus, setLibreOfficeStatus] = React.useState<{
    available: boolean;
  } | null>(null);
  const [fallbackAvailable, setFallbackAvailable] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    fetch("/api/admin/import/status")
      .then((res) => res.json())
      .then((payload) => {
        if (!active || !payload?.success) return;
        setLibreOfficeStatus(payload.data?.libreOffice ?? null);
        setFallbackAvailable(Boolean(payload.data?.fallbackAvailable));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setPending(true);
    setErrors([]);
    setSuccess(false);
    setBaseline(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/import", {
        method: "POST",
        body: formData
      });

      let payload:
        | {
            success: true;
            data: { datasetVersionId: string; baseline?: { yes: number; no: number; unknown: number; total: number } };
          }
        | {
            success: false;
            error: { code: string; message: string; details?: { path?: string; message: string }[] };
          }
        | null = null;
      try {
        payload = (await response.json()) as
          | {
              success: true;
              data: { datasetVersionId: string; baseline?: { yes: number; no: number; unknown: number; total: number } };
            }
          | {
              success: false;
              error: { code: string; message: string; details?: { path?: string; message: string }[] };
            };
      } catch {
        payload = null;
      }

      if (!response.ok || !payload || payload.success === false) {
        const details = payload && "error" in payload ? payload.error.details : null;
        if (details && details.length > 0) {
          setErrors(details.map((detail) => ({ type: "invalid", message: detail.message })));
        } else {
          const message =
            payload && "error" in payload ? payload.error.message : "Import failed. Check the server logs.";
          setErrors([{ type: "invalid", message }]);
        }
      } else {
        setSuccess(true);
        setBaseline(payload.data.baseline ?? null);
      }
    } catch {
      setErrors([{ type: "invalid", message: "Import failed. Check the server logs." }]);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>Workbook (.xlsx, .xlsm, .xls)</span>
        <input
          type="file"
          accept=".xlsx,.xlsm,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" disabled={!file || pending}>
        {pending ? "Importing..." : "Import Workbook"}
      </Button>
      {libreOfficeStatus ? (
        <div className="text-xs text-foreground/60">
          LibreOffice conversion:{" "}
          <span className={libreOfficeStatus.available ? "text-[color:var(--color-success)]" : "text-[color:var(--color-warning)]"}>
            {libreOfficeStatus.available ? "Detected" : "Not detected"}
          </span>
          {!libreOfficeStatus.available ? (
            <span>
              {" "}
              (fallback {fallbackAvailable ? "enabled" : "unavailable"} for .xls)
            </span>
          ) : null}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-sm">
          Import completed. The new dataset version is now active.
          {baseline ? (
            <div className="mt-3 rounded-[var(--radius)] border border-border bg-panel/70 px-3 py-2 text-xs text-foreground/70">
              Detected profile values: {baseline.yes} Yes, {baseline.no} No, {baseline.unknown} Unknown
              {baseline.total === 0 ? " (no matchable rows found)" : ""}.
            </div>
          ) : null}
        </div>
      ) : null}

      {errors.length > 0 ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-sm">
          <div className="font-semibold">Import Errors</div>
          <ul className="mt-2 list-disc pl-5 text-foreground/70">
            {errors.map((error, index) => (
              <li key={`${error.type}-${index}`}>
                {error.sheet ? `[${error.sheet}] ` : ""}
                {error.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </form>
  );
}
