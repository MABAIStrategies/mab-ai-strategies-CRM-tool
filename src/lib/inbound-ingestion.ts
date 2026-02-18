import { ActivityType, TaskStatus } from "@prisma/client";
import { fetchInboundEvents } from "./mcp-client";

type ActivityPayload = {
  companyId?: string;
  dealId?: string;
  contactId?: string;
  type: ActivityType;
  occurredAt: string;
  durationMinutes?: number;
  outcome?: string;
};

type TaskPayload = {
  companyId?: string;
  dealId?: string;
  contactId?: string;
  title: string;
  description?: string;
  dueAt?: string;
  status?: TaskStatus;
};

const defaultCompanyId = "demo-company";

function normalizeActivityPayloads(events: Awaited<ReturnType<typeof fetchInboundEvents>>) {
  const activities: ActivityPayload[] = [];
  const tasks: TaskPayload[] = [];

  events.forEach((event) => {
    const occurredAt = event.occurredAt ?? event.startTime ?? new Date().toISOString();
    const type = event.source === "calendar" ? ActivityType.MEETING : ActivityType.EMAIL;
    activities.push({
      companyId: event.companyId ?? defaultCompanyId,
      dealId: event.dealId,
      contactId: event.contactId,
      type,
      occurredAt,
      durationMinutes:
        event.startTime && event.endTime
          ? Math.round(
              (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) /
                60000
            )
          : undefined,
      outcome: event.summary ?? event.subject ?? "Inbound signal captured."
    });

    (event.actionItems ?? []).forEach((item) => {
      tasks.push({
        companyId: event.companyId ?? defaultCompanyId,
        dealId: event.dealId,
        contactId: event.contactId,
        title: item,
        description: `Generated from ${event.source} event ${event.id}.`,
        status: TaskStatus.TODO
      });
    });
  });

  return { activities, tasks };
}

export async function ingestInboundEvents(appUrl: string) {
  const events = await fetchInboundEvents();
  if (!events.length) {
    return { activities: [], tasks: [], events: 0 };
  }

  const { activities, tasks } = normalizeActivityPayloads(events);
  const headers = { "Content-Type": "application/json" };

  const [activityResponse, taskResponse] = await Promise.all([
    activities.length
      ? fetch(`${appUrl}/api/activities`, {
          method: "POST",
          headers,
          body: JSON.stringify({ activities })
        })
      : Promise.resolve(new Response(null, { status: 204 })),
    tasks.length
      ? fetch(`${appUrl}/api/tasks`, {
          method: "POST",
          headers,
          body: JSON.stringify({ tasks })
        })
      : Promise.resolve(new Response(null, { status: 204 }))
  ]);

  return {
    activities: activityResponse.ok ? activities.length : 0,
    tasks: taskResponse.ok ? tasks.length : 0,
    events: events.length
  };
}
