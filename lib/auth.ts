import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "jtech_admin_session";
function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters.");
  return new TextEncoder().encode(value);
}
export async function createSession(user: { id: string; email: string; role: string }) {
  const token = await new SignJWT({ email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id)
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "strict", path: "/", maxAge: 8 * 60 * 60
  });
}
export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
}
export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") return null;
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch { return null; }
}
export async function requireAdmin() {
  const session = await getSession();
  if (!session || !["SUPER_ADMIN", "ADMIN", "EDITOR", "ENQUIRY_MANAGER"].includes(session.role)) return null;
  return session;
}
export async function requireAdminRequest(_req: NextRequest) {
  return requireAdmin();
}
export function jsonUnauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
export function verifySameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return false;
  try { return new URL(origin).host === host; } catch { return false; }
}
