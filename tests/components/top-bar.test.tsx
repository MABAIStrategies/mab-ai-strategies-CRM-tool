import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>{children}</a>
  )
}));
import { TopBar } from "../../src/components/top-bar";
import { CommandPalette } from "../../src/components/command-palette";
import { CommandPaletteProvider } from "../../src/components/use-command-palette";

function renderWithProvider(onOpenMenu = vi.fn()) {
  return {
    onOpenMenu,
    ...render(
      <CommandPaletteProvider>
        <TopBar onOpenMenu={onOpenMenu} />
        <CommandPalette />
      </CommandPaletteProvider>
    )
  };
}

describe("TopBar", () => {
  it("shows MAB branding assets", () => {
    renderWithProvider();

    expect(screen.getByText("MAB Strategist")).toBeInTheDocument();
    const headshot = screen.getByAltText("Professional headshot") as HTMLImageElement;
    expect(headshot.src).toContain("/branding/mab-headshot.svg");
  });

  it("opens mobile nav callback and command palette", async () => {
    const user = userEvent.setup();
    const { onOpenMenu } = renderWithProvider();

    await user.click(screen.getByRole("button", { name: "Open navigation menu" }));
    expect(onOpenMenu).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Open command palette" }));
    expect(screen.getByText("Command Palette")).toBeInTheDocument();
  });
});
