"use client";

import * as React from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { X, ShieldAlert, Trash2, ArrowRight, AlertTriangle } from "lucide-react";

interface TermsModalProps {
  userEmail?: string | null;
}

export default function TermsAndPrivacyModal({ userEmail }: TermsModalProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<"terms" | "email" | "delete">("terms");
  const [emailInput, setEmailInput] = React.useState("");
  const [deleteInput, setDeleteInput] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Check terms status on mount
  React.useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/user/terms-status");
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data.agreedToTerms === false) {
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Failed to check terms compliance:", err);
      }
    }
    checkStatus();
  }, []);

  if (!isOpen) return null;

  async function handleAccept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/accept-terms", {
        method: "POST",
      });
      if (res.ok) {
        const payload = await res.json();
        if (payload.success) {
          setIsOpen(false);
        } else {
          setError(payload.error?.message ?? "An error occurred. Please try again.");
        }
      } else {
        setError("Failed to accept terms. Please check your connection.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleDeclineClick(e: React.MouseEvent) {
    e.preventDefault();
    setStep("email");
    setError(null);
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const enteredEmail = emailInput.trim().toLowerCase();
    const actualEmail = (userEmail ?? "").trim().toLowerCase();

    if (!enteredEmail) {
      setError("Please enter your registered email address.");
      return;
    }

    if (enteredEmail !== actualEmail) {
      setError("The email entered does not match your registered email address.");
      return;
    }

    setStep("delete");
  }

  async function handleDeleteConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (deleteInput !== "DELETE") {
      setError("You must type DELETE in all caps to verify.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          verification: deleteInput,
        }),
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success) {
          // Sign out immediately and redirect home
          await signOut({ callbackUrl: "/" });
        } else {
          setError(payload.error?.message ?? "Failed to delete account.");
          setLoading(false);
        }
      } else {
        setError("Server error. Failed to delete account.");
        setLoading(false);
      }
    } catch (err) {
      setError("Network error. Unable to complete deletion.");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono">
      <div className="w-full max-w-xl rounded-[var(--radius-lg)] border border-border bg-panel p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6 max-h-[90vh]">
        {/* Glow accent */}
        <div className={`absolute top-0 left-0 w-full h-[4px] ${step === "terms" ? "bg-accent" : "bg-red-500"}`} />

        {step === "terms" && (
          <div className="flex flex-col gap-5 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 text-accent border-b border-border pb-3">
              <ShieldAlert className="h-7 w-7 text-accent animate-pulse" />
              <div>
                <span className="text-[0.65rem] font-bold tracking-widest text-accent/60 block uppercase">SYSTEM REVISION REQ_30MAY2026</span>
                <h2 className="text-xl font-bold tracking-tight">Terms &amp; Privacy Update Required</h2>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-foreground/80">
              R.O.L.L. has revised its database policy, privacy structure, and user agreement terms.
              To continue accessing your dashboard, tracked selections, and legendary mod logs, you are required to acknowledge and agree to the revised terms.
            </p>

            <div className="rounded-[var(--radius)] border border-border bg-panel p-4 space-y-2 text-xs">
              <div className="font-bold text-accent">&gt; CORE DOCUMENTATION REVISIONS:</div>
              <ul className="list-none space-y-2 text-foreground/75 pl-2">
                <li>• <Link href="/terms" target="_blank" className="underline hover:text-accent font-bold">Terms of Service (May 30, 2026)</Link></li>
                <li>• <Link href="/privacy" target="_blank" className="underline hover:text-accent font-bold">Privacy Policy (May 30, 2026)</Link></li>
              </ul>
              <div className="text-[0.7rem] text-foreground/45 mt-2 italic leading-tight">
                * Note: Visitor hit and traffic tracking telemetry has been completely rolled back globally in compliance with user data privacy standards.
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleAccept}
                className="w-full py-3 px-4 rounded-[var(--radius)] bg-accent hover:bg-accent/80 text-background font-bold text-sm tracking-wider flex items-center justify-center gap-2 border border-accent hover:scale-[1.01] transition-all disabled:opacity-50 shadow-lg"
              >
                {loading ? "PROCESSING..." : "I AGREE AND ACCEPT THESE TERMS"}
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center mt-2">
                <span className="text-xs text-foreground/50">Do you decline these conditions? </span>
                <a
                  href="#delete"
                  onClick={handleDeclineClick}
                  className="text-xs text-red-500 hover:text-red-400 font-bold underline transition-colors inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Permanently Delete Account
                </a>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 border border-red-500/20 bg-red-500/10 p-3 rounded-[var(--radius)]">
                {error}
              </p>
            )}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-3 text-red-500 border-b border-border pb-3">
              <AlertTriangle className="h-7 w-7 text-red-500" />
              <div>
                <span className="text-[0.65rem] font-bold tracking-widest text-red-500/60 block uppercase">STAGE 1 // IDENTITY VERIFICATION</span>
                <h2 className="text-xl font-bold tracking-tight">Enter Registered Email</h2>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-foreground/80">
              To proceed with the account erasure process, you must verify your identity.
              Please type the registered email address associated with this R.O.L.L. account:
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-[0.7rem] uppercase text-foreground/50 tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2.5 text-sm font-mono text-foreground focus:border-red-500 outline-none transition-colors"
                placeholder="registered@email.com"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 border border-red-500/20 bg-red-500/10 p-3 rounded-[var(--radius)]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("terms");
                  setError(null);
                }}
                className="py-2.5 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-foreground/5 text-xs font-bold"
                disabled={loading}
              >
                BACK TO TERMS
              </button>
              <button
                type="submit"
                className="py-2.5 px-5 rounded-[var(--radius)] bg-red-500 hover:bg-red-600 text-white text-xs font-bold shadow-md hover:scale-[1.01] transition-all"
                disabled={loading}
              >
                VERIFY &amp; CONTINUE
              </button>
            </div>
          </form>
        )}

        {step === "delete" && (
          <form onSubmit={handleDeleteConfirm} className="flex flex-col gap-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center gap-3 text-red-500 border-b border-border pb-3">
              <AlertTriangle className="h-7 w-7 text-red-500 animate-bounce" />
              <div>
                <span className="text-[0.65rem] font-bold tracking-widest text-red-500/60 block uppercase">STAGE 2 // FINAL DESTRUCTION WARNING</span>
                <h2 className="text-xl font-bold tracking-tight">Confirm Deletion</h2>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-red-500/90 font-bold border border-red-500/20 bg-red-500/5 p-4 rounded-[var(--radius)]">
              WARNING: This can not be undone and if you wish to return you will be required to register another account. Previously used emails will work..
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-[0.7rem] uppercase text-foreground/50 tracking-wider">
                Type <span className="font-bold text-red-500">DELETE</span> in caps below to verify:
              </label>
              <input
                type="text"
                required
                value={deleteInput}
                onChange={(e) => setDeleteInput(e.target.value)}
                className="w-full rounded-[var(--radius)] border border-border bg-panel px-3 py-2.5 text-sm font-mono text-foreground focus:border-red-500 outline-none transition-colors uppercase"
                placeholder="Type DELETE here"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 border border-red-500/20 bg-red-500/10 p-3 rounded-[var(--radius)]">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setError(null);
                }}
                className="py-2.5 px-4 rounded-[var(--radius)] border border-border text-foreground hover:bg-foreground/5 text-xs font-bold"
                disabled={loading}
              >
                BACK
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 rounded-[var(--radius)] bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {loading ? "DESTROYING DATA..." : "CONFIRM PERMANENT ERASURE"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
