import "./globals.css";
import type { ReactNode } from "react";
import BrandHeader from "./components/BrandHeader";

export const metadata = {
  title: "MAB AI Strategies CRM",
  description: "Hyper-interactive local-first CRM for MAB AI Strategies",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="layout-shell">
          <BrandHeader />
          <main>{children}</main>
          <footer className="footer">
            <div>© 2025 MAB AI Strategies. Local-first CRM experience.</div>
          </footer>
        </div>
      </body>
    </html>
  );
}
