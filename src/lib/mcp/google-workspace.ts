import crypto from "crypto";
import { prisma } from "../db";
import { enqueueJob } from "../queue";

const GMAIL_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";
const CALENDAR_BASE = "https://www.googleapis.com/calendar/v3";
const DEFAULT_SYNC_INTERVAL_MINUTES = 15;

export type GoogleWorkspaceConnectionInput = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountEmail?: string;
  scope?: string;
};

type GmailMessage = {
  id: string;
  internalDate?: string;
  snippet?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{ mimeType?: string; body?: { data?: string } }>;
  };
};

type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  attendees?: Array<{ email?: string; displayName?: string }>;
  organizer?: { email?: string; displayName?: string };
  hangoutLink?: string;
};

const decodeBase64Url = (value?: string) => {
  if (!value) return "";
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
};

const extractHeader = (message: GmailMessage, headerName: string) =>
  message.payload?.headers?.find((header) => header.name.toLowerCase() === headerName.toLowerCase())?.value;

const parseEmailAddress = (value?: string) => {
  if (!value) return undefined;
  const match = value.match(/<?([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})>?/i);
  return match?.[1]?.toLowerCase();
};

const parseDisplayName = (value?: string) => {
  if (!value) return undefined;
  const cleaned = value.replace(/<[^>]+>/g, "").replace(/\"/g, "").trim();
  return cleaned || undefined;
};

const ensureCompanyForEmail = async (email?: string) => {
  if (!email) return undefined;
  const domain = email.split("@")[1];
  if (!domain) return undefined;

  const existing = await prisma.company.findFirst({
    where: {
      domain,
      deletedAt: null
    }
  });

  if (existing) return existing;

  return prisma.company.create({
    data: {
      name: domain.replace(/\.[a-z]+$/i, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      domain,
      icpTags: [],
      riskFlags: []
    }
  });
};

const upsertContact = async ({
  companyId,
  name,
  email,
  source
}: {
  companyId: string;
  name?: string;
  email?: string;
  source: string;
}) => {
  if (!email) return undefined;

  const existing = await prisma.contact.findFirst({ where: { companyId, email, deletedAt: null } });
  if (existing) {
    if (name && !existing.name) {
      return prisma.contact.update({ where: { id: existing.id }, data: { name } });
    }
    return existing;
  }

  return prisma.contact.create({
    data: {
      companyId,
      email,
      name: name ?? email,
      source,
      relationshipStrength: 55
    }
  });
};

const upsertExternalEntity = async ({
  connectionId,
  source,
  externalId,
  checksum,
  contactId,
  noteId,
  activityId,
  memoryItemId
}: {
  connectionId: string;
  source: string;
  externalId: string;
  checksum?: string;
  contactId?: string;
  noteId?: string;
  activityId?: string;
  memoryItemId?: string;
}) => {
  return prisma.externalEntity.upsert({
    where: {
      connectionId_source_externalId: {
        connectionId,
        source,
        externalId
      }
    },
    update: {
      checksum,
      contactId,
      noteId,
      activityId,
      memoryItemId
    },
    create: {
      connectionId,
      source,
      externalId,
      checksum,
      contactId,
      noteId,
      activityId,
      memoryItemId
    }
  });
};

export async function saveGoogleConnection(input: GoogleWorkspaceConnectionInput) {
  const tokenExpiresAt = input.expiresIn ? new Date(Date.now() + input.expiresIn * 1000) : null;
  const scopes = input.scope?.split(" ").filter(Boolean) ?? [];

  const existing = input.accountEmail
    ? await prisma.integrationConnection.findFirst({
        where: {
          provider: "GOOGLE_WORKSPACE",
          accountEmail: input.accountEmail,
          deletedAt: null
        }
      })
    : null;

  if (existing) {
    return prisma.integrationConnection.update({
      where: { id: existing.id },
      data: {
        accessToken: input.accessToken,
        refreshToken: input.refreshToken,
        tokenExpiresAt,
        scopes,
        status: "ACTIVE"
      }
    });
  }

  return prisma.integrationConnection.create({
    data: {
      provider: "GOOGLE_WORKSPACE",
      accountEmail: input.accountEmail,
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      tokenExpiresAt,
      scopes,
      syncIntervalMinutes: DEFAULT_SYNC_INTERVAL_MINUTES,
      status: "ACTIVE"
    }
  });
}

async function authenticatedFetch(connectionId: string, url: string) {
  const connection = await prisma.integrationConnection.findUnique({ where: { id: connectionId } });
  if (!connection) {
    throw new Error(`IntegrationConnection ${connectionId} not found`);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${connection.accessToken}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google API request failed (${response.status}): ${text}`);
  }

  return response.json();
}

async function getCursor(connectionId: string, source: string) {
  return prisma.externalSyncCursor.findUnique({
    where: {
      connectionId_source: {
        connectionId,
        source
      }
    }
  });
}

async function updateCursor(connectionId: string, source: string, cursor?: string) {
  return prisma.externalSyncCursor.upsert({
    where: {
      connectionId_source: {
        connectionId,
        source
      }
    },
    update: {
      cursor,
      lastRunAt: new Date()
    },
    create: {
      connectionId,
      source,
      cursor,
      lastRunAt: new Date()
    }
  });
}

function messageToBody(message: GmailMessage) {
  const plainPart = message.payload?.parts?.find((part) => part.mimeType === "text/plain")?.body?.data;
  if (plainPart) {
    return decodeBase64Url(plainPart);
  }
  if (message.payload?.body?.data) {
    return decodeBase64Url(message.payload.body.data);
  }
  return message.snippet ?? "";
}

async function syncGmail(connectionId: string) {
  const cursor = await getCursor(connectionId, "gmail");
  const query = cursor?.cursor ? `?q=after:${cursor.cursor}` : "?maxResults=20";
  const list = await authenticatedFetch(connectionId, `${GMAIL_BASE}/messages${query}`);
  const messages: Array<{ id: string }> = list.messages ?? [];

  let newestTimestamp = Number(cursor?.cursor ?? "0");

  for (const ref of messages) {
    const message = (await authenticatedFetch(
      connectionId,
      `${GMAIL_BASE}/messages/${ref.id}?format=full`
    )) as GmailMessage;

    const fromRaw = extractHeader(message, "From");
    const subject = extractHeader(message, "Subject") ?? "No subject";
    const email = parseEmailAddress(fromRaw);
    const name = parseDisplayName(fromRaw);
    const body = messageToBody(message).slice(0, 2000);
    const timestamp = Number(message.internalDate ?? Date.now());

    if (timestamp > newestTimestamp) {
      newestTimestamp = timestamp;
    }

    const company = await ensureCompanyForEmail(email);
    if (!company) continue;

    const contact = await upsertContact({ companyId: company.id, name, email, source: "gmail-sync" });
    const note = await prisma.note.create({
      data: {
        companyId: company.id,
        contactId: contact?.id,
        rawText: `[Email] ${subject}\n\n${body}`,
        searchText: `${subject} ${body}`,
        tags: ["gmail", "email-sync"]
      }
    });

    const memory = await prisma.memoryItem.create({
      data: {
        sourceType: "EMAIL",
        sourceId: message.id,
        companyId: company.id,
        contactId: contact?.id,
        extractedFacts: {
          subject,
          from: fromRaw,
          snippet: message.snippet,
          receivedAt: new Date(timestamp).toISOString()
        },
        searchText: `${subject} ${message.snippet ?? ""}`
      }
    });

    await upsertExternalEntity({
      connectionId,
      source: "gmail",
      externalId: message.id,
      checksum: crypto.createHash("sha1").update(`${subject}${timestamp}`).digest("hex"),
      contactId: contact?.id,
      noteId: note.id,
      memoryItemId: memory.id
    });

    await enqueueJob({
      type: "NOTE_PROCESS",
      payload: { noteId: note.id },
      idempotencyKey: `note-process-${note.id}`
    });

    await enqueueJob({
      type: "MEMORY_EMBED",
      payload: { memoryItemId: memory.id, text: `${subject}\n${body}` },
      idempotencyKey: `memory-embed-${memory.id}`
    });
  }

  if (newestTimestamp > 0) {
    await updateCursor(connectionId, "gmail", String(Math.floor(newestTimestamp / 1000)));
  }

  return messages.length;
}

async function syncCalendar(connectionId: string) {
  const cursor = await getCursor(connectionId, "calendar");
  const syncTokenParam = cursor?.cursor ? `&syncToken=${encodeURIComponent(cursor.cursor)}` : "";
  const params = `?singleEvents=true&maxResults=20&orderBy=updated${syncTokenParam}`;
  const response = await authenticatedFetch(connectionId, `${CALENDAR_BASE}/calendars/primary/events${params}`);
  const events: CalendarEvent[] = response.items ?? [];

  for (const event of events) {
    const organizerEmail = event.organizer?.email;
    const company = await ensureCompanyForEmail(organizerEmail);
    if (!company) continue;

    const contact = await upsertContact({
      companyId: company.id,
      email: organizerEmail,
      name: event.organizer?.displayName,
      source: "calendar-sync"
    });

    const meetingNotes = event.description?.slice(0, 2000) ?? "Meeting synced from Google Calendar.";
    const note = await prisma.note.create({
      data: {
        companyId: company.id,
        contactId: contact?.id,
        rawText: `[Meeting] ${event.summary ?? "Untitled"}\n\n${meetingNotes}`,
        searchText: `${event.summary ?? ""} ${meetingNotes}`,
        tags: ["calendar", "meeting"]
      }
    });

    const activity = await prisma.activity.create({
      data: {
        companyId: company.id,
        contactId: contact?.id,
        type: "MEETING",
        occurredAt: new Date(event.start?.dateTime ?? event.start?.date ?? Date.now()),
        outcome: event.summary ?? "Calendar meeting sync"
      }
    });

    const memory = await prisma.memoryItem.create({
      data: {
        sourceType: "ACTIVITY",
        sourceId: event.id,
        companyId: company.id,
        contactId: contact?.id,
        extractedFacts: {
          title: event.summary,
          start: event.start,
          end: event.end,
          attendees: event.attendees,
          meetingLink: event.hangoutLink
        },
        searchText: `${event.summary ?? ""} ${meetingNotes}`
      }
    });

    await upsertExternalEntity({
      connectionId,
      source: "calendar",
      externalId: event.id,
      checksum: crypto.createHash("sha1").update(JSON.stringify(event)).digest("hex"),
      contactId: contact?.id,
      noteId: note.id,
      activityId: activity.id,
      memoryItemId: memory.id
    });

    await enqueueJob({
      type: "NOTE_PROCESS",
      payload: { noteId: note.id },
      idempotencyKey: `note-process-${note.id}`
    });

    await enqueueJob({
      type: "MEMORY_EMBED",
      payload: {
        memoryItemId: memory.id,
        text: `${event.summary ?? "Meeting"}\n${meetingNotes}`
      },
      idempotencyKey: `memory-embed-${memory.id}`
    });
  }

  await updateCursor(connectionId, "calendar", response.nextSyncToken ?? cursor?.cursor ?? undefined);
  return events.length;
}

export async function syncGoogleWorkspace(connectionId: string) {
  const [emailsSynced, eventsSynced] = await Promise.all([
    syncGmail(connectionId),
    syncCalendar(connectionId)
  ]);

  await prisma.integrationConnection.update({
    where: { id: connectionId },
    data: {
      lastSyncedAt: new Date(),
      status: "ACTIVE"
    }
  });

  return {
    emailsSynced,
    eventsSynced
  };
}

export async function scheduleDueIntegrationSyncs() {
  const now = new Date();
  const activeConnections = await prisma.integrationConnection.findMany({
    where: {
      provider: "GOOGLE_WORKSPACE",
      status: "ACTIVE",
      deletedAt: null
    }
  });

  let enqueued = 0;

  for (const connection of activeConnections) {
    const nextRun = new Date(
      (connection.lastSyncedAt?.getTime() ?? connection.createdAt.getTime()) +
        connection.syncIntervalMinutes * 60 * 1000
    );

    if (nextRun > now) continue;

    await enqueueJob({
      type: "MCP_SYNC_GOOGLE_WORKSPACE",
      payload: { connectionId: connection.id },
      idempotencyKey: `mcp-sync-${connection.id}-${Math.floor(now.getTime() / (connection.syncIntervalMinutes * 60000))}`
    });

    enqueued += 1;
  }

  return { enqueued };
}

export async function exchangeGoogleAuthCode(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables.");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to exchange Google auth code (${response.status}).`);
  }

  const tokenData = await response.json();

  const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const profile = profileResponse.ok ? await profileResponse.json() : {};

  return saveGoogleConnection({
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresIn: tokenData.expires_in,
    accountEmail: profile.email,
    scope: tokenData.scope
  });
}
