const MIN_FILL_MS = 2500;

/** Honeypot + timing + optional Cloudflare Turnstile. Returns a reason string when the submission should be rejected. */
export async function spamCheck(input: { website_confirm?: string; startedAt: number; turnstileToken?: string }, ip: string): Promise<string | null> {
  if (input.website_confirm) return "honeypot";
  if (Date.now() - input.startedAt < MIN_FILL_MS) return "too_fast";
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret) {
    if (!input.turnstileToken) return "captcha_missing";
    try {
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        body: new URLSearchParams({ secret, response: input.turnstileToken, remoteip: ip }),
        cache: "no-store",
      });
      const data = (await res.json()) as { success: boolean };
      if (!data.success) return "captcha_failed";
    } catch {
      return "captcha_unavailable";
    }
  }
  return null;
}
