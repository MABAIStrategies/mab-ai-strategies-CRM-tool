import type { Metadata } from "next";

import Providers from "@/app/providers";
import AppShell from "@/components/layout/app-shell";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "MAB AI Strategies CRM",
  description: "Hyper-interactive CRM command center for MAB AI Strategies."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
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
