import { NextResponse } from "next/server";
import { exchangeGoogleAuthCode } from "../../../../../src/lib/mcp/google-workspace";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.code || typeof body.code !== "string") {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const redirectUri =
      body.redirectUri || process.env.GOOGLE_REDIRECT_URI || `${process.env.APP_URL ?? "http://localhost:3000"}/integrations/google/callback`;

    const connection = await exchangeGoogleAuthCode(body.code, redirectUri);
    return NextResponse.json({ connection });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected auth error" },
      { status: 500 }
    );
  }
}
