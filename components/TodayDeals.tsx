"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { products } from "../data/products";
import ProductCard from "./ProductCard";

export default function TodayDeals() {
  const deals = products.filter((product) => product.isDeal).slice(0, 8);
  return <section className="mx-auto max-w-7xl px-4 py-8"><div className="mb-4 flex items-end justify-between"><div><h2 className="text-2xl font-bold">Today&apos;s Deals</h2><p className="text-sm text-slate-600">Limited-time savings picked for you</p></div><Link href="/deals" className="flex items-center text-sm font-semibold text-amazon-link hover:underline">See all deals <ChevronRight size={16} /></Link></div><div className="flex snap-x gap-4 overflow-x-auto pb-3">{deals.map((product) => <div key={product.id} className="snap-start"><ProductCard product={product} compact /></div>)}</div></section>;
}
