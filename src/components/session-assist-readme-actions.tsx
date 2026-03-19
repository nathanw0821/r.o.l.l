"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSessionAssist } from "@/components/session-assist-provider";

export default function SessionAssistReadmeActions() {
  const { open, pinned, setOpen, togglePinned } = useSessionAssist();

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(!open)}>
        {open ? "Hide Floating Assist" : "Open Floating Assist"}
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={togglePinned}>
        {pinned ? "Remove from Tabs" : "Pin to Tabs"}
      </Button>
      <Button type="button" variant="outline" size="sm" asChild>
        <Link href="/screenshot-assist">Open Full Page</Link>
      </Button>
    </div>
  );
}
