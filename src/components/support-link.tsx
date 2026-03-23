import Link from "next/link";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SupportLink({
  href,
  label = "Support this App",
  className
}: {
  href?: string | null;
  label?: string;
  className?: string;
}) {
  if (!href) return null;

  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn("support-link", className)}
    >
      <Heart className="h-4 w-4" />
      <span>{label}</span>
    </Link>
  );
}
