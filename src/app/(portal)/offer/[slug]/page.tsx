import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { OfferShare } from "@/onboarding/types";
import { generateOffer, type OfferInput } from "@/onboarding/offer/generate";
import { db } from "@/onboarding/server/db";
import { getSettings } from "@/onboarding/server/settings";
import { SharedOffer } from "@/onboarding/ui/offer/OfferBuilder";

export const metadata: Metadata = { title: "Offer", robots: { index: false } };

export default async function SharedOfferPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  if (!/^[A-Za-z0-9]{6,32}$/.test(slug)) notFound();
  const rec = await db().get<OfferShare>("offer_shares", slug);
  if (!rec) notFound();
  await db().put<OfferShare>("offer_shares", { ...rec, views: rec.views + 1 });
  const s = await getSettings();
  return <SharedOffer offer={generateOffer(rec.input as unknown as OfferInput)} bookingUrl={s.integrations.bookingUrl} />;
}
