import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { hashToken } from "@/lib/inviteToken";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const token = String(body?.token || "").trim(); // ✅ trim
    const name = String(body?.name || "").trim();
    const password = String(body?.password || "");

    if (!token || !password) {
      return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "PASSWORD_MIN_8_CHARS" }, { status: 400 });
    }

    const tokenHash = hashToken(token);

    // ✅ fetch invite WITHOUT filters first, so we can tell WHY it fails
    const inviteAny = await db.invite.findFirst({
      where: { tokenHash },
      select: { id: true, tenantId: true, email: true, role: true, acceptedAt: true, expiresAt: true },
    });

    if (!inviteAny) {
      return NextResponse.json({ ok: false, error: "INVALID_TOKEN" }, { status: 404 });
    }

    if (inviteAny.acceptedAt) {
      return NextResponse.json({ ok: false, error: "INVITE_ALREADY_USED" }, { status: 400 });
    }

    if (inviteAny.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ ok: false, error: "INVITE_EXPIRED" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await db.user.upsert({
      where: { email: inviteAny.email },
      update: { name: name || undefined, passwordHash },
      create: { email: inviteAny.email, name: name || undefined, passwordHash },
      select: { id: true },
    });

    await db.membership.upsert({
      where: { tenantId_userId: { tenantId: inviteAny.tenantId, userId: user.id } },
      update: { role: inviteAny.role as any, status: "ACTIVE" as any },
      create: {
        tenantId: inviteAny.tenantId,
        userId: user.id,
        role: inviteAny.role as any,
        status: "ACTIVE" as any,
      },
    });

    await db.invite.update({
      where: { id: inviteAny.id },
      data: { acceptedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("[INVITES_ACCEPT] ERROR:", e);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
