import { exchangeCode } from "@/integrations/google-calendar";

/**
 * OAuth callback. Shows the refresh token once so the owner can store it as GOOGLE_REFRESH_TOKEN
 * in the hosting environment. Protected by the state cookie set in /start.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const cookie = req.headers.get("cookie")?.match(/mv_oauth_state=([a-f0-9]+)/)?.[1];
  const headers = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
  if (!state || !code || !cookie || cookie !== state) return new Response("Invalid or expired authorisation request.", { status: 400, headers });
  try {
    const tokens = await exchangeCode(code, url.origin);
    const body = tokens.refresh_token
      ? `<p>Authorisation complete. Add this value to your hosting environment as <code>GOOGLE_REFRESH_TOKEN</code>, then redeploy. It is shown only once.</p><textarea readonly style="width:100%;height:120px">${tokens.refresh_token}</textarea>`
      : `<p>Google did not return a refresh token. Remove the app's access at myaccount.google.com/permissions and start again.</p>`;
    return new Response(`<!doctype html><meta name="robots" content="noindex"><body style="font-family:system-ui;max-width:640px;margin:60px auto;padding:0 20px"><h1>Madvert calendar connection</h1>${body}</body>`, {
      headers: { ...headers, "Set-Cookie": "mv_oauth_state=; Path=/api/calendar/oauth; Max-Age=0" },
    });
  } catch (err) {
    console.error("[calendar] oauth callback failed", err);
    return new Response("Authorisation failed. Please try again.", { status: 500, headers });
  }
}
