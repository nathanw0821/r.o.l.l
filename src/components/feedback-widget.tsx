"use client";

import * as React from "react";
import { MessageSquare, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

type FeedbackResponse =
  | { success: true; data: { submitted: true } }
  | { success: false; error?: { message?: string } };

function getFeedbackErrorMessage(payload: FeedbackResponse | null) {
  if (!payload || payload.success) return "Unable to submit feedback.";
  return payload.error?.message ?? "Unable to submit feedback.";
}

export default function FeedbackWidget() {
  const { data: session } = useSession();
  const [open, setOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [replyEmail, setReplyEmail] = React.useState(session?.user?.email ?? "");
  const [pending, setPending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!replyEmail && session?.user?.email) {
      setReplyEmail(session.user.email);
    }
  }, [replyEmail, session?.user?.email]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setPending(true);
    setError(null);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subject,
        message,
        replyEmail: replyEmail.trim() || undefined
      })
    });
    const payload = (await response.json().catch(() => null)) as FeedbackResponse | null;

    if (!response.ok || !payload?.success) {
      setError(getFeedbackErrorMessage(payload));
      setPending(false);
      return;
    }

    setDone(true);
    setPending(false);
    setSubject("");
    setMessage("");
  }

  return (
    <div className="feedback-widget">
      {open ? (
        <section className="feedback-widget__panel">
          <div className="feedback-widget__header">
            <div>
              <h3 className="text-sm font-semibold">Feedback</h3>
              <p className="text-xs text-foreground/65">Tell us what to improve.</p>
            </div>
            <button
              type="button"
              className="feedback-widget__close"
              onClick={() => {
                setOpen(false);
                setDone(false);
                setError(null);
              }}
              aria-label="Close feedback"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {done ? (
            <div className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-xs text-foreground/70">
              Feedback sent. Thank you.
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              <label className="flex flex-col gap-1 text-xs">
                <span>Subject</span>
                <input
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  maxLength={120}
                  className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                  placeholder="Short summary"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Message (max 500)</span>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={500}
                  rows={5}
                  className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                  placeholder="Share details"
                />
                <span className="text-[11px] text-foreground/50">{message.length}/500</span>
              </label>
              <label className="flex flex-col gap-1 text-xs">
                <span>Reply email (optional)</span>
                <input
                  type="email"
                  value={replyEmail}
                  onChange={(event) => setReplyEmail(event.target.value)}
                  className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </label>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Sending..." : "Send Feedback"}
              </Button>
              {error ? <p className="text-xs text-[color:var(--color-warning)]">{error}</p> : null}
            </form>
          )}
        </section>
      ) : null}
      {!open ? (
        <button type="button" className="feedback-widget__toggle" onClick={() => setOpen(true)}>
          <MessageSquare className="h-4 w-4" />
          <span>Feedback</span>
        </button>
      ) : null}
    </div>
  );
}
