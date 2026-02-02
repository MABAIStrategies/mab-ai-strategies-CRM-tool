import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookie, hashPasscode, verifyPasscode } from "../../../../src/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const passcode = body.passcode as string;
  if (!passcode) {
    return NextResponse.json({ error: "Passcode required." }, { status: 400 });
  }

  const storedHash = process.env.PASSCODE_HASH ?? hashPasscode(process.env.PASSCODE ?? "mab");
  if (!verifyPasscode(passcode, storedHash)) {
    return NextResponse.json({ error: "Invalid passcode." }, { status: 401 });
  }

  const token = createSessionToken("local-user");
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: getSessionCookie(),
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return response;
}
