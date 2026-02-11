import { ReactNode } from "react";
import { AppShell } from "../../src/components/app-shell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>{children}</AppShell>
  );
}
