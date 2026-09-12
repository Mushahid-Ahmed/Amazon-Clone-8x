"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { openCartDrawer } from "./cart/CartDrawer";
import { useState } from "react";

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const [toast, setToast] = useState(false);
  const add = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart(product);
    openCartDrawer(product);
    setToast(true);
    window.setTimeout(() => setToast(false), 2200);
  };

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compact ? "w-[210px] shrink-0 sm:w-[230px]" : ""}`}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-slate-100">
        <Image src={product.images[0]} alt="" fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover transition-transform duration-300 group-hover:scale-105 group-hover:opacity-0" />
        <Image src={product.images[1]} alt="" fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover opacity-0 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100" />
        {product.discount && (
          <span className="absolute left-2 top-2 rounded bg-amazon-red px-2 py-1 text-xs font-bold text-white">
            {product.discount.percent}% off
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 min-h-10 text-sm font-medium text-amazon-link group-hover:text-amazon-red group-hover:underline">
        {product.title}
      </h3>
      <div className="mt-1 flex items-center gap-1 text-sm">
        <span className="text-amazon-orange" aria-label={`${product.rating} out of 5 stars`}>{"★".repeat(Math.round(product.rating))}</span>
        <span className="text-xs text-amazon-link">({product.reviewCount.toLocaleString()})</span>
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-900" aria-label={`$${product.price.toFixed(2)}`}>${product.price.toFixed(2)}</div>
      <button type="button" onClick={add} className="mt-3 rounded-full bg-amazon-yellow px-3 py-2 text-sm font-semibold hover:bg-amber-400">Add to Cart</button>
      {toast && <span className="toast-slide-in fixed bottom-5 right-5 z-50 rounded bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg">✓ Added to Cart: {product.title}</span>}
      {product.discount && <span className="text-xs text-slate-500 line-through">${product.discount.originalPrice.toFixed(2)}</span>}
      <div className="mt-auto pt-2 text-xs text-slate-600">
        {product.isPrime && <span className="font-bold text-sky-700">prime</span>}
        <span className={product.isPrime ? "ml-2" : ""}>FREE delivery {product.isPrime ? "tomorrow" : "on orders over $35"}</span>
      </div>
    </Link>
  );
}
