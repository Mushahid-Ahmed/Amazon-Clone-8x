"use client";

import { useStore } from "../context/StoreContext";
import ProductCard from "./ProductCard";

export default function RecentlyViewed() {
  const { recentlyViewed, hydrated } = useStore();
  if (!hydrated || recentlyViewed.length === 0) return null;
  return <section className="mx-auto max-w-7xl px-4 py-8"><h2 className="mb-4 text-2xl font-bold">Recently viewed</h2><div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{recentlyViewed.map((product) => <ProductCard key={product.id} product={product} />)}</div></section>;
}
