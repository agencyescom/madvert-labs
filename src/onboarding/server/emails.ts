import "server-only";
import { emailShell, esc, sendEmail } from "@/integrations/email";

const button = (href: string, label: string) =>
  `<p style="margin:28px 0 8px"><a href="${esc(href)}" style="display:inline-block;background:linear-gradient(92deg,#00b4ff,#00e5ff);color:#03101d;font-weight:700;text-decoration:none;padding:14px 26px;border-radius:999px">${esc(label)}</a></p>`;

export function sendOnboardingLink(to: string, firstName: string, company: string, url: string) {
  return sendEmail({
    to,
    subject: `Welcome to Madvert Labs, ${firstName}: your onboarding is ready`,
    html: emailShell(
      `Welcome to Madvert Labs, ${firstName}.`,
      `<p>We’re officially in. Your personal onboarding portal for <strong style="color:#fff">${esc(company)}</strong> is ready.</p>
       <p>It takes about 20–35 minutes, and you do not need to finish in one sitting: progress is saved automatically.</p>
       ${button(url, "Start onboarding")}
       <p style="font-size:13px;color:#7f8ea5">This link is private to your business. Please do not forward it; you can send individual tasks to your team from inside the portal.</p>`,
    ),
  });
}

export function sendDelegateInvite(p: { to: string; name: string; fromName: string; company: string; task: string; message?: string; url: string }) {
  return sendEmail({
    to: p.to,
    subject: `${p.fromName} at ${p.company} needs your help with one onboarding task`,
    html: emailShell(
      `Hi ${p.name}, one quick task for ${p.company}`,
      `<p>${esc(p.fromName)} is onboarding ${esc(p.company)} with Madvert Labs and asked you to help with:</p>
       <p style="font-size:17px;color:#fff;font-weight:600">${esc(p.task)}</p>
       ${p.message ? `<p style="border-left:3px solid #00b4ff;padding-left:12px">${esc(p.message)}</p>` : ""}
       <p>The link below opens only this task, with step by step instructions. No passwords need to be shared.</p>
       ${button(p.url, "Open the task")}`,
    ),
  });
}

export function sendReminder(p: { to: string; firstName: string; url: string; items: string[]; nth: number }) {
  const lead = ["Your onboarding is saved right where you left it.", "A few items are still open on your onboarding.", "One last nudge from us."][Math.min(p.nth, 2)];
  return sendEmail({
    to: p.to,
    subject: p.nth === 0 ? "Pick up where you left off" : "A few onboarding items are still open",
    html: emailShell(
      `${p.firstName}, ${lead.toLowerCase()}`,
      `<p>So our team can start building, we still need:</p>
       <ul>${p.items.slice(0, 6).map((i) => `<li style="margin:4px 0">${esc(i)}</li>`).join("")}</ul>
       <p>Anything technical can be sent to your team from inside the portal, or completed together during kickoff.</p>
       ${button(p.url, "Continue onboarding")}`,
    ),
  });
}
