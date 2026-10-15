import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { opsConfigured, opsUser } from "@/onboarding/server/auth";
import { LoginForm } from "@/onboarding/ui/ops/LoginForm";

export const metadata: Metadata = { title: "Madvert Operations" };

export default async function OpsLogin() {
  await connection();
  if (await opsUser()) redirect("/ops/onboarding");
  return <LoginForm configured={await opsConfigured()} />;
}
