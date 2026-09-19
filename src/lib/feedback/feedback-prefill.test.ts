import { describe, expect, it } from "vitest";
import {
  FEEDBACK_MESSAGE_MAX,
  FEEDBACK_SUBJECT_MAX,
  clampFeedbackPrefill,
  outdatedGuideFeedback
} from "@/lib/feedback/feedback-prefill";

describe("feedback prefill", () => {
  it("builds an 'outdated guide' report that names the guide and its link", () => {
    const p = outdatedGuideFeedback({ id: 193, title: "Raider Power Armor", source: "Fallout Wiki" });
    expect(p.subject).toBe("Outdated guide: Raider Power Armor");
    expect(p.message).toContain('"Raider Power Armor" from Fallout Wiki (/wiki?id=193)');
    expect(p.message?.endsWith("What changed:")).toBe(true);
  });

  it("keeps within the /api/feedback limits", () => {
    const long = "x".repeat(900);
    const p = clampFeedbackPrefill({ subject: long, message: long });
    expect(p.subject!.length).toBeLessThanOrEqual(FEEDBACK_SUBJECT_MAX);
    expect(p.message!.length).toBeLessThanOrEqual(FEEDBACK_MESSAGE_MAX);
    expect(outdatedGuideFeedback({ id: 1, title: long }).subject!.length).toBeLessThanOrEqual(FEEDBACK_SUBJECT_MAX);
  });
});
