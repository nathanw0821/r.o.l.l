"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type UsernameStatus = {
  username: string | null;
  email: string | null;
  needsUsername: boolean;
};

export default function UsernameCompletion() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    fetch("/api/profile/username", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        const data = payload?.data as UsernameStatus | undefined;
        setOpen(Boolean(data?.needsUsername));
      })
      .catch(() => setOpen(false));
  }, [session?.user?.id, status]);

  async function submit(mode: "custom" | "default") {
    setPending(true);
    setError(null);

    const body = mode === "default" ? { mode: "default" } : { username };
    const response = await fetch("/api/profile/username", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      setError(payload?.error?.message ?? "Unable to set username.");
      setPending(false);
      return;
    }

    setOpen(false);
    setPending(false);
    router.refresh();
  }

  if (!open) return null;

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-panel px-4 py-3">
      <div className="text-sm font-medium">Pick your username</div>
      <p className="mt-1 text-xs text-foreground/65">
        We created your account from social sign-in. Choose a username now, or use a default.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="username"
          className="min-w-[180px] rounded-[var(--radius)] border border-border bg-panel px-3 py-2 text-sm"
        />
        <Button type="button" disabled={pending} onClick={() => submit("custom")}>
          Save Username
        </Button>
        <Button type="button" variant="outline" disabled={pending} onClick={() => submit("default")}>
          Use Default
        </Button>
      </div>
      {error ? <p className="mt-2 text-xs text-[color:var(--color-warning)]">{error}</p> : null}
    </section>
  );
}
