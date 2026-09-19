/**
 * Opening the site-wide feedback widget (`src/components/feedback-widget.tsx`) from anywhere, with
 * the subject and message already filled in. The widget listens for FEEDBACK_OPEN_EVENT; a request
 * made before the widget has mounted (it is loaded lazily) is kept and picked up on mount.
 * The limits match `/api/feedback` (subject 120, message 500 characters).
 */

export const FEEDBACK_OPEN_EVENT = "roll:open-feedback";
export const FEEDBACK_SUBJECT_MAX = 120;
export const FEEDBACK_MESSAGE_MAX = 500;

export type FeedbackPrefill = { subject?: string; message?: string };

function clip(text: string, max: number): string {
  const clean = text.replace(/[ \t]+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`;
}

export function clampFeedbackPrefill(prefill: FeedbackPrefill): FeedbackPrefill {
  return {
    subject: prefill.subject ? clip(prefill.subject, FEEDBACK_SUBJECT_MAX) : undefined,
    message: prefill.message ? clip(prefill.message, FEEDBACK_MESSAGE_MAX) : undefined
  };
}

/** Subject and message for "Report outdated" on a guide. */
export function outdatedGuideFeedback(guide: { id: string | number; title: string; source?: string | null }): FeedbackPrefill {
  const title = clip(guide.title, 80);
  const from = guide.source ? ` from ${guide.source}` : "";
  return clampFeedbackPrefill({
    subject: `Outdated guide: ${title}`,
    message: `The guide "${title}"${from} (/wiki?id=${guide.id}) looks out of date.\nWhat changed: `
  });
}

let pending: FeedbackPrefill | null = null;

/** Prefill left by a request made before the widget mounted; returns it once. */
export function takePendingFeedbackPrefill(): FeedbackPrefill | null {
  const value = pending;
  pending = null;
  return value;
}

/** Opens the feedback widget with `prefill`. Safe to call before the widget has loaded. */
export function openFeedback(prefill: FeedbackPrefill = {}): void {
  if (typeof window === "undefined") return;
  const detail = clampFeedbackPrefill(prefill);
  pending = detail;
  window.dispatchEvent(new CustomEvent<FeedbackPrefill>(FEEDBACK_OPEN_EVENT, { detail }));
}
