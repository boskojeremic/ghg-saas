import { Resend } from "resend";

type InviteEmailArgs = {
  to: string;
  inviteUrl: string;
  tenantName: string;
  role: string;
};

// Instantiate once (no null logic)
const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendInviteEmail(args: InviteEmailArgs) {
  const { to, inviteUrl, tenantName, role } = args;

  console.log("[EMAIL] Sending invite to:", to);
  console.log("[EMAIL] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);

  const result = await resend.emails.send({
    from: "GHG App <no-reply@dig-ops.com>",
    to,
    subject: `Invitation to ${tenantName}`,
    html: `
      <p>You have been invited to <b>${tenantName}</b> as <b>${role}</b>.</p>
      <p style="margin:16px 0">
        <a href="${inviteUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;background:#0f766e;color:#fff;text-decoration:none;">
          Accept invitation
        </a>
      </p>
      <p>If the button does not work, open this link:</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
    `,
  });

  console.log("[EMAIL] Resend result:", result);

  if ((result as any)?.error) {
    console.error("[EMAIL] Resend error:", (result as any).error);
    throw new Error((result as any).error?.message || "RESEND_ERROR");
  }

  return { ok: true };
}
