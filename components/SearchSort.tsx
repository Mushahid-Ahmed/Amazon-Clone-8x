"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SearchSort } from "../lib/search";

export default function SearchSort() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  function change(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    router.push(`${pathname}?${next.toString()}`);
  }
  return <label className="flex items-center gap-2 text-sm">Sort by:<select value={(params.get("sort") as SearchSort) || "relevance"} onChange={(event) => change(event.target.value)} className="rounded border border-slate-300 bg-white px-2 py-1.5"><option value="relevance">Featured</option><option value="price-low">Price: Low to high</option><option value="price-high">Price: High to low</option><option value="rating">Avg. customer review</option><option value="newest">Newest arrivals</option></select></label>;
}
