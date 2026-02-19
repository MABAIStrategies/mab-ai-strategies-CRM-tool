import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TodayPage from "../../app/(app)/today/page";

const dashboardResponse = {
  stats: {
    companies: 12,
    contacts: 48,
    deals: 6,
    openDeals: 4,
    wonDeals: 1,
    lostDeals: 1,
    tasksOpen: 3,
    tasksDone: 20,
    activitiesThisWeek: 9,
    outreachSent: 18,
    pipelineValue: 125000
  },
  topDeals: [],
  upcomingTasks: [],
  recentActivities: []
};

describe("TodayPage", () => {
  it("loads dashboard stats and allows AI daily brief generation", async () => {
    const user = userEvent.setup();

    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => dashboardResponse })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ response: "Focus on top 2 deals and complete open tasks." }) });
    vi.stubGlobal("fetch", fetchMock);

    render(<TodayPage />);

    expect(await screen.findByText("Momentum Command Center")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View Pipeline" })).toHaveAttribute("href", "/pipeline");

    await user.click(screen.getByRole("button", { name: "AI Daily Brief" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/ai/chat",
        expect.objectContaining({ method: "POST" })
      );
    });

    expect(await screen.findByText("Focus on top 2 deals and complete open tasks.")).toBeInTheDocument();
  });
});
