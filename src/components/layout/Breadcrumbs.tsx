import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { schema } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-[13px] text-ink-3">
        <ol className="flex flex-wrap items-center gap-2">
          {all.map((it, i) => (
            <li key={it.path} className="flex items-center gap-2">
              {i < all.length - 1 ? (
                <>
                  <Link href={it.path} className="transition-colors hover:text-ink">
                    {it.name}
                  </Link>
                  <span aria-hidden="true">/</span>
                </>
              ) : (
                <span aria-current="page" className="text-ink-2">
                  {it.name}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd data={schema.breadcrumbs(all)} />
    </>
  );
}
