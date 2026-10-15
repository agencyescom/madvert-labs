import "server-only";
import { NextResponse } from "next/server";
import { AuthError } from "./auth";
import { ConfigurationError } from "./db";

export const json = (data: unknown, status = 200) =>
  NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

export async function handle(fn: () => Promise<Response>) {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof AuthError) return json({ error: e.message }, e.status);
    if (e instanceof ConfigurationError) return json({ error: e.message, configurationRequired: true }, 503);
    const msg = e instanceof Error ? e.message : "Something went wrong";
    // Known validation messages are short and safe; anything else is logged, not echoed.
    if (/^(Unknown|Invalid|Only|Please|This|Credential|File|Upload)/.test(msg)) return json({ error: msg }, 400);
    console.error("[onboarding api]", e);
    return json({ error: "Something went wrong. Your other answers are saved." }, 500);
  }
}

export async function body<T = Record<string, unknown>>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    return {} as T;
  }
}

/** Same-origin check for state-changing requests (defence in depth on top of header tokens / SameSite cookies). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}
