"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignInForm() {
  const [identifier, setIdentifier] = React.useState("");
  const [pending, setPending] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!identifier.trim()) return;
    setPending(true);
    await signIn("credentials", {
      identifier,
      callbackUrl: "/"
    });
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex flex-col gap-2 text-sm">
        <span>Identifier</span>
        <input
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
          placeholder="VaultRanger or vault@example.com"
          className="rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}
