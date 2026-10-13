/**
 * Living background (AmbientGradientField + SoftGlowOrbs + FlowingLightBand + BlueRay + dot texture).
 * Pure CSS, very slow (24–38s), theme aware through CSS variables, static under reduced motion.
 */
export function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <div className="ambient-orb o1" />
      <div className="ambient-orb o2" />
      <div className="ambient-orb o3" />
      <div className="ambient-band" />
      <div className="ambient-ray" />
      <div className="ambient-grid" />
    </div>
  );
}
