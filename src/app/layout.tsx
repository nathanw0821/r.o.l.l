import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/components/providers";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "R.O.L.L. - Registry Of Legendary Luck",
  description: "Fallout 76 legendary crafting tracking tool",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}