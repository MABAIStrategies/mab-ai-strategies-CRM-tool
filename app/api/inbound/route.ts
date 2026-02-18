import { NextResponse } from "next/server";
import { ingestInboundEvents } from "../../../src/lib/inbound-ingestion";

export async function POST() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const result = await ingestInboundEvents(appUrl);
  return NextResponse.json({ status: "ok", ...result });
}
