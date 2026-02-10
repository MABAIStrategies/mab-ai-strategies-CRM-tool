import Link from "next/link";
import { CheckCircle2, CalendarCheck, LineChart } from "lucide-react";

import PageHero from "@/components/layout/page-hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TodayPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHero
        title="Today Focus"
        description="Stay locked on the highest-leverage moves. Review daily priorities, accelerate follow-ups, and keep the client momentum glimmering."
        badge="Today"
        ctaLabel="Sync Workspace"
        ctaHref="/workspace"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="transition hover:-translate-y-1 hover:border-mab-gold/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <CalendarCheck className="h-5 w-5 text-mab-gold" />
              Priority Sequence
            </CardTitle>
            <CardDescription>
              Three high-impact actions are queued for the day.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {["Confirm Q2 partnership brief", "Review AI strategy deck", "Send executive recap"].map(
              (task) => (
                <div
                  key={task}
                  className="flex items-center justify-between rounded-lg border border-mab-navy-700/70 bg-mab-navy-700/40 px-4 py-3"
                >
                  <span className="text-sm">{task}</span>
                  <CheckCircle2 className="h-4 w-4 text-mab-gold" />
                </div>
              )
            )}
            <Button variant="outline" className="w-full" asChild>
              <Link href="/assets">Open Priority Assets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="transition hover:-translate-y-1 hover:border-mab-gold/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <LineChart className="h-5 w-5 text-mab-gold" />
              Momentum Snapshot
            </CardTitle>
            <CardDescription>
              Intelligent signals show a 12% lift in engagement this week.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="rounded-lg border border-mab-navy-700/70 bg-mab-navy-700/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-mab-gold/70">
                  Confidence Score
                </p>
                <p className="text-3xl font-semibold">92%</p>
                <p className="text-sm text-mab-ivory/60">
                  AI alignment across key accounts.
                </p>
              </div>
              <Button className="w-full" asChild>
                <Link href="/search">Launch Deep Search</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
