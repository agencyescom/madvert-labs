import Image from "next/image";
import Link from "next/link";

/**
 * Client master logo. Two renders (light/dark) swap with the theme via CSS so there is no flash.
 * Source files: /public/brand/logo-{dark,light}.png, keyed from the supplied artwork.
 */
export function Logo({
  className = "",
  height = 30,
  descriptor = false,
  href = "/",
  priority = false,
}: {
  className?: string;
  height?: number;
  descriptor?: boolean;
  href?: string | null;
  priority?: boolean;
}) {
  const dims = descriptor ? { w: 640, h: 195, lw: 640, lh: 166 } : { w: 640, h: 143, lw: 640, lh: 132 };
  const suffix = descriptor ? "-descriptor" : "";
  const img = (
    <span className={`relative inline-block ${className}`} style={{ height }}>
      <Image
        src={`/brand/logo-dark${suffix}.webp`}
        alt="Madvert Labs"
        width={dims.w}
        height={dims.h}
        priority={priority}
        className="hidden h-full w-auto dark:block"
        sizes="240px"
      />
      <Image
        src={`/brand/logo-light${suffix}.webp`}
        alt="Madvert Labs"
        width={dims.lw}
        height={dims.lh}
        priority={priority}
        className="block h-full w-auto dark:hidden"
        sizes="240px"
      />
    </span>
  );
  if (!href) return img;
  return (
    <Link href={href} aria-label="Madvert Labs home" className="inline-flex items-center rounded-md">
      {img}
    </Link>
  );
}
