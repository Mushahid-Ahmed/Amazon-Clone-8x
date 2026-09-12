"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { useState } from "react";

export default function SearchResultItem({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const [toast, setToast] = useState(false);
  return (
    <article className="flex gap-4 border-b border-slate-200 bg-white p-4">
      <Link href={`/product/${product.id}`} className="relative h-36 w-36 shrink-0 overflow-hidden rounded bg-slate-100 sm:h-48 sm:w-48">
        <Image src={product.images[0]} alt="" fill sizes="(max-width: 640px) 144px, 192px" className="object-cover" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link href={`/product/${product.id}`} className="text-base font-medium text-amazon-link hover:text-amazon-red hover:underline sm:text-lg">{product.title}</Link>
        {product.brand && <p className="mt-0.5 text-xs text-slate-500">Brand: {product.brand}</p>}
        <div className="mt-1 flex items-center gap-2 text-sm"><span className="text-amazon-orange" aria-label={`${product.rating} out of 5 stars`}>{"★".repeat(Math.round(product.rating))}</span><span className="text-amazon-link">{product.reviewCount.toLocaleString()}</span></div>
        <div className="mt-2 text-2xl font-semibold" aria-label={`$${product.price.toFixed(2)}`}>${product.price.toFixed(2)}</div>
        {product.discount && <p className="text-xs text-slate-500"><span className="mr-2 line-through">${product.discount.originalPrice.toFixed(2)}</span><span className="font-semibold text-amazon-red">{product.discount.percent}% off</span></p>}
        <p className="mt-2 text-xs text-slate-600"><span className={product.isPrime ? "font-bold text-sky-700" : ""}>{product.isPrime ? "prime · " : ""}</span>FREE delivery {product.isPrime ? "tomorrow" : "on orders over $35"}</p>
        <p className={`mt-1 text-xs font-medium ${product.id.endsWith("7") ? "text-amazon-red" : "text-emerald-700"}`}>{product.id.endsWith("7") ? "Only 3 left in stock" : "In Stock"}</p>
        <button type="button" onClick={() => { addToCart(product); setToast(true); window.setTimeout(() => setToast(false), 2200); }} className="mt-3 rounded-full bg-amazon-yellow px-3 py-2 text-sm font-semibold hover:bg-amber-400">Add to Cart</button>
        {toast && <span className="toast-slide-in fixed bottom-5 right-5 z-50 rounded bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg">✓ Added to Cart: {product.title}</span>}
      </div>
    </article>
  );
}
