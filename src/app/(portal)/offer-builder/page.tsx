import type { Metadata } from "next";
import { OfferBuilder } from "@/onboarding/ui/offer/OfferBuilder";
import { booking } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Offer Builder",
  description: "Build an offer people actually want in two minutes. Answer a few questions and Madvert Labs turns them into a complete, shareable offer.",
  robots: { index: true, follow: true },
};

export default function OfferBuilderPage() {
  return <OfferBuilder bookingUrl={process.env.ONBOARDING_BOOKING_URL ?? booking.url} />;
}
