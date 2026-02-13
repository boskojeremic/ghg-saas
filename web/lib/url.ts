import { headers } from "next/headers";

export async function getBaseUrl() {
  const h = await headers();

  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (host) return `${proto}://${host}`;

  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3001";
}
