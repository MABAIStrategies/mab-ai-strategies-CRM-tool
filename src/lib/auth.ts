import crypto from "crypto";

const SESSION_COOKIE = "mab_session";

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-secret";
}

export function hashPasscode(passcode: string) {
  const secret = getSecret();
  return crypto.createHmac("sha256", secret).update(passcode).digest("hex");
}

export function verifyPasscode(passcode: string, storedHash: string) {
  return hashPasscode(passcode) === storedHash;
}

export function createSessionToken(userId: string) {
  const secret = getSecret();
  const payload = `${userId}:${Date.now()}`;
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const secret = getSecret();
  const [payload, signature] = token.split(".");
  if (!payload || !signature) {
    return false;
  }
  const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function getSessionCookie() {
  return SESSION_COOKIE;
}
