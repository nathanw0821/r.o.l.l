"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";

type FeedbackEntry = {
  id: string;
  subject: string;
  message: string;
  replyEmail: string | null;
  status: string;
  adminNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  submittedBy: { username: string | null; email: string | null } | null;
  reviewedBy: { username: string | null; email: string | null } | null;
};

export default function AdminFeedbackList({
  initialFeedback
}: {
  initialFeedback: FeedbackEntry[];
}) {
  const [feedback, setFeedback] = React.useState(initialFeedback);
  const [pendingId, setPendingId] = React.useState<string | null>(null);

  async function updateItem(item: FeedbackEntry, nextStatus: "new" | "reviewed" | "resolved") {
    setPendingId(item.id);
    const response = await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        status: nextStatus,
        adminNotes: item.adminNotes ?? ""
      })
    });
    const payload = await response.json().catch(() => null);

    if (response.ok && payload?.data?.feedback) {
      const updated = payload.data.feedback as FeedbackEntry;
      setFeedback((current) => current.map((row) => (row.id === item.id ? { ...item, ...updated } : row)));
    }
    setPendingId(null);
  }

  async function saveNotes(item: FeedbackEntry, notes: string) {
    setPendingId(item.id);
    const response = await fetch("/api/admin/feedback", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        adminNotes: notes
      })
    });
    const payload = await response.json().catch(() => null);

    if (response.ok && payload?.data?.feedback) {
      const updated = payload.data.feedback as FeedbackEntry;
      setFeedback((current) => current.map((row) => (row.id === item.id ? { ...row, ...updated } : row)));
    }
    setPendingId(null);
  }

  if (feedback.length === 0) {
    return <p className="text-sm text-foreground/70">No feedback submitted yet.</p>;
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <article key={item.id} className="rounded-[var(--radius)] border border-border bg-panel px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{item.subject}</h3>
            <span className="text-xs uppercase tracking-wide text-foreground/60">{item.status}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{item.message}</p>
          <div className="mt-2 text-xs text-foreground/60">
            <div>Reply: {item.replyEmail ?? item.submittedBy?.email ?? "Not provided"}</div>
            <div>From: {item.submittedBy?.username ?? "Guest"}</div>
            <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
          </div>
          <label className="mt-3 flex flex-col gap-1 text-xs">
            <span>Admin notes</span>
            <textarea
              defaultValue={item.adminNotes ?? ""}
              rows={3}
              className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
              onBlur={(event) => {
                if ((item.adminNotes ?? "") === event.target.value) return;
                void saveNotes(item, event.target.value);
              }}
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={pendingId === item.id}
              onClick={() => updateItem(item, "reviewed")}
            >
              Mark Reviewed
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pendingId === item.id}
              onClick={() => updateItem(item, "resolved")}
            >
              Resolve
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pendingId === item.id}
              onClick={() => updateItem(item, "new")}
            >
              Reopen
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
