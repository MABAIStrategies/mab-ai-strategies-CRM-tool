import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}));

const usePathname = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathname()
}));

import { Sidebar } from "../../src/components/sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    usePathname.mockReturnValue("/today");
  });

  it("renders official logo and primary navigation", () => {
    render(<Sidebar />);

    expect(screen.getByAltText("MAB AI Strategies official logo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Today" })).toHaveAttribute("href", "/today");
    expect(screen.getByRole("link", { name: "Pipeline" })).toHaveAttribute("href", "/pipeline");
    expect(screen.getByRole("link", { name: "Finish Line" })).toHaveAttribute("href", "/finish-line");
  });

  it("executes sign out flow", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    Object.defineProperty(window, "location", {
      configurable: true,
      value: { href: "http://localhost/today" }
    });

    render(<Sidebar />);

    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" });
    expect(window.location.href).toBe("/login");
  });
});
