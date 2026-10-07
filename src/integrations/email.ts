/** Transactional email through Resend's HTTP API. Silently skipped when not configured. */
export async function sendEmail({ to, subject, html, replyTo }: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!key || !from) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html, reply_to: replyTo }),
    cache: "no-store",
  });
  if (!res.ok) {
    console.error("[email] failed", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}

export const esc = (s?: string) => (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function emailShell(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#0a0f1c;font-family:Inter,Arial,sans-serif;color:#e8eef6">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#101827;border:1px solid #1f2a3d;border-radius:16px">
<tr><td style="padding:32px 32px 8px;font-size:12px;letter-spacing:.2em;color:#3fd4ff">MADVERT LABS</td></tr>
<tr><td style="padding:8px 32px 0;font-size:22px;font-weight:700;color:#fff">${esc(title)}</td></tr>
<tr><td style="padding:16px 32px 32px;font-size:15px;line-height:1.6;color:#a9b6c9">${body}</td></tr>
</table><p style="font-size:12px;color:#5d6b80;margin-top:16px">Madvert Labs · Digital Marketing and Growth Systems</p></td></tr></table></body></html>`;
}
