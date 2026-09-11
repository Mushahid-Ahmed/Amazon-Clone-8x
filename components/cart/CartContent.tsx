"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useStore } from "../../context/StoreContext";

export default function CartContent() {
  const router = useRouter();
  const { cart, savedItems, cartSubtotal, cartItemCount, updateCartQuantity, removeFromCart, saveForLater, removeSavedItem, moveSavedToCart } = useStore();
  const qualifies = cartSubtotal >= 35;
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-5 text-3xl font-bold">Shopping Cart</h1>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          {cart.length === 0 ? (
            <section className="rounded-lg border border-slate-300 bg-white p-10 text-center">
              <h2 className="text-xl font-bold">Your Amazon Clone Cart is empty</h2><p className="mt-2 text-slate-600">Add products from the store to see them here.</p><Link href="/" className="mt-5 inline-block rounded-full bg-amazon-yellow px-6 py-2 font-medium hover:bg-amber-400">Continue shopping</Link>
            </section>
          ) : <section className="rounded-lg border border-slate-300 bg-white p-5"><h2 className="mb-4 text-xl font-bold">Cart ({cartItemCount} items)</h2><ul className="divide-y divide-slate-200">{cart.map(({ product, quantity }) => <li key={product.id} className="flex gap-4 py-5 first:pt-0"><div className="relative h-28 w-28 shrink-0 sm:h-36 sm:w-36"><Image src={product.images[0]} alt={product.title} fill sizes="(max-width: 640px) 112px, 144px" className="rounded object-cover" /></div><div className="min-w-0 flex-1"><Link href={`/product/${product.id}`} className="font-medium text-amazon-link hover:underline">{product.title}</Link><p className="mt-1 text-sm text-emerald-700">In Stock · FREE delivery</p><p className="mt-2 text-lg font-bold">${product.price.toFixed(2)}</p><div className="mt-3 flex flex-wrap items-center gap-3 text-sm"><div className="flex items-center rounded border border-slate-300"><button type="button" disabled={quantity <= 1} onClick={() => updateCartQuantity(product.id, quantity - 1)} className="p-2 disabled:opacity-40" aria-label="Decrease quantity"><Minus size={15} /></button><span className="min-w-8 text-center">{quantity}</span><button type="button" disabled={quantity >= 10} onClick={() => updateCartQuantity(product.id, quantity + 1)} className="p-2 disabled:opacity-40" aria-label="Increase quantity"><Plus size={15} /></button></div><button type="button" onClick={() => removeFromCart(product.id)} className="text-amazon-link hover:underline"><Trash2 size={14} className="mr-1 inline" />Delete</button><button type="button" onClick={() => { saveForLater(product); removeFromCart(product.id); }} className="text-amazon-link hover:underline">Save for later</button></div></div><strong className="text-right text-lg">${(product.price * quantity).toFixed(2)}</strong></li>)}</ul></section>}
          {savedItems.length > 0 && <section className="rounded-lg border border-slate-300 bg-white p-5"><h2 className="mb-3 text-xl font-bold">Saved for later ({savedItems.length} items)</h2><ul className="divide-y divide-slate-200">{savedItems.map((product) => <li key={product.id} className="flex gap-4 py-4 first:pt-0"><div className="relative h-24 w-24 shrink-0"><Image src={product.images[0]} alt={product.title} fill sizes="96px" className="rounded object-cover" /></div><div className="flex-1"><Link href={`/product/${product.id}`} className="text-amazon-link hover:underline">{product.title}</Link><p className="my-1 font-bold">${product.price.toFixed(2)}</p><div className="flex gap-4 text-sm"><button type="button" onClick={() => moveSavedToCart(product.id)} className="text-amazon-link hover:underline">Move to cart</button><button type="button" onClick={() => removeSavedItem(product.id)} className="text-amazon-link hover:underline">Delete</button></div></div></li>)}</ul></section>}
        </div>
        <aside className="h-fit rounded-lg border border-slate-300 bg-white p-5 lg:sticky lg:top-4"><p className={`mb-4 flex items-center gap-2 text-sm ${qualifies ? "text-emerald-700" : "text-slate-600"}`}>{qualifies && <Check size={17} />}{qualifies ? "Your order qualifies for FREE Shipping" : `Add $${Math.max(0, 35 - cartSubtotal).toFixed(2)} to qualify for FREE Shipping`}</p><div className="flex justify-between text-lg"><span>Subtotal ({cartItemCount} items):</span><strong>${cartSubtotal.toFixed(2)}</strong></div><button type="button" disabled={cart.length === 0} onClick={() => router.push("/checkout")} className="mt-5 w-full rounded-full bg-amazon-yellow px-4 py-3 font-medium hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">Proceed to checkout</button><p className="mt-4 flex gap-2 border-t border-slate-200 pt-4 text-xs text-slate-600"><ShieldCheck size={16} className="shrink-0" /> Secure payments and easy returns.</p></aside>
      </div>
    </div>
  );
}
