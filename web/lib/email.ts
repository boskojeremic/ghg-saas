import { Resend } from "resend";

type InviteEmailArgs = {
  to: string;
  inviteUrl: string;
  tenantName: string;
  role: string;
};

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendInviteEmail(args: InviteEmailArgs) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY missing - skipping email send");
    return { ok: false, skipped: true };
  }

  const { to, inviteUrl, tenantName, role } = args;

  await resend.emails.send({
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

  return { ok: true };
}
