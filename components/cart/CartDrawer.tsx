"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "../../types";
import { useStore } from "../../context/StoreContext";

export const CART_DRAWER_EVENT = "amazon-clone:cart-drawer";

export function openCartDrawer(product?: Product) {
  window.dispatchEvent(new CustomEvent(CART_DRAWER_EVENT, { detail: product }));
}

export default function CartDrawer() {
  const { cart, cartSubtotal, cartItemCount, updateCartQuantity } = useStore();
  const [open, setOpen] = useState(false);
  const [justAdded, setJustAdded] = useState<Product | null>(null);

  useEffect(() => {
    const onCartEvent = (event: Event) => {
      const product = (event as CustomEvent<Product | undefined>).detail;
      if (product) setJustAdded(product);
      setOpen(true);
    };
    window.addEventListener(CART_DRAWER_EVENT, onCartEvent);
    return () => window.removeEventListener(CART_DRAWER_EVENT, onCartEvent);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) setJustAdded(null);
  }, [open]);

  return (
    <div className={`fixed inset-0 z-50 ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button type="button" aria-label="Close cart" onClick={() => setOpen(false)} className={`absolute inset-0 bg-slate-950/50 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
      <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-label="Shopping cart">
        <div className="flex items-center justify-between bg-amazon-navy px-5 py-4 text-white">
          <h2 className="flex items-center gap-2 text-lg font-bold"><ShoppingCart size={21} /> Shopping Cart</h2>
          <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-white/10" aria-label="Close cart"><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {justAdded && (
            <div className="mb-5 flex gap-3 rounded border border-emerald-200 bg-emerald-50 p-3 text-sm">
              <div className="relative h-14 w-14 shrink-0"><Image src={justAdded.images[0]} alt="" fill sizes="56px" className="rounded object-cover" /></div>
              <p><strong className="block text-emerald-800">Added to cart</strong><span className="line-clamp-2 text-slate-700">{justAdded.title}</span></p>
            </div>
          )}
          {cart.length === 0 ? (
            <div className="py-12 text-center text-slate-600"><ShoppingCart className="mx-auto mb-3 text-slate-400" size={42} /><p>Your cart is empty.</p></div>
          ) : (
            <ul className="space-y-5">
              {cart.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-3 border-b border-slate-200 pb-5">
                  <div className="relative h-20 w-20 shrink-0"><Image src={product.images[0]} alt={product.title} fill sizes="80px" className="rounded object-cover" /></div>
                  <div className="min-w-0 flex-1"><Link href={`/product/${product.id}`} onClick={() => setOpen(false)} className="line-clamp-2 text-sm text-amazon-link hover:underline">{product.title}</Link><p className="mt-1 font-bold">${product.price.toFixed(2)}</p><div className="mt-2 flex items-center rounded border border-slate-300 w-fit"><button type="button" className="p-1.5 disabled:opacity-40" disabled={quantity <= 1} onClick={() => updateCartQuantity(product.id, quantity - 1)} aria-label="Decrease quantity"><Minus size={14} /></button><span className="min-w-7 text-center text-sm">{quantity}</span><button type="button" className="p-1.5 disabled:opacity-40" disabled={quantity >= 10} onClick={() => updateCartQuantity(product.id, quantity + 1)} aria-label="Increase quantity"><Plus size={14} /></button></div></div>
                  <span className="text-right font-bold">${(product.price * quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 p-5">
          <div className="mb-4 flex justify-between text-lg"><span>Subtotal ({cartItemCount} items):</span><strong>${cartSubtotal.toFixed(2)}</strong></div>
          <Link href="/checkout" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-full bg-amazon-orange px-4 py-3 font-semibold hover:bg-orange-500">Proceed to checkout <ArrowRight size={17} /></Link>
          <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-sm text-amazon-link hover:underline">View cart</Link>
        </div>
      </aside>
    </div>
  );
}
