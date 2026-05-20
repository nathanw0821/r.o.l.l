"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Archive, CheckCircle, RotateCcw, Save, MessageSquare } from "lucide-react";

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
  const [localNotes, setLocalNotes] = React.useState<Record<string, string>>({});

  async function updateItem(item: FeedbackEntry, nextStatus: "new" | "reviewed" | "resolved" | "archived") {
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

  async function deleteItem(item: FeedbackEntry) {
    if (!confirm("Are you sure you want to delete this feedback? This cannot be undone.")) return;
    setPendingId(item.id);
    const response = await fetch(`/api/admin/feedback?id=${item.id}`, { method: "DELETE" });
    if (response.ok) {
      setFeedback((current) => current.filter((row) => row.id !== item.id));
    }
    setPendingId(null);
  }

  if (feedback.length === 0) {
    return <p className="text-sm text-foreground/70">No feedback submitted yet.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {feedback.map((item) => {
        const notesValue = localNotes[item.id] ?? item.adminNotes ?? "";
        const isModified = notesValue !== (item.adminNotes ?? "");
        
        return (
          <article key={item.id} className="flex flex-col overflow-hidden rounded-[var(--radius)] border border-border bg-panel shadow-sm">
            <div className="flex items-start justify-between gap-2 border-b border-border/50 bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-accent" />
                <h3 className="line-clamp-1 text-sm font-semibold">{item.subject}</h3>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[0.78rem] font-bold uppercase tracking-wide
                ${item.status === 'new' ? 'bg-blue-500/10 text-blue-500' : 
                  item.status === 'resolved' ? 'bg-green-500/10 text-green-500' : 
                  item.status === 'archived' ? 'bg-foreground/10 text-foreground/60' :
                  'bg-amber-500/10 text-amber-500'}
              `}>
                {item.status}
              </span>
            </div>
            
            <div className="flex flex-1 flex-col p-4">
              <p className="flex-1 whitespace-pre-wrap text-sm text-foreground/80">{item.message}</p>
              
              <div className="mt-4 rounded-lg bg-background/50 p-3 text-xs text-foreground/60">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                  <span className="font-medium text-foreground/50">From:</span>
                  <span className="truncate">{item.submittedBy?.username ?? "Guest"}</span>
                  <span className="font-medium text-foreground/50">Reply:</span>
                  <span className="truncate">{item.replyEmail ?? item.submittedBy?.email ?? "Not provided"}</span>
                  <span className="font-medium text-foreground/50">Date:</span>
                  <span className="truncate">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground/70">Admin Notes</label>
                  {isModified && (
                    <span className="text-[0.78rem] text-amber-500">Unsaved changes</span>
                  )}
                </div>
                <textarea
                  value={notesValue}
                  rows={3}
                  placeholder="Private notes..."
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  onChange={(event) => setLocalNotes({ ...localNotes, [item.id]: event.target.value })}
                />
                <Button
                  size="sm"
                  className="mt-1 w-full"
                  variant={isModified ? "default" : "secondary"}
                  disabled={pendingId === item.id || !isModified}
                  onClick={() => saveNotes(item, notesValue)}
                >
                  <Save className="mr-2 h-3.5 w-3.5" />
                  Save Notes
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1 border-t border-border/50 bg-muted/20 p-3">
              {item.status !== "resolved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs"
                  disabled={pendingId === item.id}
                  onClick={() => updateItem(item, "resolved")}
                >
                  <CheckCircle className="mr-1.5 h-3.5 w-3.5 text-green-500" />
                  Resolve
                </Button>
              )}
              {item.status === "resolved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs"
                  disabled={pendingId === item.id}
                  onClick={() => updateItem(item, "new")}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reopen
                </Button>
              )}
              {item.status !== "archived" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 text-xs"
                  disabled={pendingId === item.id}
                  onClick={() => updateItem(item, "archived")}
                >
                  <Archive className="mr-1.5 h-3.5 w-3.5 text-foreground/60" />
                  Archive
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="flex-1 text-xs hover:bg-red-500/10 hover:text-red-500"
                disabled={pendingId === item.id}
                onClick={() => deleteItem(item)}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
