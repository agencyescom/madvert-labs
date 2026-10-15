import type { Metadata } from "next";
import { connection } from "next/server";
import { onboardingByToken } from "@/onboarding/server/auth";
import { ConfigurationError } from "@/onboarding/server/db";
import { audit } from "@/onboarding/server/events";
import { loadContext } from "@/onboarding/server/repo";
import { clientState } from "@/onboarding/server/views";
import { LinkProblem } from "@/onboarding/ui/LinkProblem";
import { PortalApp } from "@/onboarding/ui/PortalApp";

export const metadata: Metadata = { title: "Welcome to Madvert Labs" };

export default async function OnboardingPage({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  const { token } = await params;
  const result = await load(token).catch((e) => {
    if (e instanceof ConfigurationError) return { problem: "config" as const };
    throw e;
  });
  if ("problem" in result && result.problem) return <LinkProblem reason={result.problem} />;
  if (!("state" in result) || !result.state) return <LinkProblem reason="invalid" />;
  return <PortalApp initial={result.state} token={token} />;
}

async function load(token: string) {
  const { onboarding, reason } = await onboardingByToken(token);
  if (!onboarding) return { problem: (reason ?? "invalid") as "expired" | "revoked" | "invalid" };
  const ctx = await loadContext(onboarding.id);
  if (!ctx) return { problem: "invalid" as const };
  if (!onboarding.lastClientActivityAt) await audit({ onboardingId: onboarding.id, actor: "client", action: "link.first_open" });
  return { state: await clientState(ctx) };
}
