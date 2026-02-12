import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/db";
import { enqueueJob } from "../../../../../src/lib/queue";
import { scheduleDueIntegrationSyncs } from "../../../../../src/lib/mcp/google-workspace";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.connectionId) {
      const connection = await prisma.integrationConnection.findUnique({
        where: { id: body.connectionId }
      });

      if (!connection) {
        return NextResponse.json({ error: "connectionId not found" }, { status: 404 });
      }

      await enqueueJob({
        type: "MCP_SYNC_GOOGLE_WORKSPACE",
        payload: { connectionId: connection.id },
        idempotencyKey: `mcp-sync-manual-${connection.id}-${Date.now()}`
      });

      return NextResponse.json({ queued: true, connectionId: connection.id });
    }

    const result = await scheduleDueIntegrationSyncs();
    return NextResponse.json({ queued: result.enqueued });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected sync error" },
      { status: 500 }
    );
  }
}
