"use client";

import { Check } from "lucide-react";
import type { Product } from "../types";
import BuyBox from "./BuyBox";

export default function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="contents">
      <section className="min-w-0">
        <p className="text-sm text-amazon-link">Visit the {product.brand ?? "Clone Store"} Store</p>
        <h1 className="mt-1 text-2xl font-medium leading-tight text-slate-900 sm:text-3xl">{product.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-amazon-orange" aria-label={`${product.rating} out of 5 stars`}>{"★".repeat(Math.round(product.rating))}</span>
          <span className="text-amazon-link">{product.rating.toFixed(1)}</span>
          <span className="text-amazon-link">{product.reviewCount.toLocaleString()} ratings</span>
        </div>
        {product.isBestSeller && <span className="mt-3 inline-block bg-amazon-navy-light px-2 py-1 text-xs font-bold text-white">#1 Best Seller</span>}
        <hr className="my-4 border-slate-200" />
        {product.isDeal && <p className="inline-block rounded-sm bg-amazon-red px-2 py-1 text-sm font-bold text-white">Limited time deal</p>}
        <div className="mt-2 text-3xl font-medium">${product.price.toFixed(2)}</div>
        {product.discount && <p className="text-sm text-slate-700">List Price: <span className="line-through">${product.discount.originalPrice.toFixed(2)}</span></p>}
        <p className="mt-2 text-sm text-slate-700">FREE Returns &nbsp; | &nbsp; <span className="font-semibold">Prime</span> FREE delivery</p>
        <ul className="mt-5 space-y-2 text-sm text-slate-800">
          {product.features.map((feature) => <li key={feature} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />{feature}</li>)}
        </ul>
        <h2 className="mt-7 border-b border-slate-300 pb-2 text-xl font-bold">Product information</h2>
        <table className="mt-2 w-full max-w-xl text-sm"><tbody>{Object.entries(product.specifications).map(([key, value]) => <tr key={key} className="border-b border-slate-200"><th className="w-1/3 bg-slate-50 px-3 py-2 text-left font-medium">{key}</th><td className="px-3 py-2">{value}</td></tr>)}</tbody></table>
        <p className="mt-6 leading-relaxed text-slate-700">{product.description}</p>
      </section>
      <BuyBox product={product} />
    </div>
  );
}
