import { GlowMark } from "./kit";

export function LinkProblem({ reason, support }: { reason: "expired" | "revoked" | "invalid" | "config"; support?: string }) {
  const copy = {
    expired: ["This onboarding link has expired.", "For your security, onboarding links expire. Ask your Madvert account manager for a fresh link; everything you saved is kept."],
    revoked: ["This link is no longer active.", "It was replaced or switched off by Madvert Labs. Please use the latest link we sent you."],
    invalid: ["We couldn’t find this onboarding.", "Check that you opened the full link from your email or WhatsApp message."],
    config: ["Onboarding is being configured.", "Madvert Labs is finishing setup for this portal. Please try again shortly."],
  }[reason];
  return (
    <div className="ob grid min-h-[100dvh] place-items-center px-4">
      <div className="ob-card ob-card-pad max-w-lg text-center">
        <div className="flex justify-center">
          <GlowMark size={72} />
        </div>
        <h1 className="ob-h2 mt-6">{copy[0]}</h1>
        <p className="ob-lead mt-3">{copy[1]}</p>
        <a className="ob-btn ob-btn-primary mt-7" href={`mailto:${support ?? "hello@madvertlabs.com"}`}>
          Contact Madvert Labs
        </a>
      </div>
    </div>
  );
}
