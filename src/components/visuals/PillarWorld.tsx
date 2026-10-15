import type { ComponentType } from "react";
import type { IconName } from "@/components/ui/Icon3D";
import { AcquisitionWorld } from "./worlds/AcquisitionWorld";
import { AutomationWorld } from "./worlds/AutomationWorld";
import { BrandWorld } from "./worlds/BrandWorld";
import { ConversionWorld } from "./worlds/ConversionWorld";
import { StudiosWorld } from "./worlds/StudiosWorld";
import { TechWorld } from "./worlds/TechWorld";
import "@/styles/worlds.css";

export type PillarWorldName = "branding" | "acquisition" | "conversion" | "studios" | "automation" | "development";

const WORLDS: Record<PillarWorldName, ComponentType<{ className?: string }>> = {
  branding: BrandWorld,
  acquisition: AcquisitionWorld,
  conversion: ConversionWorld,
  studios: StudiosWorld,
  automation: AutomationWorld,
  development: TechWorld,
};

/**
 * A distinct illustrated "world" per service pillar: each one tells its own story
 * (brand assets assembling, attention becoming a booked call, a landing page converting,
 * an edit suite, a self-running workflow, a product built from modules).
 *
 * `icon` picks the world (it matches the pillar's icon key). `satellites` and `tint` are kept
 * for backwards compatibility with existing callers; each world carries its own palette.
 */
export function PillarWorld({
  icon,
  world,
  className = "",
}: {
  icon?: IconName;
  world?: PillarWorldName;
  /** @deprecated kept for API compatibility; worlds now compose their own scene. */
  satellites?: IconName[];
  /** @deprecated kept for API compatibility; worlds carry their own tint. */
  tint?: string;
  className?: string;
}) {
  const key = (world ?? icon) as PillarWorldName;
  const World = WORLDS[key] ?? BrandWorld;
  return <World className={className} />;
}
