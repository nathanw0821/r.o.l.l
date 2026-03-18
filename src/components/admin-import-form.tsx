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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setPending(true);
    setErrors([]);
    setSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/import", {
      method: "POST",
      body: formData
    });

    const payload = (await response.json()) as { ok: boolean; errors?: ImportError[] };

    if (!response.ok || !payload.ok) {
      setErrors(payload.errors ?? [{ type: "invalid", message: "Import failed" }]);
    } else {
      setSuccess(true);
    }

    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>Workbook (.xlsx)</span>
        <input
          type="file"
          accept=".xlsx"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" disabled={!file || pending}>
        {pending ? "Importing..." : "Import Workbook"}
      </Button>

      {success ? (
        <div className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3 text-sm">
          Import completed. The new dataset version is now active.
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
