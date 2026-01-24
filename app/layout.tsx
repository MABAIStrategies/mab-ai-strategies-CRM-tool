import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { QueryProvider } from "../src/components/query-provider";

export const metadata: Metadata = {
  title: "MAB AI Strategies CRM",
  description: "Local-first AI CRM for MAB AI Strategies."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
