"use client";

import { Check, LockKeyhole, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "../types";
import { useStore } from "../context/StoreContext";
import { openCartDrawer } from "./cart/CartDrawer";

export default function BuyBox({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const inStock = true;

  function add() {
    addToCart(product, quantity);
    openCartDrawer(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2500);
  }

  return (
    <aside className="rounded-lg border border-slate-300 bg-white p-5 shadow-sm lg:sticky lg:top-4">
      <div className="text-2xl font-medium text-slate-900">${product.price.toFixed(2)}</div>
      <p className="mt-1 text-sm text-slate-600">FREE Returns</p>
      <p className="mt-2 text-sm text-slate-700">
        {product.isPrime ? <span className="font-bold text-sky-700">prime</span> : null} FREE delivery{" "}
        <strong>tomorrow</strong>
      </p>
      <p className="mt-3 text-sm font-medium text-emerald-700">{inStock ? "In Stock" : "Currently unavailable"}</p>
      <div className="mt-4 flex items-center gap-3">
        <span className="text-sm font-medium">Qty:</span>
        <div className="flex items-center rounded border border-slate-300">
          <button type="button" className="p-2 disabled:opacity-40" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity === 1} aria-label="Decrease quantity"><Minus size={16} /></button>
          <span className="min-w-8 text-center text-sm" aria-label={`Quantity: ${quantity}`}>{quantity}</span>
          <button type="button" className="p-2 disabled:opacity-40" onClick={() => setQuantity((value) => Math.min(10, value + 1))} disabled={quantity === 10} aria-label="Increase quantity"><Plus size={16} /></button>
        </div>
      </div>
      <button type="button" onClick={add} disabled={!inStock} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-amazon-yellow px-4 py-2.5 font-medium hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
        {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        {added ? "Added to cart" : "Add to Cart"}
      </button>
      <button type="button" onClick={() => { addToCart(product, quantity); router.push("/checkout"); }} disabled={!inStock} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-amazon-orange px-4 py-2.5 font-medium hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-50">
        <Zap size={18} /> Buy Now
      </button>
      <p className="mt-5 flex items-center gap-2 text-xs text-slate-600"><LockKeyhole size={14} /> Secure transaction</p>
      <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">Ships from and sold by Clone Store.</p>
    </aside>
  );
}
