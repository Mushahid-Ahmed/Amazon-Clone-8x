"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Product } from "../types";

const departments = ["Electronics", "Computers & Accessories", "Home & Kitchen", "Fashion", "Beauty & Personal Care"];
const pricePresets = [{ label: "Under $25", max: 25 }, { label: "$25 to $50", min: 25, max: 50 }, { label: "$50 to $100", min: 50, max: 100 }, { label: "$100 & above", min: 100 }];

export default function SearchFilters({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(params.get("minPrice") ?? "");
  const [max, setMax] = useState(params.get("maxPrice") ?? "");
  const brands = [...new Set(products.map((product) => product.brand).filter(Boolean))] as string[];
  const selectedBrands = (params.get("brand") ?? "").split(",").filter(Boolean);
  const currentCategory = params.get("category") ?? "";

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([key, value]) => value ? next.set(key, value) : next.delete(key));
    router.push(`${pathname}?${next.toString()}`);
  }
  function toggleBrand(brand: string) {
    const next = selectedBrands.includes(brand) ? selectedBrands.filter((item) => item !== brand) : [...selectedBrands, brand];
    update({ brand: next.length ? next.join(",") : null });
  }
  function applyPrice() { update({ minPrice: min || null, maxPrice: max || null }); }
  function clearAll() { router.push(pathname); setMin(""); setMax(""); setOpen(false); }

  const chips = [
    currentCategory && { label: currentCategory, key: "category" },
    ...selectedBrands.map((brand) => ({ label: brand, key: "brand", value: brand })),
    params.get("minPrice") && { label: `From $${params.get("minPrice")}`, key: "minPrice" },
    params.get("maxPrice") && { label: `Up to $${params.get("maxPrice")}`, key: "maxPrice" },
    params.get("minRating") && { label: `${params.get("minRating")}★ & up`, key: "minRating" },
    params.get("prime") && { label: "Prime", key: "prime" },
    params.get("deals") && { label: "Deals", key: "deals" },
  ].filter(Boolean) as { label: string; key: string; value?: string }[];

  const content = <div className="space-y-6 text-sm">
    <div className="flex items-center justify-between"><h2 className="text-base font-bold">Filters</h2><button onClick={clearAll} className="text-xs text-amazon-link hover:underline">Clear all</button></div>
    <fieldset><legend className="mb-2 font-bold">Department</legend>{departments.map((department) => <label key={department} className="flex cursor-pointer items-center justify-between py-1 text-slate-700"><span>{department}</span><span className="ml-2 text-xs text-slate-500">{products.filter((product) => product.category === department).length}</span><input className="sr-only" type="radio" checked={currentCategory === department} onChange={() => update({ category: currentCategory === department ? null : department })} /></label>)}</fieldset>
    <fieldset><legend className="mb-2 font-bold">Customer Reviews</legend>{[4, 3, 2].map((rating) => <label key={rating} className="flex cursor-pointer items-center gap-2 py-1"><input type="radio" name="rating" checked={params.get("minRating") === String(rating)} onChange={() => update({ minRating: String(rating) })} /><span className="text-amazon-orange">{"★".repeat(rating)}<span className="text-slate-300">{"★".repeat(5 - rating)}</span></span><span>& up</span></label>)}</fieldset>
    <fieldset><legend className="mb-2 font-bold">Price</legend>{pricePresets.map((preset) => <button key={preset.label} onClick={() => { setMin(preset.min?.toString() ?? ""); setMax(preset.max?.toString() ?? ""); update({ minPrice: preset.min?.toString() ?? null, maxPrice: preset.max?.toString() ?? null }); }} className="block py-1 text-left text-amazon-link hover:underline">{preset.label}</button>)}<div className="mt-2 flex gap-1"><input value={min} onChange={(event) => setMin(event.target.value)} placeholder="Min" type="number" className="w-16 rounded border px-2 py-1" /><input value={max} onChange={(event) => setMax(event.target.value)} placeholder="Max" type="number" className="w-16 rounded border px-2 py-1" /><button onClick={applyPrice} className="rounded border px-2 py-1">Go</button></div></fieldset>
    <fieldset><legend className="mb-2 font-bold">Brand</legend>{brands.map((brand) => <label key={brand} className="flex items-center gap-2 py-1"><input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)} />{brand}</label>)}</fieldset>
    <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={params.get("prime") === "1"} onChange={(event) => update({ prime: event.target.checked ? "1" : null })} /> Prime eligible</label>
    <label className="flex items-center gap-2 font-medium"><input type="checkbox" checked={params.get("deals") === "1"} onChange={(event) => update({ deals: event.target.checked ? "1" : null })} /> Today&apos;s deals</label>
  </div>;

  return <><div className="mb-3 flex flex-wrap gap-2 lg:hidden"><button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded border bg-white px-3 py-2 text-sm font-medium"><SlidersHorizontal size={16} /> Filters</button></div>{chips.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{chips.map((chip) => <button key={`${chip.key}-${chip.value ?? ""}`} onClick={() => update({ [chip.key]: chip.key === "brand" ? selectedBrands.filter((item) => item !== chip.value).join(",") || null : null })} className="flex items-center gap-1 rounded-full bg-slate-200 px-3 py-1 text-xs">{chip.label}<X size={13} /></button>)}</div>}<aside className="hidden w-[250px] shrink-0 rounded border border-slate-200 bg-white p-4 lg:block">{content}</aside>{open && <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}><aside className="h-full w-[min(320px,88vw)] overflow-y-auto bg-white p-5" onClick={(event) => event.stopPropagation()}><button className="mb-4 flex items-center gap-2" onClick={() => setOpen(false)}><X size={18} /> Close</button>{content}</aside></div>}</>;
}
