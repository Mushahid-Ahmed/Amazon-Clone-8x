"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "../types";

function priceParts(price: number) {
  const [dollars, cents] = price.toFixed(2).split(".");
  return { dollars, cents };
}

export default function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const { dollars, cents } = priceParts(product.price);

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group flex min-w-0 flex-col rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compact ? "w-[210px] shrink-0 sm:w-[230px]" : ""}`}
    >
      <div className="relative mb-3 aspect-square overflow-hidden rounded-md bg-slate-100">
        <Image src={product.images[0]} alt="" fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover transition-opacity duration-300 group-hover:opacity-0" />
        <Image src={product.images[1]} alt={product.title} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
      <div className="mt-2 flex items-start text-2xl font-semibold text-slate-900">
        <span className="mt-1 text-xs">$</span>
        <span>{dollars}</span>
        <sup className="mt-1 text-xs">{cents}</sup>
      </div>
      {product.discount && <span className="text-xs text-slate-500 line-through">${product.discount.originalPrice.toFixed(2)}</span>}
      <div className="mt-auto pt-2 text-xs text-slate-600">
        {product.isPrime && <span className="font-bold text-sky-700">prime</span>}
        <span className={product.isPrime ? "ml-2" : ""}>FREE delivery {product.isPrime ? "tomorrow" : "on orders over $35"}</span>
      </div>
    </Link>
  );
}
